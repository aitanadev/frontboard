<template>
  <span class="fds-c-entity-label" :class="{'fds-c-entity-label--multiline': multiline, [(entity.tone ? 't-' + entity.tone.name : '')]: true }">
    <!-- <a v-if="link" :href="entity.getLink()" class="fds-c-entity-label__text fds-c-chip">{{ entity.toString() }}</a> -->
    <span class="fds-c-entity-label__text" v-html="marked || entity.toString()" @click.stop="emergent.toggle()"></span>
    <div v-if="typed" class="fds-c-entity-label__type">{{ i18n(`Entity.${entity.Class.name}`) }}</div>
    <div ref="emergent" class="fds-c-emergent">
      <EntityDetail v-if="emergent.opened" modal :entityClass="entity.Class" :id="entity.id" :key="entity.uid" @close="emergent.close()" @input="onEntitySave" :metadata="metadata" :api="api"/>
    </div>
  </span>
</template>

<script>

import Emergent from '#services/Emergent'

export default {
  name: 'EntityLabel',

  props: {
    entity: { type: Object, resquired: true },
    full: Boolean,
    multiline: Boolean,
    // linked: Boolean,
    typed: Boolean,
    marked: String
  },

  data: () => ({
    emergent: new Emergent(),
    metadata: false,
    api: false
  }),

  created() {
    window.EntityLabel = this
    const Class = this.entity.Class
    this.api = Class.config.freeze
  },

  mounted() {
    const self = this
    const hook = this.$el.closest('.fds-c-datagrid__cell') || this.$el

    this.emergent.sync({
      element: this.$refs.emergent,
      hook,
      config: {
        top: true,
        leftPosition: 6,
        rightPosition: -6,
        viewportSpacing: 0
        // bottomPosition: -3,
        // topPosition: 3
        // spacing: 10
        // automaticMouseHandling: true
      },
      onOpen () {
        // console.log('show entityLabelModal', self, self.content)
        // self.$emit('open')
      },
      onClose () {
        // console.warn('close entityLabelModal', self, self.content)
        // self.$emit('close')
      }
    })
  },

  methods: {
    onEntitySave() {
      //
    }
  }
}
</script>
