import Entity from '#services/Entity'
import Color from '#models/palette/Color'
import APP from '#services/APP'

export default class ColorTone extends Entity {
  constructor(data) {
    return super().mount(data)
  }

  static { this.install() }

  static config = {
    freeze: false
  }

  static listeners = {
    onChange(eventName, value, silent) {
      APP.services?.palette?.refresh()
    }
  }

  static schema() {
    return {
      name: {
        default: '',
        sticky: 'left'
      },
      color: { class: Color }
    }
  }
}
