import Entity from '#services/Entity'
// import Dealer from './Dealer'
import PurchaseLine from '#models/examples/homeStock/PurchaseLine'

export default class Purchase extends Entity {
  constructor(data) {
    return super().mount(data)
  }

  get name() {
    return this.date.format() + (this.dealer ? ' - ' + this.dealer : '')
  }

  static { this.install() }

  static computed() {
    return {
      name: {
        col: false,
        field: false
      }
    }
  }

  static schema() {
    return {
      date: {
        type: Date,
        default: () => Date.now(),
        format: date => date.format('dateTime')
      },
      dealer: {
        // class: Dealer
      },
      purchaseLines: {
        class: PurchaseLine,
        crud: true,
        multiple: true,
        col: false
      }
    }
  }
}
