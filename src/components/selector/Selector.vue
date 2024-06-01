<template>
  <div
    ref="emergentHook"
    class="c-selector"
    :class="{
      'c-selector--keyboard-navigated': keyboardNavigated,
      'c-selector--multiple': multiple,
      'c-selector--opened': emergent.opened,
      'c-selector--disabled': disabled
    }"
    @select:option.stop
    @keydown.down.stop.prevent="focusNext(false)"
    @keydown.up.stop.prevent="focusNext(true)"
  >
    <input ref="input" type="hidden" :name="name" :id="id" tid="select_value" :value="inputValue" />
    <div
      class="c-selector__handler c-field"
      @keydown.space.stop="open"
      @keydown.enter.stop="open"
      @click="toggle"
    >
      <slot v-bind="{Selector: _self}">
        <div tabindex="0" class="c-selector__handler-input c-input">
          <div class="c-selector__handler-content">
            <template v-if="!multiple" class="c-chip">
              <slot name="value" v-bind="{value: currentValue, option: indexedOptions[currentValue]}">{{ getOptionText(indexedOptions[currentValue]) }}</slot>
            </template>
            <template v-else>
              <span class="c-selector__handler-items  u-scrolled">
                <span class="c-selector__handler-item c-chip" v-for="valueItem in currentValue">
                  <span>
                    <slot name="value" v-bind="{value: valueItem, option: indexedOptions[valueItem]}">{{ getOptionText(indexedOptions[valueItem]) }}</slot>
                  </span>
                  <button class="c-selector__clear-item c-action" @click.stop.prevent="selectOption(indexedOptions[valueItem])">
                    <span class="fi fi-rr-cross-small"></span>
                  </button>
                </span>
              </span>
            </template>
          </div>
        </div>
        <button v-if="clearable && currentValue" class="c-selector__clear c-action" @click.stop.prevent="clear">
          <span class="fi fi-rr-cross-small"></span>
        </button>
        <button @click.prevent class="c-selector__down c-action"><span class="fi fi-rr-caret-down"></span></button>
      </slot>
    </div>
    <div ref="emergent" class="c-emergent" @click.stop>
      <div v-if="loading" class="c-emergent__loading"></div>
      <template v-if="emergent.opened">
        <div v-if="filterable" class="c-selector__filter">
          <div class="c-field">
            <input ref="filter" class="c-input" type="text" :placeholder="filterPlaceholder" v-model="filterText" @input="$emit('filter', $event.target.value)" tid="select_input_filter"/>
            <button v-if="filterText" class="c-selector__clear c-action" @click.stop.prevent="clearFilterText">
              <span class="fi fi-rr-cross-small"></span>
            </button>
          </div>
        </div>
        <SelectorOptions ref="options" :options="options" class="c-selector__options" :grouped="grouped">
          <template #options.prepend><slot name="options.prepend"></slot></template>
          <template #option="{option}"><slot name="option" v-bind="{option, selector: _self}"><span v-html="mark(option)"></span></slot></template>
          <template #options.append><slot name="options.append"></slot></template>
          <template #options.empty><slot name="options.empty"><strong>{{ emptyMessage }}</strong></slot></template>
        </SelectorOptions>
      </template>
    </div>
  </div>
</template>

<script>

import Emergent from '#services/Emergent'
import SelectorOptions from './SelectorOptions'

export default {
  name: 'Selector',

  components: {
    SelectorOptions
  },

  props: {
    name: { type: String },
    id: { type: String },
    options: { type: Array, default: () => [] },
    value: { type: [String, Object, Array, Boolean, Function, Number] },
    optionValue: { type: [String, Function], default: 'value' },
    optionText: { type: [String, Function], default: 'text' },
    useObject: { type: Boolean, default: false },
    filterable: { type: Boolean, default: false },
    filter: { type: Function },
    multiple: { type: Boolean, default: false },
    multilevel: { type: Boolean, default: false },
    grouped: { type: Boolean, default: false },
    keepOpen: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    emptyMessage: { type: String, default: 'No results found.' },
    filterPlaceholder: { type: String },
    clearable: { type: Boolean }
  },

  data: () => ({
    currentValue: undefined,
    emergent: new Emergent(),
    filterText: '',
    keyboardNavigated: false
  }),

  created () {
    this.currentValue = this.parseValue(this.value)
    document.addEventListener('mousemove', this.skipKeyboardNavigation)
  },

  watch: {
    value (value, prevValue) {
      this.currentValue = this.parseValue(value)
    },
    options (value, prevValue) {
      this.currentValue = this.parseValue(this.value)
    }
  },

  mounted () {
    const self = this
    this.emergent.sync({
      element: this.$refs.emergent,
      hook: this.$refs.emergentHook,
      config: {
        spacing: 2,
        // left: true,
        inheritWidth: true
      },
      onOpen () {
        self.$emit('open')
      },
      onClose () {
        self.$emit('close')
      }
    })
  },

  beforeDestroy () {
    document.removeEventListener('mousemove', this.skipKeyboardNavigation)
    this.emergent.close()
  },

  computed: {
    indexedOptions () {
      return this.optionsWalker(this.options)
    },
    inputValue () {
      if (this.multiple) {
        return '[' + this.currentValue.join(',') + ']'
      } else {
        return this.currentValue
      }
    }
  },

  methods: {
    clear () {
      this.updateValue()
    },
    open () {
      window.Selector = this
      if (!this.disabled && !this.emergent.opened) {
        this.emergent.open()
        if (this.filterable) {
          this.$nextTick(() => {
            this.$refs.filter.focus()
          })
        }
      }
    },
    toggle () {
      if (this.emergent.opened) {
        this.emergent.close()
      } else {
        this.open()
      }
    },
    getOptionValue (option) {
      if (!option) return option
      if (typeof option === 'object') {
        if (typeof this.optionValue === 'function') {
          return this.optionValue(option)
        } else {
          return option[this.optionValue]
        }
      } else {
        return option
      }
    },
    getOptionText (option) {
      if (!option) return ''
      if (typeof option === 'object') {
        if (typeof this.optionText === 'function') {
          return this.optionText(option)
        } else {
          return option[this.optionText]
        }
      } else {
        return option
      }
    },
    isSelected (option) {
      if (this.multiple) {
        if (this.multilevel && option.options) {
          return option.options.every(option => {
            if (option.options) {
              return this.isSelected(option)
            } else {
              return this.currentValue.some(value => this.getOptionValue(option) === value)
            }
          })
        } else {
          return this.currentValue.some(value => this.getOptionValue(option) === value)
        }
      } else {
        return this.currentValue === this.getOptionValue(option)
      }
    },
    getSelection (option) {
      if (this.multiple && this.multilevel && option.options) {
        let count = 0
        let total = 0
        option.options.forEach(option => {
          if (option.options) {
            const subSelection = this.getSelection(option)
            total += subSelection.total
            count += subSelection.count
          } else {
            const selected = this.isSelected(option)
            total += 1
            if (selected) count += 1
          }
        })
        return { count, total, complete: count === total }
      }
    },
    selectOption (option) {
      if (this.multilevel && option.options && !this.multiple) return
      if (this.multilevel && option.options) {
        let newOptions = [...this.currentValue]
        const isSelected = this.isSelected(option)
        Object.values(this.optionsWalker(option.options)).forEach(option => {
          if (isSelected) {
            const optionIndex = this.currentValue.indexOf(this.getOptionValue(option))
            newOptions.splice(optionIndex, 1)
          } else {
            newOptions.push(this.getOptionValue(option))
          }
        })
        this.updateValue(newOptions)
      } else if (this.multiple) {
        let newOptions = [...this.currentValue]
        if (this.isSelected(option)) {
          const optionIndex = this.currentValue.indexOf(this.getOptionValue(option))
          newOptions.splice(optionIndex, 1)
        } else {
          newOptions.push(this.getOptionValue(option))
        }
        this.updateValue(newOptions)
      } else {
        this.updateValue(this.getOptionValue(option))
      }
      if (!this.keepOpen && !this.multiple) {
        this.emergent.close()
      }
    },
    parseValue (value) {
      if (this.multiple && !value) {
        return []
      } else if (!this.useObject) {
        return value
      } else if (this.multiple) {
        if (!Array.isArray(value)) throw new Error('Selector multiple needs an array as value, passed "' + typeof value + '"')
        return value.map(value => this.getOptionValue(value))
      } else {
        return this.getOptionValue(value)
      }
    },
    updateValue (value) {
      this.currentValue = value
      let returnValue
      if (!this.useObject) {
        returnValue = value
      } else if (this.multiple) {
        returnValue = value.map(value => this.indexedOptions[value])
      } else {
        returnValue = this.indexedOptions[value]
      }
      this.$emit('input', returnValue)
      this.$refs.input.dispatchEvent(new Event('input', { bubbles: true }))
    },
    optionsWalker (options, result = {}) {
      options.forEach(option => {
        if (option.options && this.multilevel) {
          this.optionsWalker(option.options, result)
        } else {
          result[this.getOptionValue(option)] = option
        }
      })
      return result
    },
    skipKeyboardNavigation () {
      this.keyboardNavigated = false
    },
    focusBack (event) {
      this.keyboardNavigated = true
      const parentOption = event.target.closest('.c-selector-options').closest('.c-selector-option')
      if (parentOption) {
        const next = parentOption.querySelector('.c-selector-option__handler')
        if (next) next.focus()
      }
    },
    focusInto (event) {
      this.keyboardNavigated = true
      const innerOptions = event.target.closest('.c-selector-option').querySelector('.c-selector-options')
      if (innerOptions) {
        const next = innerOptions.querySelector('.c-selector-option__handler')
        if (next) next.focus()
      }
    },
    focusNext (reverse) {
      this.keyboardNavigated = true
      if (!this.emergent.opened) return this.open()
      const allOptions = [...this.$el.querySelectorAll('.c-selector-option__handler')]
      const focused = allOptions.includes(document.activeElement) && document.activeElement
      if (focused) {
        const closest = focused.closest('.c-selector-options')
        const siblings = allOptions.filter(option => option.closest('.c-selector-options') === closest)
        const focusedIndex = siblings.indexOf(focused)
        const next = (siblings.length + focusedIndex + (reverse ? -1 : 1)) % siblings.length
        siblings[next].focus()
      } else {
        const closest = this.$el.querySelector('.c-selector__options')
        const siblings = allOptions.filter(option => option.closest('.c-selector-options') === closest)
        const next = reverse ? siblings[siblings.length - 1] : siblings[0]
        next.focus()
      }
    },
    mark (option) {
      return (this.getOptionText(option) || '').toString().marker(this.filterText)
    },
    clearFilterText () {
      this.filterText = ''
      this.$refs.filter.focus()
    }
  }
}
</script>

<style lang="scss">
.c-selector {
  min-width: 120px;
  // max-width: 100%;
  display: inline-flex;
  flex-grow: 1;
  .c-emergent {
    border-radius: var(--border-radius) var(--border-radius);
    padding: var(--padding-m) 0;
  }
  &:not(.c-selector--multiple) .c-selector__handler {
    cursor: pointer;
  }
}

.c-selector__handler {
  width: 100%;
}

.c-selector__handler-input {
  position: relative;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  width: 0;
}

.c-selector__handler-items {
  // Review: modified from c-input > c-chip

  gap: var(--spacing-m) 0;
  display: flex;
  flex-direction: row;
  align-content: flex-start;
  justify-content: flex-start;
  align-items: center;

  overflow: auto;
  width: 100%;
  &:hover {
    // flex-wrap: wrap;
  }
}

.c-selector__handler-content {
  flex-shrink: 1;
  width: 100%;
  flex-grow: 1;
  height: 100%;
  display: flex;
}

.c-selector__filter {
  display: flex;
  padding: var(--spacing-m) var(--spacing-m);
  border-bottom: 1px solid var(--color--light-3);
  .c-field {
    width: 100%;
  }
}

.c-selector__empty {
  padding: 6px 9px;
}

.c-selector--keyboard-navigated {
  * {
    cursor: default;
    pointer-events: none;
  }
}

// SelectorOptions
.c-selector-options__group-name {
  padding: var(--spacing-s) var(--spacing-m);
  text-transform: uppercase;
  font-weight: var(--font-weightv-semibold);
}
.c-selector-options__empty {
  padding: var(--spacing-xl);
}

// SelectorOption
.c-selector-option__handler {
  > * {
    display: flex;
    align-items: center;
  }
}
.c-selector-option__contents {
  flex-grow: 1;
}
.c-selector-option__counter {
  min-width: 40px;
}

.c-selector-option {
  padding: 0 var(--spacing-m);
  &:focus-within {
    background-color: var(--color--primary);
    >.c-option {
      color: var(--color--light-3);
      text-shadow: var(--text-shadow--dark);
    }
  }
}
</style>
