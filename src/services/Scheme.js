import '#lib/prototype'
import APP from '#services/APP'
import API from '#services/API'
import Axios from 'axios'

class Scheme {
  constructor() {
    if (!this.Class.initialized) {
      if (!this.Class.installed) {
        throw new Error('Not installed class ' + this.Class.name + ': Add the required "static { this.install() }" to the Class ' + this.Class.name)
      } else {
        throw new Error('Uninitialized class ' + this.Class.name + ': Use the model loader: "import { ' + this.Class.name + ' } from \'models\'"')
      }
    }
    return this
  }

  #uid
  #parent
  #data = {}
  #filling = false
  #commits = []
  #listeners = {}
  #removed = false
  #formObject = undefined
  #fields = undefined

  get [Symbol.toStringTag]() {
    return 'Object'
  }

  get Class() {
    return this.constructor.Class || this.constructor
  }

  get uid() {
    return this.Class.name + '#' + this.#uid
  }

  get $searchText() {
    return this.toString()
  }

  get $commits() {
    return this.#commits
  }

  get $parent() {
    return this.#parent
  }

  get $removed() {
    return this.#removed
  }

  get $fields() {
    // if (!this.#parent) throw new Error('Only Form object have fields')
    if (this.#fields) return this.#fields
    const self = this

    this.#fields = Object.fromEntries(this.Class.fields.map(field => [field.key, {
      field,
      get hidden() {
        return typeof field.hidden === 'function' ? field.hidden(self) : !!field.hidden
      },
      errors: []
      // bind: {hint, visible, ...}, // TODO: ? Bind field computeds functions here as getters to use directly in the components template
    }]))
    return this.#fields
  }

  mount(input, callback) {
    const Class = this.Class

    if (Class.contructorParam && input !== undefined) {
      input = {[Class.contructorParam.key]: input}
    }

    const data = typeof input === 'object' ? input : undefined
    const dataId = data ? data.id : input
    const id = typeof dataId === 'number' ? dataId.toString() : dataId

    if (data && Scheme.isScheme(data)) {
      if (Class.config.freeze) {
        this.#parent = data
      } else {
        data.#parent = data
        return data
      }
    }
    if (id && !this.#parent) {
      const exist = Class.cache.find(instance => instance.id === id)
      if (exist) {
        return data ? exist.fill(data, true) : exist // review: simplify calling only fill
      }
    }

    Class.counter++
    this.#uid = Class.counter

    Object.defineProperties(this, Class.descriptors) // review
    if (!this.#parent) Class.all.push(this)

    if (id) this.id = id

    const parsedData = Scheme.isScheme(data) ? data.parse() : data
    this.fill(parsedData, true)
    const instance = Object.seal(window.$Vue ? window.$Vue.observable(this) : this)

    if (callback) callback.call(instance, instance)
    return instance
  }

  fill(input = {}, overwrite) {
    const Class = this.Class

    if (typeof input !== 'object') throw new Error('Mue.fill() input need to be a object, at ' + this.toId())
    // if (Scheme.isScheme(input)) throw new Error('Mue.fill() input can´t be a Scheme instance, at ' + this.toId())

    // console.log('fill', this.#parent ? 'form' : 'entity', input, overwrite)

    if (!this.id && input.id) this.id = input.id.toString()

    this.#filling = true
    for (const propName in Class.data) {
      const snakeCasedPropName = propName.toSnakeCase()
      const inputPropName = (input.hasOwnProperty(propName) && propName) || (input.hasOwnProperty(snakeCasedPropName) && snakeCasedPropName)
      const value = inputPropName ? input[inputPropName] : undefined
      const isNull = value === null || value === undefined
      if (!isNull) {
        // if (Scheme.isScheme(input) && Scheme.isScheme(value) && !value.id) {
          // this[propName] = new value.Class(value.Class.contructorParam ? value.value : value.parse())
        // } else {
        // console.log('---> fill prpp:', propName, value)
          this[propName] = value // Scheme.parse(value)
        // }
      } else if (overwrite) {
        const propConfig = Class.data[propName]
        if (propConfig.hasOwnProperty('default')) {
          this[propName] = typeof propConfig.default === 'function' ? propConfig.default.call(this) : propConfig.default
        } else if (propConfig.multiple) {
          this[propName] = []
        }
      }
    }
    this.#filling = false

    this.notify()

    return this
  }

  relationship(descriptor, input) {
    const contructorParam = descriptor.class.length === 1 && descriptor.class[0].contructorParam
    let instance

    if (Scheme.isScheme(input)) {
      instance = input
    } else if (contructorParam) {
      const Class = descriptor.class[0]
      instance = new Class(input)
    } else if (!input.id) {
      const Class = descriptor.class[0] // review
      instance = new Class(input)
    } else if (descriptor.metadata) {
      instance = Scheme.resolve(input, true)
    } else {
      instance = Scheme.resolve(input)
    }

    // this.log('relationship', {descriptor, input, instance})

    if (!descriptor.class.includes(instance.Class)) {
      console.warn('Invalid relationship class for ' + this.toId() + '[' + descriptor.key + ']: ' + instance.Class.name)
    }

    return instance
  }

  parse() {
    // TODO: Avoid to transform no-id entities to handle as metadata
    const parsed = Object.transform(this, prop => {
      if (Object.keys(this.Class.schema).includes(prop.key) || prop.key === 'id' || prop.key === 'type') {
        if (typeof prop.value === 'object' && prop.value.constructor.name === 'Date') prop.value = prop.value.toUTCString()

        const stringified = Scheme.stringify(prop.value, this.Class.data[prop.key]?.metadata)
        prop.value = stringified ? JSON.parse(stringified) : undefined
        return prop
      }
    })

    if (this.Class.name === 'File' && window.schemeSaveFilesFlag) parsed.contents = this.contents

    return parsed
  }

  getFormObject() {
    const Class = this.Class
    // if (!Class.config.freeze) throw new Error('Generate Form object not available for not frozen instances, at' + this.toId())
    if (this.#parent && !this.#formObject) throw new Error('Generate Form object not available for already Form instances, at' + this.toId())
    if (!this.#formObject) {
      this.#formObject = new Class.FormClass(this)
    } else {
      // this.#formObject.reset()
    }
    return this.#formObject
  }

  apply(payload) {
    if (!this.#parent) {
      // throw new Error('Only Form object can apply')
      this.fill(payload)
    } else {
      if (!payload) payload = this.getMutation()
      this.#parent.fill(payload)
      return this.reset()
    }
  }

  reset() {
    if (!this.#parent) throw new Error('Only Form object can reset')
    return this.fill(this.#parent.parse())
  }

  /*
  get(params) {
    return this.Class.get(this.id, params)
  }
  */

  async create(payload) {
    if (!payload) payload = this
    console.log('Making PUT', payload)
    if (this.Class.sqlite) {
      const table = 'api-users'
      const response = await API.put(`sqlite/${table}/`, { payload: JSON.stringify(payload) }, {
        headers: {
        'Content-Type': 'multipart/form-data'
        }
      })
      const lastID = response.data.lastID
      if (!lastID) throw new Error('No lastId')
      console.log('PUT response', response)
      payload.id = lastID
    } else {
      payload.id = Scheme.UidIndex++
    }
    return this.apply(payload)
  }

  async update(payload) {
    if (!payload) payload = this
    console.log('Making PATCH', this, payload)
    if (this.Class.sqlite) {
      payload.id = this.id
      const table = 'api-users'
      const response = await API.patch(`sqlite/${table}/` + this.id, { payload: JSON.stringify(payload) }, {
        headers: {
        'Content-Type': 'multipart/form-data'
        }
      })
      console.log('PATCH response', response)
    }
    return this.apply(payload)

    // TODO: prepare outside implementation
    // TODO: extract
    /* *
    const endpoint = [Class.endpoint, this.id].pathJoin()
    return API.put(endpoint, payload).then(response => {
      Scheme.populate(response.data, response.data.includes)
      this.reset()
    })
    /* */
  }

  async delete() {
    if (this.#parent && !this.#formObject) throw new Error('Form object can not delete directly')
    // if (!this.id) throw new Error('Can´t delete no-id entity')

    console.log('Making DELETE', this)
    if (this.Class.sqlite) {
      const table = 'api-users'
      const response = await API.delete(`sqlite/${table}/` + this.id)
      console.log('DELETE response', response)
    }
    this.#removed = true
    // TODO: review and remove, implement outside
    // TODO, remove from caché.
  }

  getMutation() {
    if (!this.#parent) throw new Error('Only Form object can save')
    const parsed = this.parse()
    // if (this.id) {
      const payload = {}
      for (const propName in parsed) {
        if (Scheme.stringify(this.#parent[propName]) !== Scheme.stringify(this[propName])) {
          // const snakeCasedPropName = propName.toSnakeCase()
          payload[propName] = parsed[propName]
        }
      }
      if (Object.keys(payload).length === 0) {
        return undefined
      } else {
        return payload
      }
    // } else {
    //   return parsed
    // }
  }

  async save() {
    if (!this.#parent) throw new Error('Only Form object can save')
    window.schemeSaveFilesFlag = true
    const payload = this.getMutation()
    window.schemeSaveFilesFlag = false
    if (this.id) {
      if (!payload) {
        console.info('· No changes', this)
        return Promise.resolve()
      } else {
        console.info('· saved!', this, payload)
        return await this.update(payload)
      }
    } else {
      console.info('· creating', this)
      return await this.create(payload)
    }
  }

  addEventListener(eventName, listener, config = {}) {
    this.#listeners[eventName] = this.#listeners[eventName] || new Map()
    this.#listeners[eventName].set(listener, config)
  }

  removeEventListener(eventName, listener) {
    if (this.#listeners[eventName]) this.#listeners[eventName].delete(listener)
  }

  dispatchEvent(eventName) {
    if (!this.#listeners.hasOwnProperty(eventName)) return

    this.#listeners[eventName].forEach((config, listener) => {
      listener.call(this, {type: eventName, target: this})
      if (config.once) this.removeEventListener(eventName, listener)
    })
  }

  notify(eventName, value, silent) { // TODO review silent, not necessary
    if (eventName) {
      if (APP.isDevelopment) this.commit(eventName, value, this.#filling)
      const listenerName = 'on' + eventName.capitalize()
      const listener = this.Class.listeners[listenerName]
      if (listener) listener.call(this, value)
      this.dispatchEvent(eventName)
    } else {
      if (APP.isDevelopment) this.commit('endFill')
    }

    if (!this.#filling) {
      // this.log('notify')
      if (this.Class.listeners.onChange && eventName) { // Only when edit something, not on fill
        this.Class.listeners.onChange.call(this, eventName, value)
      }

      this.dispatchEvent('notify')
      if (!silent && this.__ob__) this.__ob__.dep.notify()
    }
  }

  once(eventName, handler) {
    this.addEventListener(eventName, handler, {once: true})
    return handler
  }

  on(eventName, handler) {
    this.addEventListener(eventName, handler)
    return handler
  }

  off(eventName, handler) {
    this.removeEventListener(eventName, handler)
  }

  commit(eventName, value, isFilling) {
    this.#commits.push({
      eventName: (isFilling ? 'fill:' : '') + eventName,
      value,
      status: this.parse(),
      stack: new Error('commit stack')
    })
  }

  toString() {
    return this.getLabel()
  }

  toId() {
    return this.Class.name + '[' + (this.id ?? '') + ']'
  }

  getLabel() {
     return this.name || this.title || this.label || this.value || this.description || this.toId()
  }

  warn(message, ...params) {
    console.warn(message + ' at ' + this.toId(), ...params)
  }

  log(message, ...params) {
    console.log(message + ' at ' + this.toId(), ...params)
  }

  static models = {}
  static UidIndex = 0

  /*
  static require(className) {
    require('./' + className).default // eslint-disable-line no-unused-expressions
  }
  */

  static resolve(input = {}, fill) {
    // console.log('resolve', input, fill)
    if (Scheme.isScheme(input)) return input
    if (!input.id) throw new Error('Missing id value')
    if (!input.type) throw new Error('Missing type value')
    const className = input.type
    const Class = Scheme.models[className]
    if (!Class) throw new Error('Uninitialized class: ' + className)

    return new Class(fill ? input : input.id)
  }

  static stringify(input, metadata) {
    return JSON.stringify(input, (key, value) => {
      if (Scheme.isScheme(value)) {
        if (value.Class.contructorParam) {
          return value.value
        } else if (metadata) {
          return value.parse()
        } else {
          return { id: value.id, type: value.Class.name }
        }
      }
      return value
    })
  }

  static install() {
    const Class = this
    Class.installed = true
    Scheme.models[Class.name] = Class
  }

  static initializeFields() {
    const Class = this
    if (Class === Scheme) {
      const models = Object.values(Scheme.models)

      const fieldsets = Scheme.models.Fieldset.cache
      models.forEach(Class => {
        const fieldset = fieldsets.find(fieldset => fieldset.name === Class.name) || new Scheme.models.Fieldset({id: Scheme.UidIndex++, name: Class.name})
        fieldset.model = Class
        Object.values({...Class.data, ...Class.computed}).map(fieldConfig => {
          // console.log('---->>>>>>>', fieldConfig.key)
          const exist = fieldset.fields.find(fieldsetField => {
            // console.log('---->>> >> >>', fieldsetField.key)
            return fieldsetField.key === fieldConfig.key
          })
          // console.log('new field for', {fieldConfig, exist, fieldset})
          const field = exist || new Scheme.models.Field(Scheme.UidIndex++)
          field.model = Class

          // console.log('set fieldser', field, fieldset)
          if (!exist) {
            // console.log('not exist')
            fieldset.fields.push(field)
          }
          field.fill(fieldConfig)
          field.component = fieldConfig.component
          // User.fields.name.label
          const fieldsetTranslations = APP.databases.translations.collections.fieldsets.data
          const fieldTranslation = fieldsetTranslations.find(translation => translation.dotText === `${Class.name}.fields.${field.key}.label`)
          if (!fieldTranslation) {
            const dotText = `${Class.name}.fields.${field.key}.label`
            fieldsetTranslations.push(new Scheme.models.Translation({id: Scheme.UidIndex++, dotText}))
          }

          field.fieldset = fieldset
          return field
        })
        Class.fieldset = fieldset
      })
    }
  }

  static get fields() {
    return this.fieldset ? this.fieldset.fields : undefined
  }

  static initialize() {
    const Class = this

    if (Class === Scheme) {
      const models = Object.values(Scheme.models)
      models.forEach(Class => Class.initialize())
      return
    }

    if (Class.initialized) throw new Error('Can not reinitialize the class: ' + Class.name)
    Class.initialized = true

    const protoDescriptors = Object.getOwnPropertyDescriptors(Class.prototype)
    const configDefaults = {
      freeze: true
    }

    Class.cache = []
    Class.all = []
    Class.counter = 0
    Class.schema = Class.schema()
    Class.config = Object.assign(configDefaults, Class.config || {})
    Class.relationships = {}
    Class.computed = Class.computed?.() || {}
    Class.computedReadonly = []
    Class.descriptors = {}
    /*
    const data = Class.data?.() || {}
    for (const propName in data) {
      if (Class.schema[propName]) throw new Error('Scheme duplicated property ' + Class + '[' + propName + ']')
    }
    */

    const i18nProps = {}
    for (const propName in Class.schema) {
      const propConfig = Class.schema[propName]
      if (propConfig.i18n) {
        i18nProps[propName + 'EN'] = {...propConfig}
        i18nProps[propName + 'ES'] = {...propConfig}
        delete Class.schema[propName]
        Class.descriptors[propName] = {
          configurable: true,
          enumerable: true,
          get() {
            return this[propName + APP.language]
          },
          set(value) {
            this[propName + APP.language] = value
          }
        }
      }
    }
    Object.assign(Class.schema, i18nProps)

    Class.data = { ...Class.schema } // { ...Class.schema, ...data } // REVIEW: remove data?

    Class.methods = []
    Class.listeners = Class.listeners || {}
    Class.plural = Scheme.pluralize(Class.name)
    Class.endpoint = Class.endpoint || Class.plural

    Class.descriptors.id = {
      configurable: true,
      enumerable: true,
      get() {
        return this.#data.id
      },
      set(value) {
        if (this.#data.id) throw new Error('Instance ids are inmutable, at ' + this.toId())
        this.#data.id = value
        if (value && !this.#parent) {
          // if (Class.name === 'Fieldset') console.log('------- setting id', value, Class.cache.length)
          Class.cache.push(this)
        }
      }
    }

    /* */
    Class.descriptors.type = {
      configurable: true,
      enumerable: true,
      get() {
        return this.Class.name
      },
      set() {
        throw new Error('Instance type are inmutable, at ' + this.toId())
      }
    }
    /* */

    for (const propName in Class.data) {
      const descriptor = protoDescriptors[propName] || {}
      const propConfig = Class.data[propName]

      if (descriptor.set && !descriptor.get) {
        throw new Error('Scheme properties needs a getter if has a setter, at ' + Class + '[' + propName + ']')
      }

      propConfig.key = propName
      if (propConfig.constructor === true) Class.contructorParam = propConfig
      if (propConfig.class && !Array.isArray(propConfig.class)) propConfig.class = [propConfig.class]
      if (propConfig.class) Class.relationships[propName] = propConfig

      Class.descriptors[propName] = {
        configurable: true,
        enumerable: true,
        get() {
          if (descriptor.get) {
            return descriptor.get.call(this)
          } else {
            return this.#data[propName]
          }
        },
        set(value) {
          const currentValue = this.#data[propName]
          const isFrozen = Class.config.freeze && !this.#parent && !this.#filling
          if (isFrozen && this.id) throw new Error('Non writable prop, instances is frozen, at ' + this.toId() + '[' + propName + ']')

          if (propConfig.class) {
            if (value) {
              // console.log('setter multiple', propName, value)
              if (propConfig.multiple) {
                if (!Array.isArray(value)) throw new Error('Relationship multiple must be Array, at ' + this.toId() + '[' + propName + ']')
                value = value.map(entry => this.relationship(propConfig, entry))
              } else {
                value = this.relationship(propConfig, value)
              }
            }
          }

          if (descriptor.set) {
            descriptor.set.call(this, value)
          } else {
            if (descriptor.get) throw new Error('Non writable prop, at ' + this.toId() + '[' + propName + '] = ' + value)

            // TODO: Review, need te inverse operation on parse...
            // TODO: maybe move up to share the typed value when we have descript.set()
            const isNull = value === undefined || value === null
            if (propConfig.type === Number && !isNull && value.constructor !== Number) {
              value = Number(value)
            } else if (propConfig.type === Date && value.constructor !== Date) {
              value = new Date(value)
            }

            if (propConfig.validate && Class.fields) {
              this.$fields[propName].errors = undefined
              const checks = propConfig.validate.map(validation => validation.check(value))
              const errors = checks.filter(message => message)
              this.$fields[propName].errors = errors
              if (errors) {
                // console.log('ERRORS!', errors)
              }
            }

            this.#data[propName] = value
          }

          this.notify(propName, currentValue, value)
        }
      }
    }

    for (const propName in protoDescriptors) {
      if (propName === 'constructor' || propName === 'id' || Class.data[propName]) continue

      const descriptor = protoDescriptors[propName]

      if (typeof descriptor.value === 'function') {
        Class.methods.push(propName)
        const methodHandler = function(...args) {
          const result = descriptor.value.call(this, ...args)
          // this.notify(propName, args, true)
          return result
        }
        Class.descriptors[propName] = {
          configurable: true,
          enumerable: false,
          get() {
            return methodHandler
          },
          set(value) {
            throw new Error('Methods can not be overwriten, at ' + this.toId() + '[' + propName + '] = ' + value)
          }
        }
      } else {
        const propConfig = Class.computed[propName] = Class.computed[propName] || {}
        propConfig.key = propName
        if (propConfig.class && !Array.isArray(propConfig.class)) propConfig.class = [propConfig.class]
        if (propConfig.class) Class.relationships[propName] = propConfig

        if (!descriptor.get) throw new Error('Computed needs a getter, at ' + Class.name + '[' + propName + ']')
        if (!descriptor.set) Class.computedReadonly.push(propName)
      }
    }

    // Object.defineProperties(Class.prototype, Class.descriptors)
    // console.log('define class props', {descriptors: Class.descriptors, prototype: Class.prototype})

    const FormClassName = 'Form' + Class.name
    const FormClass = new Function('Class', 'return class ' + FormClassName + ' extends Class { constructor(data) { return super(data) } }')(Class) // eslint-disable-line no-new-func
    FormClass.Class = Class
    Class.FormClass = FormClass
  }

  static populate(input, includes) {
    if (includes) {
      includes.forEach(include => Scheme.resolve(include, true))
    }
    if (Array.isArray(input)) {
      return input.map(input => Scheme.resolve(input, true))
    } else {
      return Scheme.resolve(input, true)
    }
  }

  /*

  static fetchEntityHandler(endpoint, params = {}) {
    // TODO: review and remove, implement outside
    return API.get(endpoint, {params})
  }

  static fetchEntitiesHandler(endpoint, params = {}) {
    // TODO: review and remove, implement outside
    return API.get(endpoint, {params})
  }

  static fetchEntityParser(payload) {
    // TODO: review and remove, implement outside
    const entity = Scheme.populate(payload.data, payload.data.includes)
    return entity
  }

  static fetchEntitiesParser(payload) {
    // TODO: review and remove, implement outside
    const list = Scheme.populate(payload.data.entries, payload.data.includes)
    list.totalEntries = payload.data.total_entries // || list.length
    return list
  }

  static fetchEntity(endpoint, params = {}) { // private?
    const Class = this
    return Class.fetchEntityHandler(endpoint, params).then(payload => Class.fetchEntityParser(payload))
  }

  static fetchEntities(endpoint, params = {}) {
    const Class = this
    return Class.fetchEntitiesHandler(endpoint, params).then(payload => Class.fetchEntitiesParser(payload))
  }

  static retrieve(id, params = {}) {
    const Class = this
    if (!id) throw new Error('Scheme.get requires an id, received "' + id + '"')
    const endpoint = [Class.endpoint, id].pathJoin()
    return Class.fetchEntity(endpoint, params)
  }

  static supply(classes) {
    // TODO: replace offline using rewriting methods
    classes = Array.isArray(classes) ? classes : [classes]
    const cacheHandlers = classes.map(Class => {
      return Class.fetchEntitiesHandler(Class.endpoint, Class.cachingParams).then(payload => () => Class.fetchEntitiesParser(payload))
    })
    return Promise.all(cacheHandlers).then(handlers => handlers.forEach(handler => handler()))
  }

  static searchIn(searchText, collection) {
    const Class = this
    if (!collection) {
      if (!Class.cache) throw new Error('Scheme.searchIn needs a collection param')
      collection = Class.cache
    }
    const filter = searchText && searchText.length > 0
    return !filter ? collection : collection.filter(item => item.$searchText.toLowerCase().includes(searchText.toLowerCase()))
  }

  /* TODO: review and remove
  static search(searchText, params) {
    const Class = this
    return API.get(Class.endpoint, {params: {q: searchText, expand: 'title, title_group', ...params}}).then(response => {
      const entries = response.data.entries.map(entry => entry.title)
      return Scheme.populate(entries, response.data.includes)
    })
  }
  */

  static plurals = []

  static singularize(string) {
    const exist = Scheme.plurals.find(entry => entry[1] === string)
    return exist ? exist[0] : string.replace(/ies$/, '').replace(/s$/, '')
  }

  static pluralize(string) {
    const exist = Scheme.plurals.find(entry => entry[0] === string)
    return exist ? exist[1] : (string.replace(/y$/, 'ie') + 's')
  }

  static isScheme(input) {
    return Scheme.prototype.isPrototypeOf(input)
  }

  static toString() {
    return this.name.toSpaces().capitalize()
  }
}

// For fundamental checks on runtime when working on Scheme library
class SchemeTest extends Scheme {
  constructor(data) {
    return super().mount(data)
  }

  #private = 'secret'
  #ons = []

  get computedProp() {
    return '_' + this.code
  }

  set computedProp(value) {
    this.code = ':' + value
  }

  get computedReadonly() {
    return 'readOnly!'
  }

  get checksum() {
    return this.#ons.join()
  }

  setPrivate(param) {
    this.#private = param
  }

  getPrivate() {
    return this.#private
  }

  static test(showSucces = true) {
    const block = (title, block) => block((msg) => {
      const error = new Error(title + ', ' + msg)
      const stack = error.stack.split('\n')
      stack.splice(1, 1)
      error.stack = stack.join('\n')
      throw error
    })
    const noError = new Error('noError')
    const eventCalls = []

    const mueTest = window.mueTest = new SchemeTest()

    mueTest.once('notify', () => {
      eventCalls.push('notify')
    })

    block('Basic initialization', error => {
      if (mueTest.name !== 'Name') error('Prop default literal initialization')
      if (mueTest.code !== 12345) error('Prop default lambda initialization')
      if (mueTest.id !== undefined) error('Prop id initialization')
      if (mueTest.computedProp !== '_12345') error('Read computed')

      if (mueTest.getPrivate() !== 'secret') error('Method reading private prop')
      if (mueTest.setPrivate('resecret') && mueTest.getPrivate() !== 'resecret') error('Method writing private prop')

      mueTest.code = 123
      if (mueTest.code !== 123) error('Writing prop')
      if (mueTest.computedProp !== '_123') error('Read computed after change related prop')

      mueTest.computedProp = 'test'
      if (mueTest.code !== ':test') error('Writing computed')
    })

    block('Event handling', error => {
      try {
        mueTest.computedReadonly = 'crash'
        throw noError
      } catch (error) {
        if (error === noError) error('Writing readonly computed')
      }
      if (mueTest.computedReadonly !== 'readOnly!') error('Read Computed readonly after try to change')

      mueTest.once('code', event => {
        // if (event.target.code !== 321) error('Event launch on prop')
        eventCalls.push('once code')
      })
      mueTest.code = 321

      const repeatHanling = event => {
        // if (event.target.code !== 111 && event.target.code !== 222) error('Event repeat launch on prop')
        eventCalls.push('repeated code')
      }
      mueTest.on('code', repeatHanling)
      mueTest.code = 111
      mueTest.code = 222
      mueTest.off('code', repeatHanling)
      mueTest.code = 333

      mueTest.once('getPrivate', event => {
        if (event.type !== 'getPrivate' || event.target !== mueTest) error('Event launch on method call')
        eventCalls.push('once getPrivate')
      })
      mueTest.getPrivate()
      mueTest.getPrivate()

      mueTest.once('computedProp', event => {
        if (event.type !== 'computedProp' || event.target !== mueTest) error('Event launch on computed')
        eventCalls.push('once computedProp')
      })
      mueTest.computedProp = 'checkComputedEvent'
      mueTest.computedProp = 'checkComputedEvent'

      // console.log('eventCalls', eventCalls)
      if (eventCalls.length !== 4) error('All events handlers called ' + eventCalls.length + '/4')

      const checksumSnapshot = 'onName,onCode,onCode,onCode,onCode,onCode,onCode,onCode,onCode' // eslint-disable-line max-len
      // const checksumSnapshot = 'onName,onCode,onGetPrivate,onSetPrivate,onCode,onCode,onCode,onCode,onCode,onCode,onGetPrivate,onGetPrivate,onCode,onCode'
      if (mueTest.checksum !== checksumSnapshot) {
        console.log('Current checksum:', mueTest.checksum)
        error('Checksum Snapshot')
      }
    })

    const mueTestFilled = window.mueTestFilled = new SchemeTest({id: 123, name: 'Filled', code: 'filledCode'})
    block('Initialization with some data input', error => {
      if (mueTestFilled.name !== 'Filled') error('Prop value initialization')
      if (mueTestFilled.id !== '123') error('Prop id initialization')
      if (mueTestFilled.computedProp !== '_filledCode') error('Read computed')
    })

    const mueTestReFilled = window.mueTestFilled = new SchemeTest({id: 123, name: 'reFilled'})
    block('Re instantiation with some data input', error => {
      if (mueTestFilled !== mueTestReFilled) error('ID-Singletone runs ok')
      if (mueTestReFilled.name !== 'reFilled') error('Prop value initialization')
      if (mueTestReFilled.id !== '123') error('Prop id initialization')
      if (mueTestReFilled.computedProp !== '_12345') error('Read computed')
    })
    block('Using Form object', error => {
      const form = mueTestReFilled.getFormObject()
      form.code = 'refilledCode'
      form.save()
      if (mueTestFilled !== mueTestReFilled) error('ID-Singletone runs ok')
      // console.log('--->', mueTestReFilled)
      if (mueTestReFilled.name !== 'reFilled') error('Prop value not mutated')
      if (mueTestReFilled.computedProp !== '_refilledCode') error('Read updated computed')
    })

    const mueTestReinstance = window.mueTestReinstance = new SchemeTest(123)
    block('Re instantiation without data input', error => {
      if (mueTestFilled !== mueTestReinstance) error('ID-Singletone runs ok')
      if (mueTestReinstance.name !== 'reFilled') error('Prop value initialization')
      if (mueTestReinstance.id !== '123') error('Prop id initialization')
      if (mueTestReinstance.computedProp !== '_refilledCode') error('Read computed')
    })

    if (showSucces) console.log('Scheme tests done, all ok!')
    return true
  }

  static listeners = {
    onSetPrivate() {
      this.#ons.push('onSetPrivate')
    },
    onGetPrivate() {
      this.#ons.push('onGetPrivate')
    },
    onComputedProp() {
      this.#ons.push('onComputedProp')
    },
    onName() {
      this.#ons.push('onName')
    },
    onCode() {
      this.#ons.push('onCode')
    }
  }

  static { this.initialize() }

  static schema() {
    return {
      'name': {default: 'Name'},
      'code': {default: () => 12345}
    }
  }
}

// if (APP.isDevelopment) SchemeTest.test()

export default Scheme
export {
  SchemeTest
}
