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
    return this.fieldset ? i18n(`Scheme.${this.fieldset.name}.${this.key}.label`, preset).capitalize() : preset
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
    return this.formater ? this.formater(value) : value
  }

  static { this.install() }

  static config = {
    freeze: false
  }

  static computed() {
    return {
      fieldset: {
        readonly: true
      },
      model: {
        readonly: true
      },
      label: {
        col: false
      },
      component: {
        readonly: true,
        formater(value) {
          return value?.options.name
        }
      }
    }
  }

  static schema() {
    return {
      key: {},
      field: {
        type: Boolean,
        default: true
      },
      col: {
        type: Boolean,
        default: true
      },
      filterable: {
        type: Boolean,
        default: true
      },
      readonly: {
        type: Boolean,
        default: false
      },
      multiple: {
        type: Boolean,
        default: false
      },
      crud: {
        type: Boolean,
        default: false
      },
      tab: {
        type: Boolean,
        default: false
      },
      metadata: {
        type: Boolean,
        default: false
      },
      textarea: {
        type: Boolean,
        default: false
      },
      range: {
        type: Boolean,
        default: false
      },
      size: {
        type: Number,
        default: 160
      },
      type: {
        default: () => String,
        readonly: true,
        formater(value) {
          return value.name
        }
      },
      sticky: {
        options: [
          {text: 'none', value: false},
          {text: 'left', value: 'left'},
          {text: 'right', value: 'right'}
        ],
        default: false
      },
      min: {
        type: Number
      },
      max: {
        type: Number
      },
      hidden: {
        col: false,
        type: Boolean,
        readonly: true
      },
      class: {
        readonly: true
      },
      options: {
        col: false,
        readonly: true
      },
      default: {
        col: false,
        readonly: true
      },
      formater: {
        col: false,
        readonly: true
      }
    }
  }
}
