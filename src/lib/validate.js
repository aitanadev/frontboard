import i18n from '#services/i18n'

const rules = {
  string: v => typeof v === 'string',
  int: v => !Number.isNaN(Number(v)) && Number.isInteger(Number(v)),
  email: v => /^([a-zA-Z0-9_.+-])+@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(v),
  url: v => /^(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)+$/.test(v)
}

const factories = {
  minChars (min) {
    return v => !!v && v.length >= min
  },
  maxChars (max) {
    return v => !v || v.length <= max
  },
  minValue (min) {
    return v => !Number.isNaN(Number(v)) && v >= min
  },
  maxValue (max) {
    return v => !Number.isNaN(Number(v)) && v <= max
  }
}

const validate = window.validate = {}

class Validation {
  constructor (rule, args) {
    this.name = rule.name
    if (args) {
      const factory = rule
      const paramsNames = factory.toString().split(/[()]/)[1].split(',').map(v => v.trim())
      this.params = {}
      paramsNames.forEach((paramName, i) => {
        this.params[paramName] = args[i]
      })
      this.rule = factory(...args)
    } else {
      this.rule = rule
    }
  }

  check (value, entity) {
    // const defaultDotText = 'validate.default'
    const validation = this.rule(value, entity)
    const valid = validation && typeof validation !== 'string'
    const node = typeof validation === 'string' ? validation : ('validate.' + this.name)
    return valid ? undefined : i18n(node, this.params)

    // const message = vuei18n.te(i18n) ? vuei18n.t(i18n, this.params) : defaultMessage
    // return this.rule(value, args) ? false : message
  }
}

for (const name in rules) {
  const rule = rules[name]
  validate[name] = new Validation(rule)
}

for (const name in factories) {
  const factory = factories[name]
  validate[name] = function ValidationFactory (...args) {
    return new Validation(factory, args)
    // return new Validation(factory, [...args])
  }
}

export default validate
