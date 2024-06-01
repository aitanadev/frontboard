<template>
  <span class="c-scheme-field__viewer" v-if="viewer || field.readonly || field.isComputedReadonly || field.key === 'id'">

    <FileField v-if="isFile" :form="form" :field="field" :viewer="viewer"/>

    <div class="c-scheme__multiple" v-else-if="Array.isArray(formAccesor)">
      <template v-for="valueItem in formAccesor">
        <SchemeChip v-if="Scheme.isScheme(valueItem)" readOnly :entity="valueItem"/>
        <span v-else>{{ valueItem }}</span>
      </template>
    </div>

    <SchemeChip v-else-if="Scheme.isScheme(formAccesor)" readOnly :entity="formAccesor"/>

    <div v-else-if="field.type && field.type === Boolean">
      <span v-if="formAccesor"><i class="fi fi-rr-check-circle">&nbsp;</i>{{ i18n('common.yes') }}</span>
      <span v-else><i class="fi fi-rr-cross-circle">&nbsp;</i>{{ i18n('common.no') }}</span>
    </div>

    <div v-else-if="field.type && field.type === Number"><pre>{{ formAccesor }}</pre></div>

    <div v-else-if="field.type && field.type === Date"><pre>{{ formAccesor ? formAccesor.toLocaleDateString() : '' }}</pre></div>

    <div v-else v-html="marked || formAccesor"></div>
  </span>

  <span class="c-scheme-field__filter" v-else-if="filter" @input="$emit('input', $event)" @change="$emit('input', $event)">
    <div class="c-scheme-field__filters" v-if="field.range">
      <div class="c-field">
        <input type="number" class="c-input" v-model="formAccesor" :min="field.min" :max="field.max">
        <input type="range" v-model="formAccesor" :min="field.min" :max="field.max">
      </div>
    </div>

    <Selector class="c-field" v-else-if="field.class" useObject :options="field.options ? field.options(form) : field.class[0].cache" v-model="formAccesor" multiple optionValue="uid" optionText="name"/>

    <Selector class="c-field" v-else-if="field.options" :options="Array.isArray(field.options) ? field.options : field.options(form)" v-model="formAccesor" multiple/>

    <template v-else-if="field.multiple || isFile">::NotImplemented::</template>

    <input v-else-if="field.type === Number" type="number" class="c-input" v-model="formAccesor" :min="field.min" :max="field.max">

    <input v-else-if="field.type === Boolean" type="checkbox" class="c-checkbox" v-model="formAccesor" @input.stop>

    <DateField v-model="formAccesor" v-else-if="field.type === Date" clearable />

    <input v-else class="c-input" type="text" v-model="formAccesor">
  </span>

  <span class="c-scheme-field__input" v-else @input="$emit('input', $event)" @change="$emit('input', $event)">
    <FileField v-if="isFile" :form="form" :field="field"/>

    <div class="c-field" v-else-if="field.range">
      <input type="number" class="c-input" v-model="formAccesor" :min="field.min" :max="field.max">
      <input type="range" v-model="formAccesor" :min="field.min" :max="field.max">
    </div>

    <Selector class="c-field" v-else-if="field.class" useObject :options="field.options ? field.options(form) : field.class[0].cache" v-model="formAccesor" :multiple="field.multiple" optionValue="uid" optionText="name"/>

    <Selector class="c-field" v-else-if="field.options" :options="Array.isArray(field.options) ? field.options : field.options(form)" v-model="formAccesor" :multiple="field.multiple"/>

    <div class="c-scheme-field__multiple" v-else-if="field.multiple">
      <div class="c-field" v-for="(entry, key) in formAccesor">
        <input class="c-input" type="text" v-model="formAccesor[key]">
        <button type="button" class="c-action t-error v-semi" @click="formAccesor.splice(key, 1)"><span class="fi fi-rr-trash"></span></button>
      </div>
      <button type="button" class="c-action t-primary v-semi" @click="formAccesor.push('')"><i class="fi fi-rr-plus"></i>Add</button>
    </div>

    <input v-else-if="field.type === Number" type="number" class="c-input" v-model="formAccesor" :min="field.min" :max="field.max">

    <input v-else-if="field.type === Boolean" type="checkbox" class="c-checkbox" v-model="formAccesor" @input.stop>

    <DateField v-else-if="field.type === Date" v-model="formAccesor"/>

    <textarea v-else-if="field.textarea" class="c-input" v-model="formAccesor"></textarea>

    <input v-else class="c-input" type="text" v-model="formAccesor">
  </span>
</template>

<script>

import Vue from 'vue'
import Scheme from '#services/Scheme'

export default {
  name: 'DefaultField',

  props: {
    form: { type: Object },
    field: { type: Object },
    filter: { type: Boolean },
    viewer: { type: Boolean },
    marked: { type: String },
    fieldKey: { type: String }
  },

  data: () => ({
    Scheme
  }),

  computed: {
    isFile() {
      return this.field.class?.find(Class => Class.name === 'File')
    },
    formAccesor: {
      get() {
        return this.form[this.fieldKey || this.field.key]
      },
      set(value) {
        this.form[this.fieldKey || this.field.key] = value
        // this.$emit('input', value)
      }
    }
  }
}
</script>

<style lang="scss">
  .c-scheme-field__viewer {
    width: 100%;
    overflow: auto;

    height: 100%;
    flex-grow: 1;

    padding: var(--spacing-xs);
  }
</style>
