import Entity from '#services/Entity'
import Field from '#models/internals/Field'

export default class Fieldset extends Entity {
  constructor(data) {
    return super().mount(data)
  }

  static { this.install() }

  static config = {
    freeze: false
  }

  static schema() {
    return {
      name: {
        sticky: 'left'
      },
      model: {},
      fields: {
        class: Field,
        multiple: true,
        crud: true,
        col: false,
        tab: true
      }
    }
  }
}
