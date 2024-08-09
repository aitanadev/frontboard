import Entity from '#services/Entity'

export default class Translation extends Entity {
  constructor(data) {
    return super().mount(data)
  }

  get label() {
    return this.node
  }

  translate(context = {}) {
    const number = Math.min(Number(context.number), 2).toString()
    const texts = {
      'NaN': this.text,
      '0': this.textZero,
      '1': this.textUnique,
      '2': this.textMultiple
    }
    const text = texts[number] ? texts[number] : this.text
    // console.log('text', {dotPath: this.node, number, text})
    if (!text) return undefined
    try {
      // TODO: Securize
      return eval('`' + text.replace(/\$\{/gi, '${context.') + '`') // eslint-disable-line no-eval
    } catch (error) {
      console.log('I18n translating error', {translation: this, context}, error)
    }
  }

  static { this.install() }

  static config = {
    freeze: false
  }

  static schema() {
    return {
      node: {
      },
      number: {
        type: Boolean,
        default: false
      },
      text: { // textUnique
        i18n: true
      },
      textUnique: {
        i18n: true,
        col: false,
        hidden: (entity) => !entity.number
      },
      textMultiple: {
        i18n: true,
        col: false,
        hidden: (entity) => !entity.number
      },
      textZero: {
        i18n: true,
        col: false,
        hidden: (entity) => !entity.number
      }
    }
  }
}
