import Entity from '#services/Entity'

export default class File extends Entity {
  constructor(data) {
    const self = super().mount(data)
    if (data.contents) self.contents = data.contents
    return self
  }

  #contents

  get ext() {
    return this.name.includes('.') ? this.name.split('.').pop() : ''
  }

  get isImage() {
    return !!this.mime?.includes('image')
  }

  get image() {
    return this
  }

  get contents() {
    return this.#contents
  }

  set contents(value) {
    this.#contents = value
  }

  static { this.install() }

  static computed = () => ({
    contents: {
      textarea: true,
      col: false
    },
    image: {
      class: File,
      metadata: true,
      hidden: (entity) => !entity.isImage
    }
  })

  static schema = () => ({
    name: {
      default: '',
      sticky: 'left'
    },
    lastModified: {
      type: Date
    },
    url: {
      default: ''
    },
    width: {
      type: Number,
      default: 0
    },
    height: {
      type: Number,
      default: 0
    },
    size: {
      type: Number,
      default: 0
    },
    mime: {}
  })
}
