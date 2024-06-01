import Scheme from '#services/Scheme'
import Color from '#models/palette/Color'
import File from '#models/internals/File'
import validate from '#lib/validate'

export default class APIUser extends Scheme {
  constructor(data) {
    return super().mount(data)
  }

  get age() {
    return this.birthDate ? Number(((Date.now() - this.birthDate.getTime()) / 1000 / 60 / 60 / 24 / 365).toFixed(2)) : undefined
  }

  get tone() {
    return this.color
  }

  static { this.install() }

  static computed = () => ({
    age: {
      type: Number,
      hidden: (entity) => !entity.birthDate
    }
  })

  static sqlite = true

  static schema = () => ({
    name: {
      default: 'New user',
      validate: [
        validate.string,
        validate.minChars(3),
        validate.maxChars(12)
      ]
    },
    lastName: {
      default: ''
    },
    active: {
      default: false,
      type: Boolean
    },
    login: {
      default: ''
    },
    birthDate: {
      type: Date
    },
    color: {
      class: Color
    },
    picture: {
      class: File,
      metadata: true
    },
    bio: {
      textarea: true
    },
    colors: {
      class: Color,
      multiple: true,
      metadata: true,
      crud: true
    }
  })
}
