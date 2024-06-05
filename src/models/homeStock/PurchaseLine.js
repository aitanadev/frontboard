import Scheme from '#services/Scheme'
import Asset from '#models/homeStock/Asset'

export default class PurchaseLine extends Scheme {
  constructor(data) {
    return super().mount(data)
  }

  get tone() {
    return this.asset?.tone
  }

  get name() {
    return this.asset ? this.asset.name : 'New line'
  }

  static { this.install() }

  static computed() {
    return {
      tone: {
        col: false,
        field: false
      },
      name: {
        col: false,
        field: false
      }
    }
  }

  static schema() {
    return {
      asset: {
        class: Asset
      },
      amount: {
        type: Number
      },
      price: {
        type: Number
      },
      bargain: {
        type: Boolean,
        default: false
      }
    }
  }
}
