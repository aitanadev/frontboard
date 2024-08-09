export class I18n extends String {
  node
  context
  placeHolder

  constructor(node, context, placeHolder) {
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
    Object.assign(this, { node, context, placeHolder })
  }

  toString() {
    const { node, context, placeHolder } = this
    const translationBlockPath = node.split('.')
    const translation = I18n.translations.find(translation => translation.node === translationBlockPath.join('.'))
    return (translation && translation.translate(context)) || placeHolder || node // .split('.').pop()
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

export default function i18n (node, context, placeHolder) {
  return new I18n(node, context, placeHolder)
}
