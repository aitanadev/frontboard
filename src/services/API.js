import Axios from 'axios'

const API = Axios.create({
  baseURL: 'http://localhost:3001/api',
  withCredentials: true
})

function interceptorErrorHandler(error) {
  console.error('API error response', error)
  // Give back error control
  return Promise.reject(error)
}

API.interceptors.request.use(config => {
  // console.log('Axios call config', config)
  config.headers.Accept = 'application/json, text/javascript, */*; q=0.01'
  // config.headers['Content-Type'] = 'application/vnd.api+json' // For now is json:api over default application/json
  // config.headers['content-type'] = 'application/x-www-form-urlencoded' // Addapter for form-like data
  // config.headers.Authorization = 'Bearer ' + ... // Auth system
  // config.responseType = config.download ? 'arraybuffer' : 'json' // API buffer output support
  return config
}, interceptorErrorHandler)

/* *
// Response interceptor
API.interceptors.response.use(response => {
  if (response.config.download) {
    // console.log('Downloadable response...', response) // Preparative for downloadable responses
  }
  return response
}, interceptorErrorHandler)
/* */

export default API
