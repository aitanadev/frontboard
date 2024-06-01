import Scheme from '#services/Scheme'
import Field from '#models/internals/Field'

export default class Fieldset extends Scheme {
  constructor(data) {
    return super().mount(data)
  }

  static { this.install() }

  static config = {
    freeze: false
  }

  static schema() {
    return {
      name: {},
      model: {},
      fields: {
        class: Field,
        multiple: true,
        crud: true
      }
    }
  }
}
