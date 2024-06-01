<template>
  <div class="c-scheme-wrp" :class="{'c-scheme-wrp--mini': miniVariation}" tabindex="0">
    <div v-show="!(currentEntity && !miniVariation) || showBoth" class="c-scheme"><!-- review todo v-show v-show="!currentEntity" -->
      <div class="c-scheme__header">
        <!-- <SchemeBreadcrumb/> -->
        <div class="c-scheme__title">
          <slot name="title"><h2>{{ field ? field.label : i18n(`models.${schemeClass.name}`, 2, schemeClass.plural.toSpaces()).capitalize() }}</h2></slot>
        </div>
        <div class="c-scheme__toolbar">
          <!--
          <label><input type="checkbox" class="c-checkbox">Bulk actions</label>
          <label><input type="checkbox" class="c-checkbox">Side expand</label>
          -->
          <!-- <input type="checkbox" v-model="palette.miniVariation" class="c-checkbox"> -->
          <!-- <input type="checkbox" v-model="miniVariation" class="c-checkbox"> -->
          <!-- <Selector v-model="selectedCols" useObject multiple optionText="label" optionValue="key" :options="seletableCols" @input="refresh" class="c-scheme__columns-selector"/><! -- REVIEW refresh call -->
          <button v-if="filters.length > 0" type="button" class="c-action t-error v-semi" @click="filters.splice(0, filters.length)"><i class="fi fi-rr-clear-alt"></i>{{ i18n('common.removeAllFilters') }}</button>
          <button type="button" class="c-action t-primary v-semi" @click="filters.push([{field: undefined, operator: 'equalTo'}])"><i class="fi fi-rr-filter"></i>{{ i18n('common.addFilter') }}</button>
          <button type="button" class="c-action t-primary v-semi" @click="addEntity"><i class="fi fi-rr-plus"></i>{{ i18n('common.addRow', {name: i18n(`models.${schemeClass.name}`, 1, schemeClass.name.toLowerCase())}).capitalize() }}</button>
          <slot name="actions"></slot>
          <!--
          <span v-if="totalPages > 1" class="c-scheme__pagination">
            <Selector v-model="page" :options="pages" @input="loadPage"/>
            <span>{{ page }} / {{ totalPages || 1 }}</span>
          </span>
          -->
        </div>
        <div class="c-scheme__filters" v-if="filters.length > 0">
          <div class="c-scheme__filter" v-for="(filter, key) in filters">
            <div class="c-scheme__filter__operands" v-for="(operand, operandKey) in filter">
              <div class="c-scheme__filter__selector">
                <!-- <button type="button" class="c-action t-error v-semi" @click="filters.splice(key, 1)"><i class="fi fi-rr-clear-alt"></i></button> -->
                <button type="button" class="c-action t-error v-semi" @click="filter.length > 1 ? filter.splice(operandKey, 1) : filters.splice(key, 1)"><i class="fi fi-rr-clear-alt"></i></button>
                <!-- <pre>{{ JSON.stringify(schemeClass.fields, undefined, '  ') }}</pre> -->
                <Selector v-model="operand.field" useObject :options="schemeClass.fields" optionText="label" optionValue="key" />
                <Selector v-if="operand.field" v-model="operand.operator" useObject :options="filtersOperatorsOptions" optionText="label" optionValue="key" />
              </div>
              <div class="c-scheme__filter__operand" v-if="operand.field && operand.operator">
                <template v-if="operand.operator === 'between'">
                  <!-- Try to store operation values as array in the operator key, like BETWEEN: [1,2] or IN: [1,2,3] etc -->
                  <component :is="operand.field.component" fieldKey="between" :form="operand" :field="operand.field" filter @input="loadPage"/>
                  <component :is="operand.field.component" fieldKey="and" :form="operand" :field="operand.field" filter @input="loadPage"/>
                </template>
                <template v-else>
                  <component :is="operand.field.component" :fieldKey="operand.operator" :form="operand" :field="operand.field" filter @input="loadPage"/>
                </template>
                <button v-if="operandKey === filter.length - 1" type="button" class="c-action v-semi" @click="filter.push({field: undefined, operator: 'equalTo'})"><i class="fi fi-rr-plus"></i>Or</button>
              </div>
            </div>
            <!-- <Selector v-model="operand.operator" useObject :options="['includes', 'in', 'between', 'greater', 'less']"/> -->
          </div>
        </div>
      </div>
      <div class="c-scheme__list" @dblclick="showList">
        <Datagrid
          ref="datagrid"
          :cols="schemeClass.fields"
          :colsPrepend="colsPrepend"
          :colsAppend="colsAppend"
          :records="currentPage"
          :draftLine="currentEntity === newEntity ? newEntity : undefined"
          :expand="miniVariation ? currentEntity : undefined"
          :selectable="selectable"
          :sortable="sortable"
        ><!-- selectable @keyup.enter="onEnter" @keyup.delete="onDelete" --->
          <template #record="{record: entity, cols, selected, draftLine}">
            <DatagridRecord
              :record="entity"
              :cols="cols"
              :selectable="selectable"
              :sortable="sortable"
              :selected="selected"
              :key="entity.uid"
              class="c-scheme__record"
              :class="{ 'c-scheme__formrow': inlineEditForm && inlineEditForm.$parent === entity, 'c-datagrid__draftline': draftLine }"
              :active="currentEntity === entity"
              @focusin.native="focusRow(entity)"
              @dblclick.native.stop.prevent="editEntity(entity)"
              @keydown.native.meta.83.stop.prevent="save"
              @keydown.native.enter.stop.prevent="save"
              @keydown.native.meta.enter.stop.prevent.exact="editEntity(entity)"
              @keydown.native.esc.stop.prevent="blurRow"
            >
              <template #cell="{ col: field }">
                <SchemeField v-if="!currentEntity && inlineEditForm && inlineEditForm.$parent === entity && !field.crud" :form="inlineEditForm" :field="field" />
                <component v-else :is="field.component" :form="entity" :field="field" viewer :marked="mark(field, field.format(entity[field.key]))"/>
              </template>
              <template #cell.$actions>
                <div class="c-scheme__cell-actions" @mousedown.stop>
                  <!-- v-if="currentEntity === entity || (inlineEditForm && inlineEditForm.$parent === entity)" -->
                  <button
                    type="button"
                    class="c-action t-primary v-semi"
                    :class="entity.getFormObject().getMutation() ? 't-warning v-dance' : ''"
                    :disabled="!entity.getFormObject().getMutation()"
                    @click="save">
                    <span class="fi fi-rr-disk"></span>
                  </button>
                  <button v-if="currentEntity === entity" type="button" class="c-action t-secondary v-semi" @click="showList"><i class="fi fi-rr-compress"></i></button>
                  <button v-else type="button" class="c-action t-primary v-semi" @click="editEntity(entity)"><i class="fi fi-rr-expand"></i></button>
                  <button type="button" class="c-action t-error v-semi" @click="removeEntity(entity)"><span class="fi fi-rr-trash"></span></button>
                </div>
              </template>
            </DatagridRecord>
          </template>
          <template #expand>
            <SchemeDetail v-if="currentEntity" :schemeClass="currentEntity.Class" :use="currentEntity" :key="currentEntity.uid" @close="showList" @input="onDetailSave" :metadata="metadata"/>
          </template>
        </Datagrid>
      </div>
    </div>
    <SchemeDetail v-if="currentEntity && !miniVariation" :schemeClass="currentEntity.Class" :use="currentEntity" :key="currentEntity.uid" @close="showList" @input="onDetailSave" :metadata="metadata"/>
  </div>
</template>

<script>

import Vue from 'vue'
import Scheme from '#services/Scheme'
import Field from '#models/internals/Field'
import palette from '#services/palette'
import DefaultField from '#components/fields/DefaultField'

export default {
  name: 'SchemeList',

  props: {
    schemeClass: { type: Function, required: true },
    value: { type: Array },
    field: { type: Object },
    filterHandler: { type: Function }
    // entity: { type: Object }
  },

  data: () => ({
    DefaultField,
    filters: undefined,
    palette,
    Scheme,
    currentPage: undefined,
    currentEntity: undefined,
    newEntity: undefined,
    pageSize: 20,
    fields: undefined,
    defaultColSize: 180,
    page: 1,
    mouseStatus: {},
    scroll: {},
    totalEntries: undefined,
    seletableCols: [],
    selectedCols: [],
    inlineEditForm: undefined,
    selectable: false,
    sortable: true
  }),

  watch: {
    value (value, prevValue) {
      // console.log('list value watcher')
      this.loadPage()
    }
  },

  created() {
    window.SchemeList = this
    this.filters = this.schemeClass.filters = this.schemeClass.filters || []
    this.seletableCols = this.schemeClass.fields.filter(field => !field.multiple)
    this.selectedCols = [...this.seletableCols]
  },

  mounted() {
    this.$el.addEventListener('keydown', this.onKeydown)
    document.addEventListener('focusin', this.onFocusOut)
    this.loadPage()
    this.showList()
  },

  beforeDestroy() {
    this.$el.removeEventListener('keydown', this.onKeydown)
    document.removeEventListener('focusin', this.onFocusOut)
  },

  computed: {

    filtersOperatorsOptions() {
      return [
        'like',
        'between',
        'equalTo',
        // 'in',
        'lessThan',
        'graterThan',
        'lessThanOrEqualTo',
        'greaterThanOrEqualTo'
      ]
    },

    metadata () {
      return this.field && this.field.metadata
    },

    miniVariation() {
      return this.field && !this.field.tab
    },

    showBoth () {
      return palette.showBoth
    },

    indexed () {
      return this.schemeClass.cache === this.list
    },

    /*
    isExpand() {
      console.log('isExpand', this.prop && this.entity.Class.fields.find(field => field.key === this.prop).expand)
      return this.prop && this.entity.Class.fields.find(field => field.key === this.prop).expand
    },
    */
    list() {
      return this.value
    },
    /*
    currentPath() {
      return this.entity ? [this.entity.Class.endpoint, this.entity.id, this.prop.toSnakeCase()].pathJoin() : this.schemeClass.endpoint
    },
    */
    totalPages() {
      if (!this.totalEntries) return 1
      return Math.ceil(this.totalEntries / this.pageSize)
    },
    pages() {
      return [...Array(this.totalPages).keys()].map(page => ({text: String(page + 1), value: page + 1}))
    },
    colsPrepend() {
      return [
        new Field({key: '$', label: '', size: 40, sticky: 'left', fixed: true})
        // new Field({key: 'uid', size: 80, sticky: 'left'})
      ]
    },
    colsAppend() {
      return [
        new Field({key: '$actions', size: 120, sticky: 'right', fixed: true})
      ]
    }
    /* *
    gridCols() {
      // return this.schemeClass.fields
      const selectedCols = [
        new Field({key: 'bulk', size: 60, sticky: 'left', fixed: true})
        // new Field({key: 'id', size: 80, sticky: 'left'})
      ]
      selectedCols.push(...this.selectedCols)
      selectedCols.push(new Field({key: 'actions', size: 90, sticky: 'right', fixed: true}))
      return selectedCols
    }
    /* */
  },

  methods: {
    onFocusOut(event) {
      // console.log('focusout')
      if (!this.$refs.datagrid.$refs.tbody?.$el.contains(document.activeElement)) {
        this.blurRow()
      }
    },
    onKeydown (event) {
      if (event.key === 'Enter' && event.metaKey) {
        event.preventDefault()
        event.stopPropagation()
        this.addEntity()
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        this.showList()
      }
    },
    showList() {
      this.currentEntity = undefined
      this.$nextTick().then(() => {
        if (this.$refs.datagrid) this.$refs.datagrid.$el.focus()
      })
    },
    editEntity(entity) {
      // console.log('go to edit', entity)
      if (entity) {
        this.focusRow(entity)
        this.currentEntity = entity
      } else {
        this.showList()
      }
    },
    blurRow() {
      // console.log('blur')
      this.inlineEditForm = undefined
    },
    focusRow(entity) {
      // console.log('focus', entity)
      if (this.inlineEditForm && this.inlineEditForm.$parent === entity) return
      if (this.currentEntity) this.currentEntity = entity
      this.inlineEditForm = entity.getFormObject()
    },
    refresh() {
      // console.log('refresh')
    },
    save() {
      if (!this.metadata) {
        this.inlineEditForm.save()
      } else {
        this.inlineEditForm.apply()
      }

      this.onDetailSave(this.inlineEditForm.$parent)
    },
    onDetailSave(entity) {
      if (entity === this.newEntity) {
        this.newEntity = undefined
        this.inlineEditForm = undefined
        /*
        if (this.inlineEditForm && entity === this.inlineEditForm.$parent) {
          console.log('is neeeeew')
          this.addEntity()
        }
        */
        if (!this.indexed && !this.schemeClass.sqlite) {
          this.list.push(entity)
        } else {
          this.loadPage()
        }
      }

      // console.log('onDetailSave', this.$el, entity)

      this.$emit('input', [...(this.list || this.currentPage)])
    },
    addEntity() {
      // console.log('addEntity')
      const Class = this.schemeClass
      const newEntity = new Class()
      this.currentEntity = newEntity
      this.inlineEditForm = newEntity.getFormObject() // TODO: refactor getFormObject as getter directly
      if (this.metadata || !this.schemeClass.config.freeze) {
        this.list.push(newEntity)
        if (this.metadata) this.$emit('input', [...this.list])
      } else {
        this.newEntity = newEntity
      }

      // this.$emit('input', this.list)
      // this.loadPage()
    },
    async removeEntity(entity) {
      await entity.delete()
      const list = this.list || this.currentPage
      const index = list.indexOf(entity)
      // console.log('remove index', this, entity)
      if (index >= 0) {
        list.splice(index, 1)
        if (this.list) this.$emit('input', [...this.list])
        // this.loadPage()
      }
    },
    testRow(row, field, filterValue) {
      const key = field.key
      if (field.class || field.options) {
        if (field.multiple) {
          return row[key].some(option => filterValue.includes(option))
        } else {
          return filterValue.includes(row[key])
        }
      } else if (!filterValue) {
        return true
      } else if (typeof filterValue === 'string') {
        return row[key].toLowerCase().includes(filterValue.toLowerCase())
      } else {
        // console.log('check if for', key, 'item', row, 'has', row[key], '===', filterValue)
        return row[key] === filterValue
      }
    },
    getFilteredList() {
      console.log('Apply filters', this.filters)
      if (this.filters.length === 0) return this.list
      return this.list.filter(row => {
        return this.filters.every(filter => {
          return filter.some(operand => {
            const field = operand.field
            if (operand.operator === 'between') {
              const greaterThan = Number(operand.between) || undefined //= [undefined, null].includes(row['>' + field.key]) ? true :
              const lessThan = Number(operand.and) || undefined
              const isGreaterThan = [undefined, null].includes(greaterThan) ? true : (row[field.key] >= greaterThan)
              const isLessThan = [undefined, null].includes(lessThan) ? true : (row[field.key] <= lessThan)
              return isGreaterThan && isLessThan
            } else {
              // console.log('filter value is', field, filter, filterValue)
              const filterValue = operand[operand.operator]
              return this.testRow(row, field, filterValue)
            }
          })
        })
      })
    },
    async loadPage(event) {
      // console.info('load page', event)
      const Class = this.schemeClass
      if (this.list) {
        const filteredList = this.getFilteredList()
        this.totalEntries = filteredList.length
        this.currentPage = filteredList
        // this.$nextTick().then(this.refresh)
      } else if (this.filterHandler) {
        const filteredList = await this.filterHandler(this.filters)
        this.totalEntries = filteredList.length
        this.currentPage = filteredList
      } else {
        throw new Error('Not implemented')
      }

        // this.currentPage = Class.cache

        // this.totalEntries = this.currentPage.length
        // this.$nextTick().then(this.refresh)
        /*
        const params = {pagination: true, per_page: this.pageSize, page: this.page}
        return Scheme.fetchEntities(this.currentPath, params).then(entries => {
          console.log('currentPage', entries, entries.totalEntries)
          this.totalEntries = entries.totalEntries
          this.currentPage = entries
          this.$nextTick().then(this.refresh)
        })
        */

      // this.$forceUpdate()
    },
    mark (field, text) {
      if (!text) return String(text)
      text = String(text)
      const fieldOperands = this.filters.filter(filter => filter.filter(operand => operand.field === field)).flat()
      if (fieldOperands.length > 0) {
        const filterText = fieldOperands.map(operand => operand[operand.operator]).filter(textItem => typeof textItem === 'string')
        if (filterText.length > 0) {
          return text.marker(filterText)
        }
      }
      return text
    }
  }
}
</script>

<style lang="scss">

.--ds { // TODO: Move to CSS file?
  .c-scheme {
    // background: var(--color--white);
    flex-shrink: 1;
    overflow: hidden;
  }
  .c-scheme-wrp {
    display: flex;
    flex-grow: 1;

    flex-shrink: 1;
    // overflow: auto;
    // overflow: visible;
    overflow: hidden;
    // border-bottom: 1px solid var(--color--pale-1);
    > .c-scheme {
      display: flex;
      flex-direction: column;
    }
    > .c-scheme:first-child:last-child {
      flex-grow: 1;
      width: auto;
    }
    > .c-scheme:first-child:not(:last-child) {
      width: 350px;
      border-right: 1px solid var(--color--pale-1);
      flex-shrink: 0;
    }
    > .c-scheme:last-child:not(:first-child) {
      flex-grow: 1;
      // border-left: 2px solid var(--color--pale-1);
      // border-bottom: 1px solid var(--color--pale-1);
      display: flex;
      flex-direction: column;
      flex-shrink: 1;
      overflow: auto;
      background-color: var(--color--white);
    }
  }

  .c-scheme__list {
    // padding: var(--spacing-l);
    // display: flex;
    // justify-content: center;
    background-color: var(--color--light-3);
    flex-grow: 1;
    display: flex;

    flex-shrink: 1;
    overflow: hidden;
    margin: -1px -1px 0;

    // Redesign
    background-color: var(--color--light-2);
    flex-grow: 1;
    display: flex;
    flex-shrink: 1;
    overflow: hidden;
    margin: -1px -2px 0px -1px;
    // border-right: 1px solid var(--color--pale-1);

    .c-datagrid {
      // margin: -1px -1px 1px;
      // max-width: calc(100% + 2px);

      // width: 0;
      // flex-grow: 1;
      // height: 100%;
      // display: block;
      // max-height: none;

      // margin: -1px -1px -1px;
      // max-width: calc(100% + 2px);
      // width: 0;
      // flex-grow: 1;
      // display: block;
      // max-height: calc(100% + 2px);

      // margin: 0 -1px 0px;
      max-width: calc(100% + 2px);
      width: 0;
      // height: 0;
      flex-grow: 1;
      // display: block;
      max-height: calc(100% + 2px);
    }
  }

  .c-scheme__pagination {
  }

  .c-scheme__columns-selector {
    max-width: 430px;
  }

  .c-scheme__header {
    /*
    display: flex;
    justify-content: space-between;
    // align-items: flex-start;
    padding: var(--spacing-l);
    border-bottom: 1px solid var(--color--pale-1);
    // margin: 0 0 var(--spacing-xl) 0;
    // border-radius: var(--border-radius);

    // gap: var(--spacing-xxl);
    flex-wrap: wrap;
    // min-height: 90px;

    align-items: center;
    align-content: flex-start;
    */

    display: flex;
    padding: var(--spacing-l);
    border-bottom: 1px solid var(--color--pale-1);
    flex-wrap: wrap;
    // align-items: center;
    align-content: center;
    gap: var(--spacing-xl);
    flex-direction: row;
    // justify-content: flex-end;
    justify-content: flex-start;
    align-items: flex-start;

    background-color: var(--color--light-3);
  }

  .c-scheme__header--reverse {
    flex-direction: row-reverse;
  }

  /* */
  .c-scheme__cell-actions {
    visibility: hidden;
  }

  .c-scheme__record {
    cursor: pointer;
    &:hover, &:focus-within, &[active] {
      .c-scheme__cell-actions {
        visibility: visible;
      }
    }
  }
  /* */

  .c-scheme__title {
    cursor: default;
    // flex-shrink: 0;
    display: flex;
    gap: var(--spacing-l);
    align-items: center; // review
    flex-wrap: wrap;
    &:empty {
      display: none;
    }
    a {
      cursor: pointer;
    }
    h2 {
      padding: 0;
    }
    .c-selector {
      width: 300px;
    }
  }

  .c-scheme__toolbar {
    /*
    display: flex;
    flex-grow: 1;
    justify-content: flex-end;
    gap: var(--spacing-m);
    align-items: flex-start;
    // order: 2;
    */

    display: flex;
    flex-grow: 1;
    justify-content: flex-end;
    gap: var(--spacing-m);
    // align-items: flex-start;
    align-items: center;
    flex-wrap: wrap;
  }

  .c-scheme__tabs {
    // width: 100%;
    border-bottom-style: none;
    margin-bottom: calc(-1 * var(--spacing-l));
    padding: 0;
    align-self: end;
    // order: 1;
    justify-content: flex-start;

    &>li:first-child {
      h2 {
        margin: 0;
      }
      // font-size: 20px;
    }
  }

  .c-scheme-chip {
    display: flex;
    align-items: flex-start;
  }

  .c-scheme-chip__text:not(:last-child) { // .c-scheme-chip {
    margin-right: 0;
  }

  .c-scheme-chip__type {
    margin-left: 0;
    font-size: 0.5em;
  }
  /*
  .c-scheme__field {
    display: flex;
    // margin: -3px -7px;
    flex-grow: 1;

    // align-self: normal;

    // margin: calc(var(--spacing-xs)* -1 + 1px) calc(var(--spacing-m)* -1 + 1px);

    .c-input {
      width: 100%;
    }
  }
  */
  .c-scheme-field {
    display: flex;
    flex-direction: column;
    // flex-direction: row;
    // align-items: flex-start;
    align-items: stretch;
    flex-grow: 1; // <---
    // justify-content: center;
    width: 100%;

    justify-content: flex-start;
  }
  .c-scheme-field__input {
    display: flex;
    // align-self: center;
    flex-grow: 1;
    > .c-input {
      width: 100%;
    }
  }
  .c-scheme-field__multiple {
    display: flex;
    gap: var(--spacing-m);
    flex-wrap: wrap;
  }
  .c-scheme-field__foot {
    display: none;
    z-index: 1;
    align-self: end;
    margin-top: var(--spacing-xs);
    &:not(:empty) {
      display: block;
    }
  }

  .c-datagrid__cell {
    .c-scheme-field {
      position: relative;

      flex-grow: 1;
      height: 100%;

      display: flex;
      flex-direction: column;
      // align-items: flex-start;
      align-items: stretch;
      flex-grow: 1;
      width: 100%;
      justify-content: flex-start;

      .c-scheme-field__input {
        flex-grow: 0;
      }

      .c-checkbox, .c-radio {
        margin-top: var(--spacing-s);
      }

      textarea {
        height: 26px;
        min-height: unset;
        z-index: 2;
      }
    }
    .c-scheme-field__foot {
      position: absolute;
      top: 100%;
      left: 0;
    }
  }

  .c-scheme-field__error {

  }
  .c-scheme__multiple {
    display: flex;
  }
  .c-scheme__location {
    display: flex;
    width: 100%;
  }
  .c-scheme__invent {
    pointer-events: none;
    opacity: 0.3;
  }

  .c-scheme__filters {
    /*
    display: flex;
    gap: var(--spacing-m);
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    */

    display: flex;
    gap: var(--spacing-m);
    width: 100%;
    flex-direction: row;
    // align-items: flex-start;
    flex-wrap: wrap;
    justify-content: flex-end;
    // align-items: stretch;
  }
  .c-scheme__filter {
    display: flex;
    gap: var(--spacing-m);
    flex-wrap: wrap;
    flex-grow: 1;

    background-color: var(--color--light-2);
    padding: var(--spacing-xs);
    border-radius: var(--border-radius);
    border: 1px solid var(--color--pale-1);

    max-width: 500px;

    // align-items: flex-start;

    flex-direction: column;
    align-items: stretch;
    &>label {
      align-self: center;
      padding-left: var(--spacing-s);
    }
  }
  .c-scheme-field__filter {
    flex-grow: 1;
    display: flex;
    &>.c-input {
      flex-grow: 1;
    }
  }
  .c-scheme-field__filters {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: var(--spacing-xs);
    flex-wrap: wrap;
  }
  .c-scheme__filter__selector {
    display: flex;
    // flex-grow: 1;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    &>.c-selector {
      width: 190px;
    }
  }

  .c-scheme__filter__operands {
    display: flex;
    flex-grow: 1;
    gap: var(--spacing-xs);
    flex-direction: column;
  }
  .c-scheme__filter__operand {
    display: flex;
    flex-grow: 1;
    gap: var(--spacing-xs);
    justify-content: flex-start;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    align-content: flex-start;
  }

  .c-scheme__fieldset > .c-scheme-wrp.c-scheme-wrp--mini {
    // padding: var(--spacing-xl);
    border-style: none;
    margin: 0;
    // max-width: 450px;
    &> .c-scheme {
      // border-color: var(--color--white) !important;
      &:first-child {
        &> .c-scheme__header {
          padding: var(--spacing-m) var(--spacing-m) var(--spacing-m) 0;
          background-color: transparent;
        }
      }
      &:first-child:last-child {
        // max-width: 450px;
      }
      &:last-child:not(:first-child) {
        border-bottom-style: none;
      }
      > .c-scheme__list {
        background-color: var(--color--white);
        margin: 0;
        >.c-datagrid {
          --table-border: 1px solid transparent;
          --td-border: 1px solid transparent;
          &> table {
            &>tbody, &>thead, &>tfoot {
              &>tr {
                &>th, &>td {
                  background-color: var(--color--white);
                  background-image: none;
                  border-color: transparent;
                  &>.c-datagrid__expand-content {
                    border-style: solid;
                    margin-top: -1px;
                    border-radius: var(--border-radius);
                    overflow: hidden;
                  }
                }
              }
            }
            &>tbody {
              tr {
                &:focus-within, &.c-scheme__formrow, &[active], &:hover {
                  &>th, &>td {
                    background-color: var(--color--light-3);
                    &:first-child {
                      border-radius: var(--border-radius) 0 0 var(--border-radius);
                    }
                    &:last-child {
                      border-radius: 0 var(--border-radius) var(--border-radius) 0;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

</style>
