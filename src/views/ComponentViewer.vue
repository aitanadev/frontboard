<template>
  <div class="fds-c-component-viewer">
    <div>{{ value.path }}</div>
    <pre>{{ info }}</pre>
  </div>
</template>

<script>
import Vue from 'vue'
import APP from '#services/APP'
export default Vue.component('ComponentViewer', {
  components: {
  },
  props: {
    value: Object
  },
  data: () => ({
    info: {},
    contents: undefined,
    slotRegex: /<slot.*:?name="([^"]*)"/gm,
    eventsRegex: /\$emit\('(.*)'.*\)/gm
  }),
  created () {
    window.ComponentViewer = this
    this.value.import().then(contents => {
      this.contents = contents
      const component = APP.components[this.value.path.split('/').pop().replace(/\.vue$/, '')]
      const componentName = component.options.name
      this.info.name = componentName
      this.info.props = component.options.props
      this.info.slots = this.slotRegex.execBatch(contents).map(match => match[1])
      this.info.events = this.eventsRegex.execBatch(contents).map(match => match[1])

      this.$forceUpdate()
    })
  },
  beforeDestroy () {
  },
  methods: {
  }
})
</script>
