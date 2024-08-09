import APP from '#services/APP'
import Entity from '#services/Entity'

export class StaticDB {
  #name
  #dataPath
  #multiple = false
  #datasets = {}
  #dataset

  get $name() {
    return this.#name
  }

  get $dataPath() {
    return this.#dataPath
  }

  get $multiple() {
    return this.#multiple
  }

  get $datasets() {
    return this.#datasets
  }

  get $dataset() {
    return this.#dataset
  }

  constructor(dataPath, data) {
    const name = dataPath.split('/').pop().replace(/\.json$/, '')
    this.#multiple = Array.isArray(data)
    this.#name = name
    this.#dataPath = dataPath

    if (this.#multiple) {
      data.forEach(dataset => this.addCollection(dataset))
      StaticDB[name] = this
    } else {
      this.#dataset = this.addCollection(data)
      StaticDB[name] = this.#dataset.data
    }

    StaticDB.#databases[name] = this
  }

  addCollection(dataset) {
    const Class = Entity.models[dataset.model]
    dataset.Class = Class
    dataset.$database = this

    if (Class) {
      const collection = dataset.data.map(row => {
        const entity = new Class(row)
        entity.$dataset = dataset
        return entity
      })
      collection.$staticDB = true
      if (dataset.name.capitalize() === Class.pluralize(Class.name)) {
        Class.cache = collection
      }
      this[dataset.name] = collection
    } else {
      this[dataset.name] = dataset.data
    }

    dataset.data = this[dataset.name]
    this.#datasets[dataset.name] = dataset
    return dataset
  }

  save() {
    window.entitySaveFilesFlag = true // TODO: review
    const formateds = Object.values(this.#datasets).map(dataset => {
      const formated = {...dataset}
      delete formated.$database

      if (dataset.Class) {
        if (dataset.Class.name === 'Field') {
          formated.data = dataset.data.map(row => {
            const { id, key, size } = row
            return { id, key, size }
          })
        } else {
          formated.data = dataset.data.map(row => {
            const parsed = row.parse()
            delete parsed.$type
            return parsed
          })
        }
      } else {
        formated.data = dataset.data
      }
      return formated
    })
    window.entitySaveFilesFlag = false

    const formated = this.#multiple ? formateds : formateds[0]
    console.log('StaticDB saving', this.#name, formated)
    const stringified = JSON.stringify(formated, undefined, '  ')

    /* */
    return APP.FrontboardAPI.put(['files', this.#dataPath].pathJoin(), { contents: stringified }, {
      // maxContentLength: Infinity,
      // maxBodyLength: Infinity,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(response => {
      // console.info('Saved', { formated, stringified })
    })
    /* */
  }

  static #databases = {}

  static get $databases() {
    return this.#databases
  }

  static install(dataPath, data) {
    return new StaticDB(dataPath, data)
  }

  static save() {
    return Object.values(this.#databases).map(database => database.save())
  }
}

export default StaticDB
