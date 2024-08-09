import Entity from '#services/Entity'
import Color from '#models/palette/Color'
import Category from '#models/examples/homeStock/Category'

export default class Taxonomy extends Entity {
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
