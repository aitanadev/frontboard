export class I18n extends String {
  dotText
  context
  placeHolder

  constructor(dotText, context, placeHolder) {
    super()
    if (typeof context === 'number') {
      context = { number: context }
    }
    if (typeof context === 'string') {
      if (placeHolder === undefined) {
        placeHolder = context
        context = {}
      }
    }
    Object.assign(this, { dotText, context, placeHolder })
  }

  toString() {
    const { dotText, context, placeHolder } = this
    const translationBlockPath = dotText.split('.')
    const translationBlockName = translationBlockPath.shift()
    const translation = I18n.translations[translationBlockName]?.find(translation => translation.dotText === translationBlockPath.join('.'))
    return (translation && translation.translate(context)) || placeHolder || dotText
  }

  static #language = 'ES'

  static get language() {
    return this.#language
  }

  static set language(value) {
    this.#language = value
    window.dispatchEvent(new Event('i18n:language'))
  }

  static translations = []
}

export default function i18n (dotText, context, placeHolder) {
  return new I18n(dotText, context, placeHolder)
}
