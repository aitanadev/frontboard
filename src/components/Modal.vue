<template>
  <div class="c-modal c-emergent__modal-overlay">
    <div class="c-emergent c-emergent--small">
      <div class="c-emergent__header">
        <h1 class="c-emergent__title" :class="{'c-emergent__title--error': error}">{{ title }}</h1>
        <button @click="dismiss" class="c-emergent__close">close</button>
      </div>
      <div class="c-emergent__body">
        <p>{{ message }}</p>
      </div>
      <div class="c-emergent__footer">
        <div class="c-emergent__actions">
          <button class="c-action t-primary" @click="dismiss" tabindex="0">OK</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Modal',

  props: {
    error: { type: Object },
    title: { type: String },
    message: { type: String }
  },

  methods: {
    dismiss() {
      if (this.error) {
        this.error.onClose?.()
        this.$emit('dismiss')
      }
    }
  }
}
</script>
