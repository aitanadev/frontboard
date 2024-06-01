import Scheme from '#services/Scheme'
import Color from '#models/palette/Color'
import Taxonomy from '#models/homeStock/Taxonomy'
import Category from '#models/homeStock/Category'

export default class Asset extends Scheme {
  constructor(data) {
    return super().mount(data)
  }

  static { this.install() }

  get amount() {
    return this.unitAmount / this.unitBase
  }

  set amount(value) {
    this.unitAmount = value * this.unitBase
  }

  get tone() {
    return this.taxonomy?.tone
  }

  static computed() {
    return {
      amount: {
        type: Number
      }
    }
  }

  static schema() {
    return {
      name: {
      },
      unitBase: {
        // class: EnumOption,
        options: [
          { text: 'Kg', value: 1000 },
          { text: 'Units', value: 1 }
        ],
        type: Number,
        default: 1000
      },
      unitAmount: {
        type: Number,
        default: 1000
      },
      barcode: {
      },
      note: {
        textarea: true
      },
      runOut: {
        type: Number
      },

      taxonomy: {
        class: Taxonomy
      },
      categories: {
        class: Category,
        options: entity => entity.taxonomy ? entity.taxonomy.categories : [],
        multiple: true
      }
    }
  }
}
