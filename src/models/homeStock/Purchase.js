import Scheme from '#services/Scheme'
// import Dealer from '#models/Dealer'
import PurchaseLine from '#models/homeStock/PurchaseLine'

export default class Purchase extends Scheme {
  constructor(data) {
    return super().mount(data)
  }

  get name() {
    return this.date.format() + (this.dealer ? ' - ' + this.dealer : '')
  }

  static { this.install() }

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
        multiple: true
      }
    }
  }
}
