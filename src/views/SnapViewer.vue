<template>
  <div class="c-snap-viewer">
    <div class="c-snap-viewer__page" v-html="html"></div>
  </div>
</template>

<script>
import Vue from 'vue'
export default Vue.component('SnapViewer', {
  components: {
  },
  props: {
    value: { type: String, default: null }
  },
  data: () => ({
    html: undefined
  }),
  watch: {
  },
  created () {
    const exports = {}
    eval(this.value) // eslint-disable-line no-eval
    const snaps = exports

    const sanitizer = /(<div\n(?:\s*.*[^/][^>]\n)*\s*)(\/>)/gm
    const blocks = Object.entries(snaps).map(([snapId, snapHtml]) => {
      const sanitized = snapHtml.replace(sanitizer, '$1></div>')
      return '<div class="c-snap-viewer__block"><h1 class="c-snap-viewer__title">' + snapId + '</h1><div class="c-snap-viewer__snap">' + sanitized + '</div></div>'
    })
    const html = '<body>' + blocks.join('') + '</body>'

    const parser = new DOMParser()
    const serializer = new XMLSerializer()
    const domObject = parser.parseFromString(html || '', 'text/html')
    const sanitized = serializer.serializeToString(domObject)

    this.html = sanitized
  },
  beforeDestroy () {
  },
  methods: {
  }
})
</script>

<style lang="scss">
.c-snap-viewer {
  padding: 20px;
}

.c-snap-viewer__page {
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.c-snap-viewer__block {
  border-radius: 3px;
  overflow: hidden;
}

.c-snap-viewer__title {
  font-size: 12px;
  font-weight: 700;
  line-height: 16px;
  padding: 10px 20px;
}

.c-snap-viewer__snap {
  padding: 20px;
  overflow: scroll;
  position: relative;
  z-index: 1;
  min-height: 300px;
  background-color: #ffffff;

  .c-emergent__modal-overlay {
    position: relative;
    padding: 20px;
  }

  .c-acl-list__list {
    overflow: visible;
  }
}
</style>
