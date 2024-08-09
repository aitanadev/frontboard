<template>
  <div class="fds-c-confirm fds-c-emergent__modal-overlay">
    <div class="fds-c-emergent fds-c-emergent--small">
      <div class="fds-c-emergent__header">
        <h1 class="fds-c-emergent__title" :class="{'fds-c-emergent__title--error': error}">{{ title }}</h1>
        <button @click="$emit('input', false)" class="fds-c-emergent__close">close</button>
      </div>
      <div class="fds-c-emergent__body">
        <slot></slot>
        <p class="fds-c-confirm__verify" v-if="verify">{{ verifyMessage }} <input type="checkbox" class="fds-c-checkbox" v-model="verified"></p>
      </div>
      <div class="fds-c-emergent__footer">
        <div class="fds-c-emergent__actions">
          <button :disabled="verify && !verified" class="fds-c-action t-primary" @click="$emit('input', true)" tabindex="0">{{ actionButtonMessage }}</button>
          <button v-if="cancelable" class="fds-c-action t-primary" @click="$emit('input', false)" tabindex="0">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Modal',

  props: {
    error: { type: Boolean },
    title: { type: String },
    cancelable: { type: Boolean },
    actionButtonMessage: { type: String, default: 'OK' },
    verifyMessage: { type: String, default: 'Are you sure?' },
    verify: { type: Boolean }
  },

  data: () => ({
    verified: false
  })
}
</script>

<style lang="scss">
  .fds-c-confirm__verify {
    margin-top: var(--spacing-xxl);
  }
</style>
