<template>
  <div
    ref="emergentHook"
    class="c-selector-option"
    @mouseenter="onMouseEnter"
  >
    <span
      ref="option"
      class="c-selector-option__handler c-option c-action"
      :class="{'c-selector-option--danger': danger}"
      tabindex="0"
      :active="active"
      @click.stop.prevent="select"
      @keydown.space.stop.prevent="select"
      @keydown.enter.stop.prevent="select"
      @mouseenter="activate"
      @mouseleave="deactivate"
      @focus="activate"
      @blur="deactivate"
    >
      <span class="c-selector-option__prepend">
        <div
          v-if="multiple"
          class="c-checkbox"
          :checked="selected"
          :indeterminate="options && !selection.complete"
        ></div>
      </span>
      <span class="c-selector-option__contents"><slot></slot></span>
      <span class="c-selector-option__append">
        <span v-if="multiple && options" class="c-selector-option__counter c-chip">{{ selection.count }}/{{ selection.total }}</span>
        <span v-if="options" class="c-selector-option__arrow fi fi-rr-angle-small-right"></span>
      </span>
    </span>
    <div v-if="this.$slots.options" ref="emergent" class="c-emergent">
      <slot name="options"></slot>
    </div>
  </div>
</template>

<script>

import Selector from './Selector'
import Emergent from '#services/Emergent'

export default {
  name: 'SelectorOption',

  props: {
    danger: Boolean,
    multiple: Boolean,
    selected: Boolean,
    selection: Object,
    options: [Boolean, Array]
  },

  data: () => ({
    active: false,
    selector: undefined,
    emergent: new Emergent()
  }),

  created () {
    this.selector = this.closestComponent(Selector)
  },

  mounted () {
    this.emergent.sync({
      element: this.$refs.emergent,
      hook: this.$refs.emergentHook,
      config: {
        spacing: -6,
        aside: true
      }
    })
  },

  beforeDestroy () {
    this.emergent.close()
  },

  methods: {
    onMouseEnter () {
      if (!this.selector.keyboardNavigated) {
        this.open()
      }
    },
    activate () {
      this.open()
      this.active = true
      this.$refs.option.focus()
    },
    deactivate () {
      this.active = false
    },
    open () {
      if (!this.emergent.opened && this.$slots.options) {
        this.emergent.open()
      }
    },
    close () {
      if (this.emergent.opened && this.$slots.options) {
        this.emergent.close()
      }
    },
    select (event) {
      this.$emit('select:option', event)
    }
  }
}
</script>
