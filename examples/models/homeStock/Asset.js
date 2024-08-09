import Entity from '#services/Entity'
import Color from '#models/palette/Color'
import Taxonomy from '#models/examples/homeStock/Taxonomy'
import Category from '#models/examples/homeStock/Category'

export default class Asset extends Entity {
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
      tone: {
        col: false,
        field: false
      },
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
        options: [
          { text: 'kg', value: 1000 },
          { text: 'units', value: 1 }
        ],
        type: Number,
        default: 1000
      },
      unitAmount: {
        type: Number,
        default: 1000,
        col: false,
        field: false,
        filterable: false
      },
      barcode: {
        col: false
      },
      note: {
        default: '',
        textarea: true,
        col: false
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
