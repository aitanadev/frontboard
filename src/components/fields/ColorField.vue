<template>
  <div class="fds-c-color-field" :style="{'--color-hsl': form[field.key] }">
    {{ form[field.key] }}
  </div>
</template>

<script>

import Vue from 'vue'

export default {
  name: 'ColorField',

  props: {
    form: { type: Object },
    field: { type: Object },
    filter: { type: Boolean },
    viewer: { type: Boolean }
  }
}
</script>

<style lang="scss">
  .fds-c-color-field {
    display: block;
    background-color: var(--color-hsl);
    border-radius: var(--border-radius);
    padding: var(--spacing-xs) var(--spacing-l);
    color: white;
    text-shadow: 0px 0px 3px rgba(0, 0, 0, 0.3);
    flex-grow: 1;
  }
</style>
