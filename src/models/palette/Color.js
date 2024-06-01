import Scheme from '#services/Scheme'
import APP from '#services/APP'
import User from '#models/examples/User'
// import ColorField from '#components/fields/ColorField'  assert { type: 'node-native' }

export default class Color extends Scheme {
  constructor(data) {
    return super().mount(data)
  }

  hsl(colorShadow) { // Todo rename to applyShadow(colorShadow)
    // Add support to tranform numbers automatically to Scheme?
    if (colorShadow) {
      const hue = (this.hue + colorShadow.hue).range(0, 360)
      const saturation = (this.saturation + colorShadow.saturation).range(0, 100)
      const lightness = (this.lightness + colorShadow.lightness).range(0, 100)
      // console.log('color shadowing', this.name, colorShadow.name, {color: this, colorShadow, hue, saturation, lightness})
      return `hsl(${hue}deg ${saturation}% ${lightness}%)`
    } else {
      return `hsl(${this.hue}deg ${this.saturation}% ${this.lightness}%)`
    }
  }

  get value() { // TODO rename to hsl
    return this.hsl()
  }

  /*
  rgb() {
    const lightness= this.lightness / 100
    const diff = this.saturation * Math.min(this.lightness, 1 - this.lightness) / 100
    const block = position => {
      const hueKey = (position + this.hue / 30) % 12
      const color = this.lightness - diff * Math.max(Math.min(hueKey - 3, 9 - hueKey, 1), -1)
      return Math.round(255 * color).toString(16).padStart(2, '0')
    }
    return `#${f(0)}${f(8)}${f(4)}`
  }
  */

  static { this.install() }

  static fromHsl(hslString) {
    const elements = hslString.replace(/^hsl\(|\)$/g, '').split(' ')
    console.log('fromHsl', hslString, elements)
    const hue = Number(elements[0].replace('deg', ''))
    const saturation = Number(elements[1].replace('%', ''))
    const lightness = Number(elements[2].replace('%', ''))
    return new Color({ hue, saturation, lightness })
  }

  /*
  static fromRGB(rgbString) {
    const elements = rgbString.replace('#','').split()
    const r = Number(elements[0] + elements[1]) / 255
    const g = Number(elements[2] + elements[3]) / 255
    const b = Number(elements[4] + elements[5]) / 255

      const l = Math.max(r, g, b);
      const s = l - Math.min(r, g, b);
      const h = s
        ? l === r
          ? (g - b) / s
          : l === g
          ? 2 + (b - r) / s
          : 4 + (r - g) / s
        : 0;
      return [
        60 * h < 0 ? 60 * h + 360 : 60 * h,
        100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
        (100 * (2 * l - s)) / 2
      ];
    };
  }
  */

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
      value: {
        min: 10,
        as: 'a',
        component: 'ColorField'
      }
    }
  }

  static schema() {
    return {
      name: {
        default: ''
      },
      hue: {
        type: Number,
        default: 0,
        range: true,
        min: 0,
        max: 360
      },
      saturation: {
        type: Number,
        default: 100,
        range: true,
        min: 0,
        max: 100
      },
      lightness: {
        type: Number,
        default: 50,
        range: true,
        min: 0,
        max: 100
      },
      users: {
        class: User,
        multiple: true,
        metadata: true,
        crud: true
      }
    }
  }
}
