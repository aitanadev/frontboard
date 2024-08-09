import Entity from '#services/Entity'
import Color from '#models/palette/Color'
import APP from '#services/APP'

export default class CSSVar extends Entity {
  constructor(data) {
    return super().mount(data)
  }

  get px() {
    return this.value + 'px'
  }

  get color() {
    return this.value
  }

  // set px(value) {
  //   this.value = value.replace(/px$/, '')
  // }

  // get color() {
  //   return Color.fromHsl(this.value)
  // }

  // set color(color) {
  //   this.value = color.hsl()
  // }

  asCSS() {
    if (this.value !== undefined && this.value !== null) {
      return `\t--${this.name}: ${this[this.format]};\n`
    } else {
      return ''
    }
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

  static computed() {
    return {
      px: {
        col: false
      },
      color: {
        col: false
      }
    }
  }

  static schema() {
    return {
      name: {
        default: '',
        sticky: 'left'
      },
      value: { default: '' },
      format: { default: 'value' }
    }
  }
}
