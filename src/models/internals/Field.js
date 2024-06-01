import Scheme from '#services/Scheme'
import APP from '#services/APP'
import i18n from '#services/i18n'
import Fieldset from '#models/internals/Fieldset'

export default class Field extends Scheme {
  constructor(data) {
    window.addEventListener('i18n:language', () => {
      if (this.__ob__) this.__ob__.dep.notify()
    })
    return super().mount(data)
  }

  #fieldset
  #component
  #model

  get fieldset() {
    return this.#fieldset
  }

  set fieldset(value) {
    this.#fieldset = value
  }

  get isComputedReadonly() {
    if (this.fieldset) {
      const Class = Scheme.models[this.fieldset.name]
      if (Class) {
        return Class.computedReadonly.includes(this.key)
      }
    }
  }

  get isInvent() {
    return !this.fieldset
  }

  get label() {
    if (this.key && this.key[0] === '$') return ''
    const preset = this.key ? this.key.toSpaces().capitalize() : this.key
    return this.fieldset ? i18n(`fieldsets.${this.fieldset.name}.fields.${this.key}.label`, preset).capitalize() : preset
  }

  get component() {
    return this.#component ? APP.components[this.#component] : APP.components.DefaultField
  }

  set component(value) {
    this.#component = value
  }

  get model() {
    return this.#model
  }

  set model(value) {
    this.#model = value
  }

  format(value) {
    return value
  }

  static { this.install() }

  static config = {
    freeze: false
  }

  static computed() {
    return {
      model: {},
      component: {}
    }
  }

  static schema() {
    return {
      key: {},
      col: { type: Boolean, default: true },
      field: { type: Boolean, default: true },
      size: { type: Number, default: 160 },
      sticky: { options: [
        {text: 'Left', value: 'left'},
        {text: 'Right', value: 'right'}
      ]},
      // model: {},
      tab: { type: Boolean },
      fixed: { type: Boolean },
      crud: { type: Boolean },
      multiple: { type: Boolean },
      class: {},
      metadata: { type: Boolean },
      options: {},
      type: {},
      default: {},
      hidden: { type: Boolean },
      readonly: { type: Boolean },
      textarea: { type: Boolean },
      range: { type: Boolean },
      min: { type: Number },
      max: { type: Number }
    }
  }
}
