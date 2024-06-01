import Scheme from '#services/Scheme'
import APP from '#services/APP'

let uid = 0
export default class ColorShadow extends Scheme {
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
      hue: {
        type: Number,
        default: 0,
        range: true,
        min: -360,
        max: 360
      },
      saturation: {
        type: Number,
        default: 0,
        range: true,
        min: -100,
        max: 100
      },
      lightness: {
        type: Number,
        default: 0,
        range: true,
        min: -100,
        max: +100
      }
    }
  }
}
