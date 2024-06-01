<template>
  <!-- <Relationship :schemeClass="field.class[0]" :useOptions="field.class[0].all" v-model="form[field.key]"/> -->
  <div class="c-scheme-field" :class="{'t-error': entityField && entityField.errors.length > 0, 't-warning': !pristine}" @input="onInput" @change="onInput">
    <template v-if="field.component">
      <component :is="field.component" :form="form" :field="field"/>
    </template>
    <div v-else>:: Not implemented ::</div>
    <div class="c-scheme-field__foot">
      <template v-if="entityField && entityField.errors.length > 0">
        <div v-for="error in entityField.errors" class="c-scheme-field__error t-error c-chip v-semi">{{ error }}</div>
      </template>
      <div v-else-if="entityField && entityField.hint" class="t-info c-chip">{{ entityField.hint }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SchemeField',

  props: {
    field: { type: Object, required: true },
    form: { type: Object, required: true }
  },

  data: () => ({
  }),

  computed: {
    entityField() {
      return this.form.$fields?.[this.field.key]
    },
    pristine() {
      return !this.form.getMutation?.()?.[this.field.key]
    }
  },
  methods: {
    onInput($event) {
      this.$emit('input', $event)
    }
  }
}
</script>
