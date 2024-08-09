import APP from '#services/APP'

class Emergent {
  #element
  #hook
  #config
  #onOpen
  #onClose
  #opened = false
  #delayTimeout = false

  constructor (syncData) {
    if (syncData) {
      if (!syncData.element || !syncData.hook) throw new Error('Emergent constructor needs a emergent element and a hook element')
      this.sync(syncData)
    }
  }

  get element () {
    return this.#element
  }

  get hook () {
    return this.#hook
  }

  get opened () {
    return this.#opened
  }

  get openClass () {
    return this.#config.openClass ?? 'fds-c-emergent--open'
  }

  sync (syncData = {}) {
    const { element, hook, config, onOpen, onClose } = syncData
    this.#element = element
    this.#hook = hook
    this.#config = config || {}
    this.#onOpen = onOpen
    this.#onClose = onClose

    if (config.automaticMouseHandling && hook && element) {
      this.onMouseEnter = () => {
        // console.warn('----> enter', event)
        if (this.#delayTimeout) clearTimeout(this.#delayTimeout)
        if (!this.opened) {
          this.#delayTimeout = setTimeout(() => {
            this.open()
          }, Emergent.mouseEnterDelay)
        }
      }
      /* */
      this.onMouseLeave = (event) => {
        if (this.#hook.contains(event.relatedTarget) || this.#element.contains(event.relatedTarget)) {
          clearTimeout(this.#delayTimeout)
          return
        }
        // console.warn('<--- leave ', event, this.#hook)
        if (this.#delayTimeout) clearTimeout(this.#delayTimeout)
        if (this.opened) {
          this.#delayTimeout = setTimeout(() => {
            this.close()
          }, Emergent.mouseLeaveDelay)
        }
      }
      /* */

      hook.addEventListener('mouseenter', this.onMouseEnter)
      hook.addEventListener('mouseleave', this.onMouseLeave)
      element.addEventListener('mouseenter', this.onMouseEnter)
      element.addEventListener('mouseleave', this.onMouseLeave)
    }
    if (element) {
      element.addEventListener('scroll', this.stopPropagation)
      element.addEventListener('wheel', this.stopPropagation)
    }
    return this
  }

  stopPropagation(event) {
    event.stopPropagation()
  }

  notify () {
    if (this.__ob__) this.__ob__.dep.notify()
  }

  open () {
    if (this.#opened) return
    if (this.#delayTimeout) clearTimeout(this.#delayTimeout)

    const stack = Emergent.#stack
    stack.forEach(emerged => {
      if (!emerged.element.contains(this.#element) && !emerged.element.contains(this.#hook)) {
        emerged.close()
      }
    })

    if (!stack.has(this)) {
      stack.add(this)
    }

    if (this.#onOpen) this.#onOpen()
    Emergent.#positionControl()
    this.#opened = true
    this.notify()
  }

  close() {
    if (!this.#opened) return
    if (this.#delayTimeout) clearTimeout(this.#delayTimeout)

    this.#opened = false
    this.#element.classList.remove(this.openClass)
    Emergent.#stack.delete(this)
    if (this.#onClose) this.#onClose()
    this.notify()
  }

  toggle () {
    if (this.#opened) {
      this.close()
    } else {
      this.open()
    }
  }

  refreshPosition () {
    const element = this.#element
    const hook = this.#hook
    const config = this.#config
    const relativePositioning = APP.isJest

    element.classList.add(this.openClass)
    element.style.position = 'fixed'

    if (relativePositioning) {
      element.style.position = 'absolute'
      element.style.top = '30px'
      return
    }

    const hookBounds = hook.getBoundingClientRect()
    if (config.inheritWidth) element.style.minWidth = hookBounds.width + 'px'
    const emergedBounds = element.getBoundingClientRect()

    config.topPosition = config.topPosition || 0
    config.bottomPosition = config.bottomPosition || 0
    config.rightPosition = config.rightPosition || 0
    config.leftPosition = config.leftPosition || 0
    config.spacing = config.spacing || 0
    const position = {}

    if (config.aside) {
      position.top = hookBounds.y + config.topPosition - config.spacing - emergedBounds.height + hookBounds.height
      position.bottom = hookBounds.y + config.bottomPosition + config.spacing
      position.right = hookBounds.x + config.rightPosition + hookBounds.width
      position.left = hookBounds.x + config.leftPosition - emergedBounds.width
      position.centerY = hookBounds.y + config.topPosition - emergedBounds.height / 2 + hookBounds.height / 2
    } else {
      position.top = hookBounds.y + config.topPosition - config.spacing - emergedBounds.height
      position.bottom = hookBounds.y + config.bottomPosition + config.spacing + hookBounds.height
      position.right = hookBounds.x + config.rightPosition
      position.left = hookBounds.x + config.leftPosition - emergedBounds.width + hookBounds.width
      position.centerX = hookBounds.x + config.leftPosition - emergedBounds.width / 2 + hookBounds.width / 2
    }

    const viewportSpacing = typeof config.viewportSpacing === 'number' ? config.viewportSpacing : 10
    const maxHeight = window.innerHeight - viewportSpacing
    const maxWidth = window.innerWidth - viewportSpacing
    const fitTop = position.top > viewportSpacing
    const fitBottom = position.bottom + emergedBounds.height < maxHeight
    const fitRight = position.right + emergedBounds.width < maxWidth
    const fitLeft = position.left > viewportSpacing

    const toLeft = fitLeft && (config.left || !fitRight)
    const toTop = fitTop && (config.top || !fitBottom)
    const toCenterX = config.center && !config.aside
    const toCenterY = config.center && config.aside

    let left = toCenterX ? position.centerX : (toLeft ? position.left : position.right)
    let top = toCenterY ? position.centerY : (toTop ? position.top : position.bottom)

    if (left + emergedBounds.width > maxWidth) left = maxWidth - emergedBounds.width
    if (top + emergedBounds.height > maxHeight) top = maxHeight - emergedBounds.height
    if (left < viewportSpacing) left = viewportSpacing
    if (top < viewportSpacing) top = viewportSpacing

    element.style.left = left + window.scrollX + 'px'
    element.style.top = top + window.scrollY + 'px'
  }

  static #stack = new Set()

  static mouseEnterDelay = 600
  static mouseLeaveDelay = 250

  static get stack () {
    return this.#stack
  }

  static #positionControl () {
    const stack = Emergent.#stack
    if (stack.size > 0) {
      stack.forEach(emerged => {
        emerged.refreshPosition()
      })
      window.requestAnimationFrame(Emergent.#positionControl)
    }
  }

  static onDocumentClick (event) {
    const stack = Emergent.#stack
    if (stack.size > 0) {
      const eventPath = event.path || (event.composedPath && event.composedPath())
      stack.forEach(emerged => {
        if (!eventPath.includes(emerged.#element) && !eventPath.includes(emerged.#hook)) emerged.close()
      })
    }
  }

  static onDocumentEsc (event) {
    const stackArray = [...Emergent.#stack]
    if (stackArray.length > 0) {
      if (event.keyCode === 27) { // ESC key
        const lastEmerged = stackArray.pop()
        lastEmerged.close()
      }
    }
  }
}

document.addEventListener('click', Emergent.onDocumentClick)
document.addEventListener('keydown', Emergent.onDocumentEsc)
// document.addEventListener('focusin', Emergent.onDocumentClick)

export default Emergent
