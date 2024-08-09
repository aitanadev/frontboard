import APP from '#services/APP'
import Entity from '#services/Entity'

export default {
  cacheSupplyPromise: undefined,
  ready: false,
  supply() {
    /*
    if (APP.isOffline) import('models/...')
    this.cacheSupplyPromise ??= Entity.load([]).then(() => {
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
