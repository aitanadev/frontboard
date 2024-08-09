// Styles
import './stylesheets/index.scss'
import '@flaticon/flaticon-uicons/css/all/all.css'

// Libs and config
import Vue from 'vue'
import '#lib/prototype'
import '#config/vue.config'
import routes from '#config/routes'

// APP
import APP from '#services/APP'
import router from '#services/router'
import Entity from '#services/Entity'
import StaticDB from '#services/StaticDB'
import i18n, { I18n } from '#services/i18n'

window.$Vue = Vue
window.$APP = APP
APP.routes = routes
APP.router = router
APP.Entity = Entity

const contextRequire = require.context('#models', true, /\.js$/)

console.log('Frontboard', APP)
APP.initialize = async (databasesContext, databasesPath) => {
  mountModels()
  await mountStaticDB(databasesContext, databasesPath)

  Object.defineProperty(Entity, 'UidIndex', {
    get() {
      return StaticDB.config.uidIndex
    },
    set(value) {
      StaticDB.config.uidIndex = value
    }
  })

  APP.translations = I18n.translations = StaticDB.translations

  Object.defineProperty(APP, 'language', {
    get() {
      return I18n.language
    },
    set(value) {
      I18n.language = value
    }
  })

  Entity.initializeFields()

  mountServices()
  mountComponents()
  
  router.initialize()

  mountFrontboard()

  Object.assign(Vue.options.components, Vue.options.__components || {}) // Move up?
}

function mountModels() {
  console.time('mountModels')
  const modelsContext = require.context('#models', true, /\.js$/)
  APP.models = Object.fromEntries(modelsContext.keys().map(modelPath => {
    const name = modelPath.split('/').pop().replace(/\.js$/, '')
    // console.time('New model ' + name)
    const model = modelsContext(modelPath).default
    // console.timeEnd('New model ' + name)
    return [name, model]
  }))
  console.timeEnd('mountModels')

  console.time('Entity.initialize()')
  Entity.initialize()
  console.timeEnd('Entity.initialize()')
}

function mountStaticDB(databasesContext, databasesPath) {
  console.time('mountStaticDB')
  return new Promise(resolve => {
    // const databasesContext = require.context('#data/json', true, /\.json$/) //, 'lazy')
    const keys = databasesContext.keys()

    Promise.all(
      keys.map(async dataPath => {
        // console.time('New staticDB database ' + dataPath)
        const database = await databasesContext(dataPath)
        // console.timeEnd('New staticDB database ' + dataPath)
        return database
      })
    ).then(databases => {
      databases.forEach((data, index) => {
        const dataPath = [databasesPath, keys[index].split('/').pop()].pathJoin()
        // console.time('Installing staticDB database ' + dataPath)
        StaticDB.install(dataPath, data)
        // console.timeEnd('Installing staticDB database ' + dataPath)
      })
      APP.StaticDB = StaticDB
      console.timeEnd('mountStaticDB')
      resolve()
    })
  })
}

function mountServices() {
  console.time('mountServices')
  const servicesContext = require.context('#services', true, /\.js$/)
  APP.services = Object.fromEntries(servicesContext.keys().map(servicePath => {
    const name = servicePath.split('/').pop().replace(/\.js$/, '')
    // console.time('New service ' + name)
    const service = servicesContext(servicePath).default
    // console.timeEnd('New service ' + name)
    return [name, service]
  }).filter(service => service[0] !== 'APP'))
  console.timeEnd('mountServices')
}

function mountComponents() {
  console.time('mountComponents')
  const componentsContext = require.context('#components', true, /\.vue$/)
  APP.components = Object.fromEntries(componentsContext.keys().map(componentPath => {
    // console.log('component', componentPath)
    const componentModule = componentsContext(componentPath).default
    const component = Vue.component(componentModule.name, componentModule)
    return [componentModule.name, component]
  }))
  console.timeEnd('mountComponents')
}

function mountFrontboard() {
  console.time('mountFrontboard')
  const mountFrontboard = window.mountFrontboard = () => {
    if (window.Frontboard) {
      window.Frontboard.toggle()
    } else {
      import('#views/Frontboard').then(module => {
        const Frontboard = Vue.component(module.default.name, module.default)
        const element = document.createElement('frontboard')
        const component = new Frontboard()
        document.body.appendChild(element)
        window.Frontboard = component.$mount(element)
        console.timeEnd('mountFrontboard')
      })
    }
  }

  if (APP.isDevelopment || APP.isStaging) {
    // Press [Cmd + Shift + .]
    document.addEventListener('keydown', event => {
      if (event.key === '.' && event.metaKey && event.shiftKey) {
        mountFrontboard()
      }
    })
    Vue.nextTick().then(() => {
      if (router.current || APP.config.autoLaunchFrontBoard) {
        mountFrontboard()
      } else {
        console.info('FrontBoard ready')
      }
    })
  }
}

export default APP

export { Entity }
