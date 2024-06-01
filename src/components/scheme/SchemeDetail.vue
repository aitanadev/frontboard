<template>
  <div class="c-scheme" tabindex="0" @input="onInput">
    <div class="c-scheme__header c-scheme__header--reverse" :class="entity.tone ? 't-' + entity.tone.name : ''">
      <!--
      <div class="c-scheme__location">
        <SchemeBreadcrumb/>
      </div>
      -->
      <!--
      <div class="c-scheme__title">
        <h2><SchemeChip :entity="entity" /></h2>
      </div>
      -->
      <div class="c-scheme__toolbar">
        <button
          v-if="frozen && !metadata && form.getMutation()"
          type="button"
          class="c-action t-secondary v-semi"
          @click="reset"
        ><i class="fi fi-rr-reset"></i>{{ i18n('common.reset') }}</button>
        <button
          v-if="frozen && !metadata"
          type="button"
          class="c-action t-primary v-semi"
          :class="form.getMutation() ? 't-warning v-dance' : ''"
          :disabled="!form.getMutation()"
          @click="save"
        ><i class="fi fi-rr-disk"></i>{{ i18n('common.save') }}</button>
        <button type="button" class="c-action t-secondary" @click="$emit('close')"><i class="fi fi-rr-cross"></i></button>
      </div>
      <menu class="c-scheme__tabs c-tabs">
        <slot name="listview"></slot>
        <!-- <li><button type="button" class="c-action t-secondary" @click="$emit('close')"><i class="fi fi-rr-cross"></i></button></li> -->
        <span class="c-chip v-semi">{{ i18n(`models.${schemeClass.name}`, 1, schemeClass.name.toSpaces()).capitalize() }}</span>
        <li><h2 class="c-action v-semi" @click="currentCrudTab = undefined">{{ entity.toString() }}</h2></li>
        <!-- <li @click="currentCrudTab = 'example'"><button type="button" class="c-action v-semi" :active="currentCrudTab === 'example'">Example tab</button></li> -->
        <li v-for="field in crudFields" @click="currentCrudTab = field">
          <button type="button" class="c-action v-semi" :active="currentCrudTab === field">{{ field.label }}</button>
        </li>
        <!-- <li><button type="button" class="c-action" @click="loadMetadata">Metadata</button></li> -->
      </menu>
    </div>
    <div class="c-tabs-content">
      <div v-if="currentCrudTab === 'example'">Example content</div>
      <SchemeList v-else-if="currentCrudTab" :value="form[currentCrudTab.key]" :field="currentCrudTab" :entity="entity" :schemeClass="currentCrudTab.class[0]" @input="onSaveList(currentCrudTab, $event)"/>
      <form v-else-if="!currentCrudTab && form" ref="form" class="c-scheme__detail" @keydown.enter.stop.prevent="save">
        <!-- <div class="c-chip">{{ entity.id }}</div> -->
        <draggable tag="fieldset" class="c-scheme__fieldset c-dragable c-fieldset" draggable=".c-draggable__item" handle=".c-draggable__handler" :list="fields">
          <template v-for="field in fields">
            <template v-if="!form.$fields[field.key].hidden && !field.tab">
              <SchemeList v-if="field.crud && field.class" :value="form[field.key]" :field="field" :entity="entity" :schemeClass="field.class[0]" @input="onSaveList(field, $event)" class="c-draggable__item"/>
              <div v-else class="c-draggable__item c-fieldset__item" :class="{'c-scheme__invent': field.isInvent}">
                <label class="c-draggable__handler">
                  <!-- <tooltip :content="i18n('common.help.lightTables')"> -->
                    <template>{{ field.label }}{{ field.isInvent ? '*' : '' }}</template>
                  <!--
                    <template #tooltip>
                      Field details
                    </template>
                  </tooltip>
                  -->
                </label>
                <SchemeField :form="form" :field="field"/>
              </div>
            </template>
          </template>
        </draggable>
      </form>
    </div>
  </div>
</template>

<script>
import Scheme from '#services/Scheme'
import APP from '#services/APP'
import draggable from 'vuedraggable'

export default {
  name: 'SchemeDetail',

  components: {
    draggable
  },

  props: {
    schemeClass: { type: Function, required: true },
    metadata: { type: Boolean },
    id: { type: String },
    use: { type: Object }
  },

  data: () => ({
    APP,
    entity: undefined,
    fields: undefined,
    form: undefined,
    currentCrudTab: undefined,
    frozen: true
    // parentDetails: []
  }),

  created() {
    // console.warn('SchemeDetail created', this)
    window.SchemeDetail = this
    const Class = this.schemeClass
    this.frozen = Class.config.freeze
    this.fields = Class.fields

    if (this.use) {
      this.entity = this.use
      this.form = this.entity.getFormObject()
    } else {
      this.entity = new Class(this.id)
      this.entity.get().then(response => {
        this.form = this.entity.getFormObject()
      })
    }

    /*
    const parentDetails = []
    let parent = this
    while (parent) {
      // console.log('parentDetail', parent)
      if (parent.$options && parent.$options.name === 'SchemeDetail') {
        parentDetails.push(parent)
      }
      parent = parent.$parent
    }

    this.parentDetails = parentDetails.filter(detail => detail.entity !== detail.form)
    */
  },

  mounted() {
    this.$el.addEventListener('keydown', this.onKeydown)
    if (this.$refs.form) this.$refs.form.querySelector('input[type="text"]')?.focus()
  },

  beforeDestroy() {
    this.$el.removeEventListener('keydown', this.onKeydown)
  },

  computed: {
    tabFields() {
      return this.fields.filter(field => !field.tab)
    },
    crudFields() {
      return this.fields.filter(field => field.tab && field.crud)
    }
  },

  methods: {
    onKeydown (event) {
      if (event.key === 's' && event.metaKey) {
        event.preventDefault()
        event.stopPropagation()
        this.save()
      }
      /*
      } else if (event.key === 'ArrowRight' && event.metaKey && event.ctrlKey) {
        event.preventDefault()
        event.stopPropagation()
        // event.stopImmediatePropagation()
        this.nextTab()
      } else if (event.key === 'ArrowLeft' && event.metaKey && event.ctrlKey) {
        event.preventDefault()
        event.stopPropagation()
        // event.stopImmediatePropagation()
        this.nextTab(true)
      }
      */
    },
    /*
    nextTab(reverse) {
      console.log('next tab')
      const tabs = [undefined, ...this.crudFields]
      if (this.currentCrudTab) {
        const currentIndex = tabs.indexOf(this.currentCrudTab)
        const nextIndex = (tabs.length + currentIndex + (reverse ? -1 : 1)) % tabs.length
        this.currentCrudTab = tabs[nextIndex]
      } else {
        const nextIndex = reverse ? tabs.length - 1 : 0
        this.currentCrudTab = tabs[nextIndex]
      }
    },
    */
    reset() {
      this.form.reset()
    },
    onInput() {
      if (this.frozen && this.metadata) this.form.apply()
      if (this.metadata) this.$emit('input', this.entity)
      /*
      if (this.metadata) {
        this.form[field.key] = event
        if (this.frozen) this.form.apply()
        this.$emit('input', this.entity)
      } else {
        // this.form[field.key] = event
      }
      */
    },
    async onSaveList(field, event) {
      if (field.metadata) {
        // console.log('set list prop', field.key)
        this.form[field.key] = event
      } else {
        await this.save()
      }
    },
    async save() {
      console.info('· save form:', this.form)
      // this.parentDetails.forEach(detail => detail.form.save())

      await this.form.save()

      this.$emit('input', this.entity)

      // this.form.save()
    }
  }
}
</script>
