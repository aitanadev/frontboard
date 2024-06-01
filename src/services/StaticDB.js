import Scheme from '#services/Scheme'
import API from '#services/API'

export class Collection {
  constructor(config, database) {
    const Class = Scheme.models[config.model]
    Object.assign(this, config)
    this.database = database
    // this.name = config.name
    // this.model = config.model
    if (Class) {
      this.Class = Class
      this.data = config.data.map(row => new Class(row))
      // console.log('......', this.name.capitalize(), Class.pluralize(Class.name))
      if (this.name.capitalize() === Class.pluralize(Class.name)) {
        // console.log('-----> Connect staticDB to Scheme cache')
        if (this.data.length > 0) {
          Class.cache = this.data
        } else {
          this.data = Class.cache
        }
      }
      /*
      const originalPush = this.data.push.bind(this)
      this.data.push = function(...values) {
        console.log('try to push')
        originalPush(...values)
      }
      */
    } else {
      this.data = config.data
    }
  }

  get id() {
    return this.database.path + '/' + this.name
  }
}

export class StaticDB {
  constructor(config) {
    this.path = config.path
    this.data = config.data
    this.collections = {}
    this.data.forEach(collection => this.addCollection(collection))
    return this
  }

  addCollection(collection) {
    this.collections[collection.name] = new Collection(collection, this)
  }

  save() {
    window.schemeSaveFilesFlag = true
    const formated = Object.values(this.collections).map(collection => {
      const formated = {
        name: collection.name,
        model: collection.model,
        hidden: collection.hidden // TODO: review
      }
      if (collection.Class) {
        console.log('collection', collection.Class.name)
        formated.data = collection.data.map(row => {
          const parsed = row.parse()
          delete parsed.type
          return parsed
        })
      } else {
        formated.data = collection.data
      }
      return formated
    })
    window.schemeSaveFilesFlag = false
    const stringified = JSON.stringify(formated, undefined, '  ')

    /* */
    return API.put(`files/data/json/${this.path}.json`, { contents: stringified }, {
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

  static databases = {}

  static newDatabase(databaseConfig) {
    // console.log('newDatabase', databaseConfig)
    const database = new StaticDB(databaseConfig)
    StaticDB.databases[databaseConfig.path] = database
    return database
  }

  static save() {
    return Object.values(this.databases).map(database => database.save())
  }
}

export default StaticDB
