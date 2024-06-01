<template>
  <div class="c-scheme__breadcrum">
    <template v-for="(view, key) in parentViews">
      <span v-if="view.$options.name === 'SchemeDetail'">{{ view.entity }}</span>
      <span v-else-if="view.$options.name === 'SchemeList'">{{ (view.prop ? view.prop : view.schemeClass.plural).toSpaces().capitalize() }}</span>
      <span v-if="key < parentViews.length - 1"> / </span>
    </template>
  </div>
</template>

<script>
import Scheme from '#services/Scheme'

export default {
  name: 'SchemeBreadcrumb',

  props: {
  },

  data: () => ({
    parentViews: []
  }),

  created() {
    window.SchemeBreadcrumb = this

    const parentViews = []
    let parent = this.$parent.$parent
    while (parent) {
      // console.log('parentDetail', parent)
      if (parent.$options && ['SchemeDetail', 'SchemeList'].includes(parent.$options.name)) {
        parentViews.push(parent)
      }
      parent = parent.$parent
    }

    this.parentViews = parentViews.toReversed()
  }
}
</script>
