<template>
  <div class="c-selector-options u-scrolled">
    <div class="c-selector-options__group c-selector-options__prepend">
      <div class="c-selector-options__group-items c-options">
        <slot name="options.prepend"></slot>
      </div>
    </div>
    <div v-if="!filteredOptions.length" class="c-selector-options__empty">
      <slot name="options.empty"></slot>
    </div>
    <div v-else class="c-selector-options__group" v-for="(group, groupIndex) in filteredOptions">
      <div
        v-if="grouped"
        class="c-selector-options__group-name"
        :key="'[' + groupIndex + ']'"
      >{{ group.text }}</div>
      <div class="c-selector-options__group-items c-options">
        <SelectorOption
          ref="option"
          v-for="(option, optionIndex) in group.options"
          :key="'[' + groupIndex + '][' + optionIndex + ']'"
          :multiple="selector.multiple"
          :selected="selector.isSelected(option)"
          :options="selector.multilevel && option.options"
          :selection="selector.getSelection(option)"
          @select:option.stop="selector.selectOption(option)"
          @keydown.right.native.stop.prevent="selector.focusInto"
          @keydown.left.native.stop.prevent="selector.focusBack"
          :class="(option && option.Class && option.Class.name === 'Color') ? 't-' + option.name : ''"
        >
          <slot name="option" v-bind="{option}"></slot>
          <template #options v-if="selector.multilevel && option.options">
            <SelectorOptions ref="options" :options="option.options" :grouped="option.grouped">
              <template #option="{option}"><slot name="option" v-bind="{option}"></slot></template>
            </SelectorOptions>
          </template>
        </SelectorOption>
      </div>
    </div>
    <div class="c-selector-options__group c-selector-options__append">
      <div class="c-selector-options__group-items c-options">
        <slot name="options.append"></slot>
      </div>
    </div>
  </div>
</template>

<script>

import Selector from './Selector'
import SelectorOption from './SelectorOption'

export default {
  name: 'SelectorOptions',

  components: {
    SelectorOption
  },

  props: {
    options: { type: Array },
    grouped: { type: Boolean }
  },

  data: () => ({
    selector: undefined
  }),

  created () {
    this.selector = this.closestComponent(Selector)
  },

  computed: {
    filteredOptions () {
      if (this.selector.filterable && this.selector.filterText.length > 0) {
        if (this.grouped) {
          const groups = []
          this.options.forEach(group => {
            const options = this.applyFilter(group.options)
            if (options.length > 0) {
              groups.push({ ...group, options })
            }
          })
          return groups
        } else {
          return [{ options: this.applyFilter(this.options) }]
        }
      } else {
        return this.grouped ? this.options : [{ options: this.options }]
      }
    }
  },

  methods: {
    applyFilter (options) {
      if (this.selector.filter) {
        return options.filter(option => this.selector.filter(option, this.selector.filterText))
      } else {
        return options.filter(option => this.selector.getOptionText(option).toLowerCase().includes(this.selector.filterText.toLowerCase()))
      }
    }
  }
}
</script>
