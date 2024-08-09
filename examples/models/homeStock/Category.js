import Entity from '#services/Entity'
import ColorTone from '#models/palette/ColorTone'

export default class Category extends Entity {
  constructor(data) {
    return super().mount(data)
  }

  static { this.install() }

  static schema() {
    return {
      name: {
      }
    }
  }
}
