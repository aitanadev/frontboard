import Scheme from '#services/Scheme'

export default class Translation extends Scheme {
  constructor(data) {
    return super().mount(data)
  }

  get label() {
    return this.dotText
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
    // console.log('text', {dotPath: this.dotText, number, text, textUnique: this.textUnique})
    if (!text) return undefined
    try {
      // TODO: Securize
      return eval('`' + text.replace(/\$\{/gi, '${context.') + '`') // eslint-disable-line no-eval
    } catch (error) {
      console.log('I18n translating error', {translation: this, context}, error)
    }
  }

  static { this.install() }

  static schema() {
    return {
      dotText: {
      },
      number: {
        type: Boolean
      },
      text: {
        i18n: true
      },
      textMultiple: {
        i18n: true,
        hidden: (entity) => !entity.number
      },
      textZero: {
        i18n: true,
        hidden: (entity) => !entity.number
      },
      textUnique: {
        i18n: true,
        hidden: (entity) => !entity.number
      }
      /*
      texts: {
        i18n: true,
        multiple: true,
        col: false,
        hidden: (entity) => !entity.number
      }
      */
    }
  }
}
