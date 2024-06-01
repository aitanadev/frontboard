import Scheme from '#services/Scheme'
import Color from '#models/palette/Color'
import APP from '#services/APP'

export default class ColorTone extends Scheme {
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
      name: { default: '' },
      color: { class: Color }
    }
  }
}
