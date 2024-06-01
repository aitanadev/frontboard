// Styles
import './stylesheets/index.scss'
import flaticons from '@flaticon/flaticon-uicons/css/all/all.css'

// Libs and config
import Vue from 'vue'
import '#lib/prototype'
import 'config/vue.config'

// APP
import APP from '#services/APP'
import Scheme from '#services/Scheme'
import StaticDB from '#services/StaticDB'
import i18n, { I18n } from '#services/i18n'

window.$Vue = Vue
window.APP = APP

const contextRequire = import.meta.webpackContext('models', {
  recursive: true,
  regExp: /\.js$/
  // mode: 'weak',
  // exclude: /three/,
})

initialize()

async function initialize () {
  mountModels()
  await mountStaticDB()
  syncSchemeWithStaticDB()
  syncTranslations()
  mountFieldsets()
  mountServices()
  mountComponents()
  mountFrontboard()
}

function mountModels() {
  const modelsContext = import.meta.webpackContext('models', { recursive: true, regExp: /\.js$/ })
  APP.models = Object.fromEntries(modelsContext.keys().map(modelPath => {
    const model = modelsContext(modelPath).default
    const name = modelPath.split('/').pop().replace(/\.js$/, '')
    return [name, model]
  }))
  Scheme.initialize()
}

function mountStaticDB() {
  return new Promise(resolve => {
    const databasesContext = import.meta.webpackContext('data/json', { recursive: true, regExp: /\.json$/, mode: 'lazy' })
    const keys = databasesContext.keys()

    Promise.all(
      keys.map(databasePath => databasesContext(databasePath))
    ).then(databases => {
      databases.forEach((data, index) => {
        const databasePath = keys[index]
        const path = databasePath.split('/').pop().replace(/\.json$/, '')
        StaticDB.newDatabase({ path, data })
      })
      APP.databases = StaticDB.databases
      resolve()
    })
  })
}

function syncSchemeWithStaticDB() {
  Object.defineProperty(Scheme, 'UidIndex', {
    get() {
      return APP.databases.internals.collections.config.data.uidIndex
    },
    set(value) {
      APP.databases.internals.collections.config.data.uidIndex = value
    }
  })
}

function syncTranslations() {
  /*
  I18n.translations = [
    new APP.models.Translation({
      dotText: 'example.dot.text',
      texts: ['Example message for ${name}!'],
      number: false
    })
  ]
  window.i18nTest = i18n('example.dot.text', {name: 'Aitana'}, 'not found :(')
  */
  APP.translations = I18n.translations = Object.fromEntries(Object.values(APP.databases.translations.collections).map(language => [language.name, language.data]))
  Object.defineProperty(APP, 'language', {
    get() {
      return I18n.language
    },
    set(value) {
      I18n.language = value
    }
  })
}

function mountFieldsets() {
  Scheme.initializeFields()
}

function mountServices() {
  const servicesContext = import.meta.webpackContext('services', { recursive: true, regExp: /\.js$/ })
  APP.services = Object.fromEntries(servicesContext.keys().map(servicePath => {
    const service = servicesContext(servicePath).default
    const name = servicePath.split('/').pop().replace(/\.js$/, '')
    return [name, service]
  }).filter(service => service[0] !== 'APP'))
}

function mountComponents() {
  const componentsContext = import.meta.webpackContext('components', { recursive: true, regExp: /\.vue$/ })
  APP.components = Object.fromEntries(componentsContext.keys().map(componentPath => {
    // console.log('component', componentPath)
    const componentModule = componentsContext(componentPath).default
    const component = Vue.component(componentModule.name, componentModule)
    return [componentModule.name, component]
  }))
}

function mountFrontboard() {
  const mountFrontboard = window.mountFrontboard = path => {
    if (window.Frontboard) {
      window.Frontboard.toggle()
    } else {
      import('views/Frontboard').then(module => {
        const Frontboard = Vue.component(module.default.name, module.default)
        const element = document.createElement('frontboard')
        const component = new Frontboard({ propsData: { path } })
        document.body.appendChild(element)
        window.Frontboard = component.$mount(element)
        console.info('FrontBoard mounted')
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
      const queryParams = new URLSearchParams(window.location.search)
      const path = queryParams.get('frontboard')
      if (path || APP.config.autoLaunchFrontBoard) {
        mountFrontboard(path || undefined)
      } else {
        console.info('FrontBoard ready')
      }
    })
  }

  console.log('APP init', APP)
}

// module.export = APP
