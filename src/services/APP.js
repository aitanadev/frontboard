if (!window.$APPCONFIG) throw new Error('Missing $APPCONFIG')

const config = window.$APPCONFIG
const enviroment = config.enviroment
const isDevelopment = enviroment === 'development'
const isStaging = enviroment === 'staging'
const isWebpackServe = process.env.WEBPACK_SERVE
const isJest = process.env.JEST_WORKER_ID
const isOffline = config.offline

const APP = {
  // processenv: process.env,
  config,
  isDevelopment,
  isStaging,
  isWebpackServe,
  isJest,
  isOffline
}

export default APP
