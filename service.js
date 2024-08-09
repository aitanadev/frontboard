import express from 'express'
import sqlite3 from 'sqlite3'
import { formidable } from 'formidable'
import path, { dirname } from 'path'
import qs from 'querystring'
import fs from 'fs/promises'
import { fileURLToPath } from 'url';


const params = {
  port: 3001
}
process.argv.forEach(function (val, index, array) {
  if (val === '--port') {
    params.port = array[index + 1]
  }
})
console.log('param:', params)

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const port = params.port

const formidableConfig = {
  maxFieldsSize: 100 * 1024 * 1024
}

global.window = {
  $APPCONFIG: {
    enviroment: 'development',
    offline: true,
    autoLaunchFrontBoard: true
  }
}

/*
posible migration flow:
tomo cada modelo
si no existe en la bdd lo creo como tabla,
si existe compruebo cada campo
si existe la columna debe tener el mismo tipo y notnull
si existe y no tiene el mismo tipo se borra y se crea de nuevo
si no existe se crea la columna
*/

app.use(express.json())

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin)
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, Authorization')
  next();
})

const promised = (handler) => new Promise((resolve, reject) => {
  function resolver (error, result) {
    return error ? reject(error) : resolve(result || instance || this)
  }
  const instance = handler(resolver)
})

async function apiDB() {
  const dbPath = path.resolve(__dirname, 'data/sqlite')
  const db = await promised(resolver => new sqlite3.Database(dbPath, resolver))

  const query = (query) => promised(resolver => {
    console.log('QUERY', query)
    db.all(query, resolver)
  })
  const run = (query) => promised(resolver => {
    console.log('RUN', query)
    db.run(query, resolver)
  })
  const exec = (query) => promised(resolver => {
    console.log('EXEC', query)
    db.exec(query, resolver)
  })

  class Table {
    #Class
    #name
    constructor(Class) {
      this.#Class = Class
      this.#name = Class.plural.toSnakeCase()
      console.log('Table', this.name)
    }

    get name() {
      return this.#name
    }

    get Class(){
      return this.#Class
    }

    get exist () {
      return query(`SELECT name FROM sqlite_master WHERE type='table' AND name='${this.name}'`).then(result => !!result[0])
    }

    get columns() {
      return query(`PRAGMA table_info(${this.name})`)
    }

    static parseValue(prop, value, like){
      if (prop?.key === 'id') return Number(value)
      if (prop?.metadata && value) return `'${btoa(JSON.stringify(value))}'`
      if (prop?.type === Date) return new Date(value).getTime()
      if (Array.isArray(value)) return value.length > 0 ? `'${value.join(', ')}'` : 'null'
      if (prop?.class) return value?.id
      if (typeof value === 'number' || typeof value === 'boolean') return value
      if (typeof value === 'string' && value) {
        return like ? `'%${value}%'` : `'${value}'`
      }
      if (!value) return 'null'
      return `'${Entity.stringify(value)}'`
    }

    insert(payload) {
      if (!Array.isArray(payload)) {
        const keys = Object.keys(payload).filter(key => key !== 'type')
        const columns = keys.map(column => `'${column}'`).join(',')
        const values = keys.map(column => Table.parseValue(this.Class.data[column], payload[column])).join(',')
        return run(`INSERT INTO ${this.name} (${columns}) VALUES (${values});`)
      } else {
        const payloads = payload
        const columns = Object.values(this.Class.data).map(prop => prop.key).join(',')
        const values = payloads.map(payload => columns.map(column => Table.parseValue(this.Class.data[column], payload[column])).join(',')).join('), (')
        return run(`INSERT INTO ${this.name} (${columns}) VALUES (${values});`)
      }
    }

    update(payload) {
      const where = this.where({ id: { equalTo: payload.id } })
      const set = Object.entries(payload).map(([key, value]) => `${key} = ${Table.parseValue(this.Class.data[key], value)}`).join(',')
      return run(`UPDATE ${this.name} SET ${set} WHERE ${where};`)
    }

    where(queryFilter) {
      if (!queryFilter) return ''

      const filtersOperators = {
        equalTo: '=',
        like: 'LIKE',
        between: 'BETWEEN',
        in: 'IN',
        lessThan: '<',
        greaterThan: '>',
        lessThanOrEqualTo: '<=',
        greaterThanOrEqualTo: '>=',
        and: 'AND'
      }

      if (!Array.isArray(queryFilter)) queryFilter = [queryFilter]
      if (!Array.isArray(queryFilter[0])) queryFilter = [queryFilter]

      console.log('QUERYFILTER', queryFilter)

      const where = queryFilter.map(operands => {
        
        const block = operands.map(operand => {

          const key = Object.keys(operand)[0]
          const operation = operand[key]
          const operator = Object.keys(operand)[0]
          console.log({operands, key, operation})

          if (!Object.keys(operation).length) return

          const operandValues = Object.entries(operation).map(([operator, value]) => {
            operator = filtersOperators[operator]
            value = Table.parseValue(this.Class.data[key], value, operator === 'LIKE')
            if (value === 'null') return
            return `${operator} ${value}` // TODO parse value
          }).filter(notNull => notNull).join(' ')
          
          if (!operandValues) return
          return `${key} ${operandValues}`
        }).filter(notNull => notNull)

        if (block.length > 1) {
          return `(${block.join(' OR ')})`
        } else {
          return block.join('')
        }
      }).join(' AND ')

      console.log('WHERE', where)

      return where

      /*
      return Object.entries(where).map(([key, value]) => {
        if (typeof value === 'string' && value) {
          return `${key} LIKE ${Table.parseValue(this.Class.data[key], value, true)}`
        } else if (value || typeof value === Number) {
          return `${key} = ${Table.parseValue(this.Class.data[key], value)}`
        }
      }).filter(entry => entry).join(' AND ')
      */
    }

    delete(id) {
      const where = this.where({ id: { equalTo: id } })
      return run(`DELETE FROM ${this.name} WHERE ${where};`)
    }

    async query(_query) {
      const result = await query(_query)
      // console.log('TABLE QUERY RESULT', result)
      return result.map(row => {
        return this.parse(row)
      })
    }

    sync() {
      console.log('Sync!')
    }

    parse(data) {
      const props = { id:{}, ...this.Class.data}
      const result = {}
      for (const propName in props) {
        const prop = props[propName]
        let value = data[propName]
        if (prop.type === Date && value) value = new Date(value)
        if (prop.metadata && value) value = JSON.parse(atob(value))
        if (propName === 'id') value = String(value)
        result[propName] = value
      }
      return result
    }

    create() {
      const columns= Object.values(this.Class.data).map(prop => {
        // TEXT, INTEGER, NUMERIC, BLOB, REAL
        let type = 'TEXT'
        if (prop.metadata) {
          type = 'BLOB'
        }
        if (prop.multiple) {
          
        } else if (prop.type === Number || prop.type === Date) {
          type = 'INTEGER'
        }
        return `'${prop.key}' ${type}`
      }).join(',')
      return run(`CREATE TABLE ${this.name} (id INTEGER PRIMARY KEY AUTOINCREMENT, ${columns});`)
    }

    drop() {
      return run(`DROP TABLE IF EXISTS ${this.name};`)
    }
  }




  const databaseTables = await query(`SELECT * FROM sqlite_master WHERE type='table'`)
  console.log('DATABASE TABLES', databaseTables) // .map(table => table.name)

  /* */
  const getFiles = async (dir, regex) => { // TODO: review, need the implementor models directory too
    const dirents = await fs.readdir(dir, { withFileTypes: true })
    const files = await Promise.all(dirents.map((dirent) => {
      const res = path.resolve(dir, dirent.name)
      return dirent.isDirectory() ? getFiles(res) : res
    }))
    if (regex) {
      return files.flat().filter(file => regex.test(file))
    } else {
      return files.flat()
    }
  }

  const modelsFiles = await getFiles(path.resolve(__dirname, 'src/models'), /\.js$/)
  console.log('Models files', modelsFiles)
  const modelsModules = await Promise.all(modelsFiles.map(async file => (await import(file)).default))
  const Entity = (await import('#services/Entity')).default
  Entity.initialize()

  // console.log('MODELS FILES', modelsFiles)
  // console.log('MODELS MODULES', modelsModules)
  // console.log('SCHEME', Entity.models)
  
  const tables = Object.values(Entity.models).map(Class => new Table(Class))
  console.log('TABLES', tables.map(table => table.name))

  /* *
  tables.forEach(async table => {
    const exist = await table.exist
    // console.log('exist?', table.name, table.Class.name, exist)
    if (exist) {
      await table.sync()
    } else {
      await table.create()
    }
  })
  /* */

  app.get('/api/sqlite/:table', async function(req, res) {
    const tableName = req.params.table.toSnakeCase()
    const table = tables.find(table => table.name === tableName)
    if (table) {
      const filter = req.query.filter && JSON.parse(req.query.filter)
      const where = table.where(filter)
      console.log('LIST', tableName, req.query, where)
      const result = await table.query(`SELECT * FROM ${tableName} ${where ? 'WHERE ' + where : ''}`)
      console.log(' -> ', result)
      res.json(result)
    } else {
      res.error('Table not exist')
    }
  })

  app.get('/api/sqlite/:table/:id', async function(req, res) {
    const tableName = req.params.table.toSnakeCase()
    const rowId = req.params.id
    const table = tables.find(table => table.name === tableName)
    if (table) {
      console.log('RETRIEVE', tableName, rowId)
      const result = await table.query(`SELECT * FROM ${tableName} WHERE id=${rowId}`)
      console.log(' -> ', result)
      res.json(result)
    } else {
      res.error('Table not exist')
    }
  })

  app.delete('/api/sqlite/:table/:id', async function(req, res) {
    const tableName = req.params.table.toSnakeCase()
    const rowId = req.params.id
    const table = tables.find(table => table.name === tableName)
    if (table) {
      console.log('DELETE', tableName, rowId)
      const result = await table.delete(rowId)
      console.log(' -> ', result)
      res.json(result)
    } else {
      res.error('Table not exist')
    }
  })

  app.put('/api/sqlite/:table', async function(req, res) {
    const tableName = req.params.table.toSnakeCase()
    const table = tables.find(table => table.name === tableName)
    if (table) {
      const form = formidable(formidableConfig)
      const [fields, files] = await form.parse(req)
      if (!fields.payload) return res.error(new Error('No content PATCH'))
      const payload = JSON.parse(fields.payload)
      console.log('PUT', tableName, payload)
      const result = await table.insert(payload)
      console.log(' -> ', result)
      res.json(result)
    } else {
      res.error('Table not exist')
    }
  })

  app.patch('/api/sqlite/:table/:id', async function(req, res) {
    const tableName = req.params.table.toSnakeCase()
    const table = tables.find(table => table.name === tableName)
    if (table) {
      const form = formidable(formidableConfig)
      const [fields, files] = await form.parse(req)
      if (!fields.payload) return res.error(new Error('No content PATCH'))
      const payload = JSON.parse(fields.payload)
      console.log('PATCH', tableName, payload)
      const result = await table.update(payload)
      console.log(' -> ', result)
      res.json(result)
    } else {
      res.error('Table not exist')
    }
  })

  // db.close()
}

apiDB()
console.log('Initialize...')

const base = process.env.PWD // '../../movida/' // './'
console.log('BASE', base)

app.get('/', (req, res) => {
  res.send('Frontboard API')
})

app.get('/api/files/*', async function(req, res) {
  const filePath = path.resolve(__dirname, base, req.params[0])
  console.log('GET', req.path, filePath)
  try {
    const contents = await fs.readFile(filePath)
    res.end(contents)
  } catch(error) {
    res.status(404).json({error})
  }
})

app.put('/api/files/*', async function(req, res) {
  const filePath = path.resolve(__dirname, base, req.params[0])
  const form = formidable(formidableConfig)
  const [fields, files] = await form.parse(req)
  console.log('PUT', req.path, filePath)
  if (!fields.contents) return res.end()
  const contents = await fs.writeFile(filePath, fields.contents[0])
  res.end()
})

const server = app.listen(port, () => {
  console.log(`Frontboard listening on port ${port}`)
})

server.keepAliveTimeout = 30 * 1000
server.headersTimeout = 35 * 1000
