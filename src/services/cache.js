import APP from '#services/APP'
import Scheme from '#services/Scheme'

export default {
  cacheSupplyPromise: undefined,
  ready: false,
  supply() {
    /*
    if (APP.isOffline) import('models/...')
    this.cacheSupplyPromise ??= Scheme.load([]).then(() => {
      this.ready = true
      console.info('Cache ready')
    }).catch(error => {
      console.error(error)
      throw new Error('Cache supply fails')
    })
    return this.cacheSupplyPromise
    */
  }
}
