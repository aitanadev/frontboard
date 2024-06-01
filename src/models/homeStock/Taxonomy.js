import Scheme from '#services/Scheme'
import Color from '#models/palette/Color'
import Category from '#models/homeStock/Category'

export default class Taxonomy extends Scheme {
  constructor(data) {
    return super().mount(data)
  }

  static { this.install() }

  static schema() {
    return {
      name: {
      },
      tone: {
        class: Color
      },
      categories: {
        class: Category,
        multiple: true,
        crud: true
      }
    }
  }
}
