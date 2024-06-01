import Scheme from '#services/Scheme'
import ColorTone from '#models/palette/ColorTone'

export default class Category extends Scheme {
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
