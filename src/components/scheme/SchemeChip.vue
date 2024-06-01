<template>
  <span class="c-scheme-chip" :class="{'c-scheme-chip--multiline': multiline, 'c-scheme-chip--link': link, [(entity.tone ? 't-' + entity.tone.name : '')]: true }">
    <a v-if="link" :href="entity.getLink()" class="c-scheme-chip__text c-chip">{{ entity.toString() }}</a>
    <span v-else class="c-scheme-chip__text c-chip">{{ entity.toString() }}</span>
    <div v-if="typed" class="c-scheme-chip__type c-chip">{{ i18n(`models.${entity.Class.name}`) }}</div>
  </span>
</template>

<script>

import Emergent from '#services/Emergent'

export default {
  name: 'SchemeChip',

  props: {
    entity: { type: Object, required: true },
    full: Boolean,
    multiline: Boolean,
    link: Boolean,
    typed: Boolean
  },

  created() {
    window.SchemeChip = this
  }
}
</script>
