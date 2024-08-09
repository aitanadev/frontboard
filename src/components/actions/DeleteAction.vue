<template>
  <Modal @input="modalChange" verify cancelable title="Confirm to remove the item"> {{ bulk ? 'bulk' : ''}} etc etc etc...</Modal>
</template>

<script>
import Vue from 'vue'

export default {
  name: 'DeleteAction',

  props: {
    action: { type: Object, required: true }
  },

  computed: {
    entity () {
      return this.action.entity
    },
    bulk () {
      return this.action.entities
    }
  },

  methods: {
    async modalChange(value) {
      if (value) {
        if (this.entity) {
          // do deletion
          const entity = this.entity.$parent || this.entity
          const context = this.$parent
          await entity.delete(context.api)
          const list = context.list || context.currentPage
          const index = list.indexOf(entity)
          // console.log('remove index', this, entity)
          if (index >= 0) {
            list.splice(index, 1)
            if (context.list) context.$emit('input', [...context.list])
            // this.loadPage()
          }
        }
      }

      this.$emit('done')
    }
  }
}
</script>

<style lang="scss">
</style>
