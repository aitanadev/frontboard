<template>
  <div
    ref="emergentHook"
    class="fds-c-selector-option"
    @mouseenter="onMouseEnter"
    @focusin="open"
    @mouseleave="close"
  >
    <span
      ref="option"
      class="fds-c-selector-option__handler fds-c-option fds-c-action"
      :class="{'fds-c-selector-option--danger': danger}"
      tabindex="0"
      :selected="selected"
      @click.stop.prevent="select"
      @keydown.space.stop.prevent="select"
      @keydown.enter.stop.prevent="select"
      @mouseenter="focus"
    >
      <span class="fds-c-selector-option__prepend">
        <div
          v-if="multiple"
          class="fds-c-checkbox"
          :checked="selected"
          :indeterminate="options && !selection.complete"
        ></div>
      </span>
      <span class="fds-c-selector-option__contents"><slot></slot></span>
      <span class="fds-c-selector-option__append">
        <span v-if="multiple && options" class="fds-c-selector-option__counter fds-c-chip">{{ selection.count }}/{{ selection.total }}</span>
        <span v-if="options" class="fds-c-selector-option__arrow fi fi-rr-angle-small-right"></span>
      </span>
    </span>
    <div v-if="this.$slots.options" ref="emergent" class="fds-c-emergent">
      <slot name="options"></slot>
    </div>
  </div>
</template>

<script>

import Selector from './Selector'
import Emergent from '#services/Emergent'

export default {
  name: 'FrontboardSelectorOption',

  components: {
  },

  props: {
    danger: Boolean,
    multiple: Boolean,
    selected: Boolean,
    selection: Object,
    options: [Boolean, Array]
  },

  data: () => ({
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
        // automaticMouseHandling: true
      }
    })
  },

  beforeDestroy () {
    this.emergent.close()
  },

  methods: {
    onMouseEnter () {
      /*
      if (!this.selector.keyboardNavigated) {
        this.open()
      }
      */
    },
    focus () {
      this.$refs.option.focus()
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
