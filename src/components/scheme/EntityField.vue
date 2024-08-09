<template>
  <!-- <Relationship :entityClass="field.class[0]" :useOptions="field.class[0].all" v-model="form[field.key]"/> -->
  <div class="fds-c-entity-field" :class="{'t-error': entityField && entityField.errors.length > 0, 't-warning': !pristine}" @input="onInput" @change="onInput">
    <template v-if="field.component">
      <component :is="field.component" :viewer="viewer" :form="form" :field="field" :marked="marked"/>
    </template>

    <template v-else>
      <span class="fds-c-entity-field__filter" v-if="filter" @input="onInput" @change="onInput">
        <div class="fds-c-field" v-if="field.range">
          <input type="number" class="fds-c-input" v-model="formAccesor" :min="field.min" :max="field.max">
          <input type="range" class="fds-c-range" v-model="formAccesor" :min="field.min" :max="field.max">
        </div>

        <Selector class="fds-c-field" v-else-if="field.class" useObject :options="field.class[0].cache" v-model="formAccesor" multiple optionValue="uid" optionText="name"/>

        <Selector class="fds-c-field es-este" v-else-if="field.options" useObject :options="Array.isArray(field.options) ? field.options : field.options()" v-model="formAccesor" multiple/>

        <template v-else-if="field.multiple || isFile">::NotImplemented::</template>

        <input v-else-if="field.type === Number" type="number" class="fds-c-input" v-model="formAccesor" :min="field.min" :max="field.max">

        <input v-else-if="field.type === Boolean" type="checkbox" class="fds-c-checkbox" v-model="formAccesor" @input.stop>

        <DateField v-else-if="field.type === Date" v-model="formAccesor" clearable />

        <input v-else class="fds-c-input" type="text" v-model="formAccesor" autocomplete="off">
      </span>

      <span class="fds-c-entity-field__viewer" v-else-if="viewer || field.readonly || field.isComputedReadonly || field.key === 'id'">

        <FileField v-if="isFile" :form="form" :field="field" :viewer="viewer"/>

        <!-- TODO: options multiple -->

        <div class="fds-c-entity__multiple" v-else-if="Array.isArray(formAccesor)">
          <template v-for="valueItem in formAccesor">
            <EntityLabel v-if="Entity.isEntity(valueItem)" readOnly :entity="valueItem"/>
            <div v-else-if="field.options && !field.class">{{ i18n(`Entity.${form.Class.name}.${field.key}.options.${valueItem}`, (Array.isArray(field.options) ? field.options : field.options()).filter(option => option === valueItem || option.value === valueItem).map(option => typeof option === 'object' ? option.text : option)[0] ) }}</div>
            <span v-else class="fds-c-chip">{{ valueItem }}</span>
          </template>
        </div>

        <div v-else-if="field.options && !field.class">{{ i18n(`Entity.${form.Class.name}.${field.key}.options.${formAccesor}`, (Array.isArray(field.options) ? field.options : field.options()).filter(option => option === formAccesor || option.value === formAccesor).map(option => typeof option === 'object' ? option.text : option)[0] ) }}</div>

        <EntityLabel v-else-if="Entity.isEntity(formAccesor)" readOnly :entity="formAccesor"/>

        <div v-else-if="typeof formAccesor === 'boolean'">
          <span class="fds-c-field__yes" v-if="formAccesor"><i class="fi fi-rr-check-circle">&nbsp;</i>{{ i18n('common.yes') }}</span>
          <span class="fds-c-field__no" v-else><i class="fi fi-rr-cross-circle">&nbsp;</i>{{ i18n('common.no') }}</span>
        </div>

        <div v-else-if="field.type && field.type === Number"><pre>{{ formAccesor }}</pre></div>

        <div v-else-if="field.type && field.type === Date"><pre>{{ formAccesor ? formAccesor.toLocaleDateString() : '' }}</pre></div>

        <div v-else-if="formAccesor === undefined">- - -</div>

        <div v-else v-html="marked || field.format(formAccesor)"></div>
      </span>

      <span class="fds-c-entity-field__input" v-else @input="onInput" @change="onInput">
        <FileField v-if="isFile" :form="form" :field="field"/>

        <div class="fds-c-field" v-else-if="field.range">
          <input type="number" class="fds-c-input" v-model="formAccesor" :min="field.min" :max="field.max">
          <input type="range" class="fds-c-range" v-model="formAccesor" :min="field.min" :max="field.max">
        </div>

        <Selector class="fds-c-field" v-else-if="field.class" useObject :options="field.options ? field.options(form) : field.class[0].cache" v-model="formAccesor" :multiple="field.multiple" optionValue="uid" optionText="name"/>

        <Selector class="fds-c-field" v-else-if="field.options" :options="Array.isArray(field.options) ? field.options : field.options(form)" v-model="formAccesor" :multiple="field.multiple"/>

        <div class="fds-c-entity-field__multiple" v-else-if="field.multiple">
          <div class="fds-c-field" v-for="(entry, index) in formAccesor">
            <input class="fds-c-input" type="text" autocomplete="off" v-model="formAccesor[index]" @input="saveMultiple">
            <button v-if="index < formAccesor.length - 1" type="button" class="fds-c-action t-error v-semi" @click="removeMultiple(index)"><span class="fi fi-rr-trash"></span></button>
          </div>
          <!-- <button type="button" class="fds-c-action t-primary v-semi" @click="addMultiple"><i class="fi fi-rr-plus"></i>Add</button> -->
        </div>

        <input v-else-if="field.type === Number" type="number" class="fds-c-input" v-model="formAccesor" :min="field.min" :max="field.max">

        <input v-else-if="field.type === Boolean" type="checkbox" class="fds-c-checkbox" v-model="formAccesor" @input.stop>

        <DateField v-else-if="field.type === Date" v-model="formAccesor"/>

        <textarea v-else-if="field.textarea" class="fds-c-input" v-model="formAccesor"></textarea>

        <input v-else class="fds-c-input" type="text" autocomplete="off" v-model="formAccesor">
      </span>
    </template>

    <div class="fds-c-entity-field__foot">
      <template v-if="entityField && entityField.errors.length > 0">
        <div v-for="error in entityField.errors" class="fds-c-entity-field__error t-error fds-c-chip v-semi">{{ error }}</div>
      </template>
      <div v-else-if="entityField && entityField.hint" class="t-info fds-c-chip">{{ entityField.hint }}</div>
    </div>
  </div>
</template>

<script>

import Entity from '#services/Entity'
import Selector from '#components/selector/Selector'

export default {
  name: 'EntityField',

  components: {
    Selector
  },

  props: {
    field: { type: Object, required: true },
    form: { type: Object, required: true },
    filter: { type: Boolean },
    viewer: { type: Boolean },
    fieldKey: { type: String },
    marked: { type: String }
  },

  data: () => ({
    Entity
  }),

  computed: {
    entityField() {
      return this.form.$fields?.[this.fieldKey || this.field.key]
    },
    pristine() {
      return !this.form.getMutation?.()?.[this.field.key]
    },
    isFile() {
      return this.field.class?.find(Class => Class.name === 'File')
    },
    formAccesor: {
      get() {
        const value = this.form[this.fieldKey || this.field.key]
        // return (this.field.type === Number && !value) ? 0 : value
        return value
      },
      set(value) {
        this.form[this.fieldKey || this.field.key] = this.field.type === Number ? Number(value) : value
        if (this.form.__ob__) this.form.__ob__.dep.notify()
      }
    }
  },
  methods: {
    onInput($event) {
      this.$emit('input', $event)
    },
    removeMultiple(index) {
      const copy = [...this.formAccesor]
      copy.splice(index, 1)
      this.formAccesor = copy
    },
    saveMultiple() {
      this.formAccesor = [...this.formAccesor]
    },
    addMultiple() {
      const copy = [...this.formAccesor]
      copy.push('')
      this.formAccesor = copy
    }
  }
}
</script>

<style lang="scss">
  .fds-c-entity-field__viewer {
    width: 100%;
    height: 100%;
    flex-grow: 1;

    padding: var(--spacing-xs);
  }
  .fds-c-field__yes {
    color: var(--color--success--dark-1);
  }
  .fds-c-field__no {
    color: var(--color--error--dark-1);
  }
</style>
