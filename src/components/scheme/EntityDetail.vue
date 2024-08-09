<template>
  <div class="fds-c-entity" tabindex="0" @input="onInput">
    <template v-if="ready">
      <div class="fds-c-entity__header fds-c-entity__header--reverse" :class="entity.tone ? 't-' + entity.tone.name : ''">
        <div class="fds-c-entity__toolbar">
          <button
            v-if="frozen && !metadata"
            :disabled="!form.getMutation()"
            type="button"
            class="fds-c-action t-secondary v-semi"
            @click="reset"
          ><i class="fi fi-rr-reset"></i>{{ i18n('common.reset') }}</button>
          <button
            v-if="frozen && !metadata"
            type="button"
            class="fds-c-action t-primary v-semi"
            :class="form.getMutation() ? 't-warning v-dance' : ''"
            :disabled="!form.getMutation()"
            @click="save"
          ><i class="fi fi-rr-disk"></i>{{ i18n('common.save') }}</button>
          <button v-if="modal" type="button" class="fds-c-action t-secondary v-semi" @click="expand"><i class="fi fi-rr-expand"></i></button>
          <!-- <button type="button" class="fds-c-action t-primary v-semi"><i class="fi fi-rr-compress"></i></button> -->
          <button v-if="modal" type="button" class="fds-c-action t-secondary" @click="$emit('close')"><i class="fi fi-rr-cross"></i></button>
          <button v-if="backable" type="button" class="fds-c-action t-secondary" @click="back"><i class="fi fi-rr-compress"></i></button>
        </div>
        <menu class="fds-c-entity__tabs fds-c-tabs">
          <li><h2><em>{{ i18n(`Entity.${entityClass.name}`, 1, entityClass.name.toSpaces()).capitalize() }}:</em> <span @click="toView()">{{ entity.toString() }}</span></h2></li>
          <li v-for="field in crudFields" @click="toView(field)">
            <button type="button" class="fds-c-action v-semi" :active="currentView === field">{{ field }}</button>
          </li>
        </menu>
      </div>
      <div class="fds-c-tabs-content">
        <EntityList v-if="currentView" :key="currentView.key" :value="form[currentView.key]" :field="currentView" :parentEntity="entity" :entityClass="currentView.class[0]" @input="onSaveList(currentView, $event)" :api="api"/>
        <form v-else-if="!currentView && form" ref="form" class="fds-c-entity__detail" @keydown.enter.stop.prevent="save">
          <draggable tag="fieldset" class="fds-c-entity__fieldset fds-c-dragable fds-c-fieldset" draggable=".fds-c-draggable__item" handle=".fds-c-draggable__handler" :list="fields">
            <template v-for="field in fields">
              <template v-if="field.field && !field.tab && !form.$fields[field.key].hidden">
                <EntityList v-if="field.crud && field.class" :key="field.key" :value="form[field.key]" :field="field" :parentEntity="entity" :entityClass="field.class[0]" @input="onSaveList(field, $event)" class="fds-c-draggable__item" :api="api"/>
                <div v-else class="fds-c-draggable__item fds-c-fieldset__item" :class="{'fds-c-entity__invent': field.isInvent}">
                  <label class="fds-c-draggable__handler">
                    <!-- <tooltip :content="i18n('common.help.lightTables')"> -->
                      <template>{{ field }}{{ !field.fieldset ? '*' : '' }}</template>
                    <!--
                      <template #tooltip>
                        Field details
                      </template>
                    </tooltip>
                    -->
                  </label>
                  <EntityField :form="form" :field="field"/>
                </div>
              </template>
            </template>
          </draggable>
        </form>
      </div>
    </template>
  </div>
</template>

<script>
import APP from '#services/APP'
import Entity from '#services/Entity'
import draggable from 'vuedraggable'
export default {
  name: 'EntityDetail',

  components: {
    draggable
  },

  props: {
    entityClass: { type: Function, required: true },
    metadata: { type: Boolean },
    api: { type: Boolean },
    id: { type: String },
    use: { type: Object },
    modal: { type: Boolean }
  },

  data: () => ({
    ready: false,
    entity: undefined,
    fields: undefined,
    frozen: true,
    view: undefined
  }),

  async created() {
    // console.warn('EntityDetail created', this)
    window.EntityDetail = this
    const Class = this.entityClass
    this.frozen = Class.config.freeze
    this.fields = Class.fields

    if (this.use) {
      this.entity = this.use
    } else if (!this.api) {
      this.entity = new Class(this.id)
    } else {
      this.entity = new Class(this.id)
      this.entity.retrieve()
    }

    this.ready = true
  },

  mounted() {
    if (this.$refs.form) this.$refs.form.querySelector('input[type="text"]')?.focus()
  },

  computed: {
    tabFields() {
      return this.fields.filter(field => !field.tab)
    },
    crudFields() {
      return this.fields.filter(field => field.tab && field.crud)
    },
    form() {
      return this.entity?.getFormObject()
    },
    backable() {
      return !this.modal && window.history.state.prevPath
    },
    currentView () {
      const currentRoute = this.router.current
      if (!this.modal && currentRoute) {
        return this.fields.find(field => field.key.toKebabCase() === currentRoute.pathParams.view)
      } else {
        return this.view
      }
    }
  },

  methods: {
    back() {
      this.router.to(window.history.state.prevPath, true)
    },
    expand() {
      const entity = this.entity
      const pathBase = entity.$dataset ? [entity.$dataset.$database.$name.toKebabCase(), entity.$dataset.name.toKebabCase()].pathJoin() : ['API', entity.Class.name.toKebabCase()].pathJoin()
      this.router.to(['data', pathBase, entity.id].pathJoin(), true)
    },
    toView(view) {
      // console.log('toView', view)
      const viewName = view?.Class?.name === 'Field' ? view.key : view

      if (viewName && !this.modal) {
        const entity = this.entity
        const pathBase = entity.$dataset ? [entity.$dataset.$database.$name.toKebabCase(), entity.$dataset.name.toKebabCase()].pathJoin() : ['API', entity.Class.name.toKebabCase()].pathJoin()
        this.router.to(['data', pathBase, entity.id, viewName.toKebabCase()].pathJoin(), true)
      }

      this.view = view
    },
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
      // console.info('· save form:', this.form)
      await this.form.save(this.api)
      this.$emit('input', this.entity)
    }
  }
}
</script>
