<template>
  <span class="c-tooltiped" @mouseenter="emergent.open()" @mouseleave="emergent.close()">
    <slot></slot>
  </span>
</template>

<script>

import Emergent from '#services/Emergent'
let tooltipEmergent
export default {
  name: 'Tooltip',

  props: {
    content: { type: [String, Object] }
  },

  data: () => ({
    emergent: new Emergent(),
    tooltipEmergent: undefined
  }),

  created() {
    console.log('new tootip', this)
    if (!tooltipEmergent) {
      tooltipEmergent = this.tooltipEmergent = document.createElement('div')
      tooltipEmergent.classList.add('c-tooltip')
      document.body.appendChild(tooltipEmergent)
    }
  },

  mounted() {
    const self = this
    this.emergent.sync({
      element: tooltipEmergent,
      hook: this.$el,
      config: {
        openClass: 'c-tooltip--open',
        spacing: 10,
        inheritWidth: false,
        center: true
        // automaticMouseHandling: true
      },
      onOpen () {
        console.log('show tooltip', self, self.content)
        tooltipEmergent.innerHTML = self.content ? self.content.toString() : ''
        self.$emit('open')
      },
      onClose () {
        self.$emit('close')
      }
    })
  }
}
</script>
