<template>
  <div class="fds-c-entity-list" tabindex="0">
    <div class="fds-c-entity__header">
      <div class="fds-c-entity__title">
        <slot name="title"><h2>{{ field ? field.$label : i18n(`Entity.${entityClass.name}`, 2, entityClass.plural.toSpaces()).capitalize() }}</h2></slot>
        <span class="fds-c-chip v-semi" v-if="datagrid">
          <template v-if="datagrid.selectionCount > 0">
            <span v-if="datagrid.allPagesSelected">All {{ datagrid.totalRecords }} {{ datagrid.typeNaming[datagrid.totalRecords === 1 ? 0 : 1] }} selected</span>
            <span v-else>{{ datagrid.selectionCount }} {{ datagrid.typeNaming[datagrid.selectionCount === 1 ? 0 : 1] }} selected</span>
            <a v-if="datagrid.paginated && datagrid.isAllSelection && !datagrid.allPagesSelected" type="button" @click="datagrid.selectAllPages">Select all {{ datagrid.totalRecords }}?</a>
            <a v-if="datagrid.allPagesSelected" type="button" @click.stop.prevent="datagrid.clearSelection">Clear?</a>
          </template>
          <template v-else>
            <span>{{ datagrid.totalRecords }} {{ datagrid.typeNaming[datagrid.totalRecords === 1 ? 0 : 1] }}</span>
          </template>
        </span>
      </div>
      <div class="fds-c-entity__toolbar">
        <Selector v-model="selectedCols" useObject multiple optionText="$label" optionValue="key" :options="seletableCols" class="fds-c-entity__columns-selector"/>
        <button v-if="filters.length > 0" type="button" class="fds-c-action t-error v-semi" @click="filters.splice(0, filters.length);loadPage()"><i class="fi fi-rr-clear-alt"></i>{{ i18n('common.removeAllFilters') }}</button>
        <button type="button" :disabled="loading" class="fds-c-action t-primary v-semi" @click="filters.push([{field: undefined}])"><i class="fi fi-rr-filter"></i>{{ i18n('common.addFilter') }}</button>
        <!-- <button type="button" class="fds-c-action t-primary v-semi" @click="addEntity"><i class="fi fi-rr-plus"></i>{{ i18n('common.addRow', {name: i18n(`Entity.${entityClass.name}`, 1, entityClass.name.toLowerCase())}).capitalize() }}</button> -->

        <!-- -->
        <template v-for="action in entityClass.actions.filter(action => action.global)">
          <button type="button" class="fds-c-action" v-bind="action.bind" v-on="action.on" @click="currentAction = action"><span v-if="action.icon" :class="['fi', `fi-${action.icon}`]"></span>{{ action.label || action.key }}</button>
        </template>

        <template v-if="datagrid">
          <template v-for="action in entityClass.actions.filter(action => action.bulk).map(action => action.for(datagrid.selection))">
            <button type="button" disabled="true" class="fds-c-action" v-bind="action.bind" v-on="action.on" @click="currentAction = action"><span v-if="action.icon" :class="['fi', `fi-${action.icon}`]"></span>{{ action.label || action.key }}</button>
          </template>
        </template>
        <!-- -->

        <button type="button" class="fds-c-action t-secondary v-semi" :class="{'v-solid': dataForm}" @click="dataForm = !dataForm"><span class="fi fi-rr-pen-field"></span></button>
        <slot name="actions"></slot>
        <span v-if="totalPages > 1" class="fds-c-entity__pagination">
          <Selector v-model="page" :options="pages" @input="loadPage(true)"/>
          <span>/</span>
          <Selector v-model="pageSize" :options="pageSizes" @input="loadPage(true)"/></span>
        </span>
      </div>
      <div class="fds-c-entity__filters" v-if="filters.length > 0">
        <div class="fds-c-entity__filter" v-for="(filter, key) in filters">
          <div class="fds-c-entity__filter__operands" v-for="(operand, operandKey) in filter">
            <div class="fds-c-entity__filter__selector">
              <button type="button" class="fds-c-action t-error v-semi" @click="filter.length > 1 ? filter.splice(operandKey, 1) : filters.splice(key, 1);loadPage()"><i class="fi fi-rr-clear-alt"></i></button>
              <Selector v-model="operand.field" useObject :options="seletableCols.filter(field => field.filterable)" optionText="$label" optionValue="key" @input="operand.operator = [Number, Date].includes(operand.field.type) ? 'between' : ((operand.field.class || operand.field.multiple) ? 'in' : 'like')" />
              <Selector v-if="operand.field && [Number, Date].includes(operand.field.type)" v-model="operand.operator" :options="getFieldOperatorsOptions(operand.field)" @input="$forceUpdate()" />
            </div>
            <div class="fds-c-entity__filter__operand" v-if="operand.field && operand.operator">
              <template v-if="operand.operator === 'between'">
                <!-- Try to store operation values as array in the operator key, like BETWEEN: [1,2] or IN: [1,2,3] etc -->
                <EntityField fieldKey="between" :form="operand" :field="operand.field" filter @input="loadPage"/>
                <EntityField fieldKey="and" :form="operand" :field="operand.field" filter @input="loadPage"/>
              </template>
              <template v-else>
                <EntityField :fieldKey="operand.operator" :form="operand" :field="operand.field" filter @input="loadPage"/>
              </template>
              <button v-if="operandKey === filter.length - 1" type="button" class="fds-c-action v-semi" @click="filter.push({field: undefined})"><i class="fi fi-rr-plus"></i>Or</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="fds-c-entity__list" :class="{'s-loading': loading}">
      <Datagrid
        ref="datagrid"
        :cols="selectedCols"
        :totalRecords="totalEntries"
        :colsPrepend="colsPrepend"
        :colsAppend="colsAppend"
        :records="currentPage"
        :draftLine="newEntity"
        :selectable="selectable"
        :sortable="sortable"
        :key="entityClass.name"
      >
        <template #cell="{ col: field, record: entity }">
          <span v-if="field.key === '$label'" class="fds-c-entity-label fds-c-entity-field__viewer">
            <EntityLabel :entity="entity" />
          </span>
          <div v-else-if="field.key === '$actions'" class="fds-c-entity__cell-actions">

            <button
              v-if="showSave"
              type="button"
              class="fds-c-action t-primary v-semi"
              :class="entity.getFormObject().getMutation() ? 't-warning v-dance' : ''"
              :disabled="!entity.getFormObject().getMutation()"
              @click="save(entity.getFormObject())">
              <span class="fi fi-rr-disk"></span>
            </button>

            <Selector :options="entity.$actions" @input="currentAction = $event.for(entity)" useObject optionText="key" optionValue="key">
              <button type="button" class="fds-c-action t-primary v-semi"><span class="fi fi-rr-menu-dots-vertical"></span></button>
              <template #option="{ option: action }" v-bind="action.bind" v-on="action.on"><span v-if="action.icon" :class="['fi', `fi-${action.icon}`]"></span>{{ action.label || action.key }}</template>
            </Selector>

          </div>
          <EntityField v-else-if="field.key !== '$'" :form="entity.getFormObject()" :field="field" :marked="mark(field, field.format(entity[field.key]))" :viewer="!dataForm"/>
        </template>
      </Datagrid>
    </div>
    <div v-if="currentAction" class="fds-c-entity-action"><component :is="currentAction.component" :action="currentAction" @done="currentAction = undefined"></component></div>
  </div>
</template>

<script>

import APP from '#services/APP'
import Entity from '#services/Entity'
import Vue from 'vue'
import Field from '#models/internals/Field'
import palette from '#services/palette'
import Datagrid from '#components/Datagrid'
import DatagridRecord from '#components/DatagridRecord'
import Selector from '#components/selector/Selector'

export default {
  name: 'EntityList',

  components: {
    Datagrid,
    DatagridRecord,
    Selector
  },

  props: {
    entityClass: { type: Function, required: true },
    value: { type: Array },
    field: { type: Object },
    api: { type: Boolean },
    parentEntity: { type: Object }
  },

  data: () => ({
    currentAction: undefined,
    filters: undefined,
    palette,
    currentPage: undefined,
    newEntity: undefined,
    pageSizes: [ 50, 150, 200, 250, 500],
    pageSize: 150,
    fields: undefined,
    defaultColSize: 180,
    page: 1,
    loading: true,
    mouseStatus: {},
    scroll: {},
    totalEntries: undefined,
    seletableCols: [],
    selectedCols: [],
    handler: undefined,
    datagrid: undefined,
    dataForm: false
  }),

  watch: {
    value (value, prevValue) {
      if (value !== prevValue) {
        // console.log('list value watcher')
        this.loadPage()
      }
    }
  },

  created() {
    if (this.api) this.handler = this.JSONAPIHandler
    if (this.sqlite) this.handler = this.SQLiteHandler
    window.EntityList = this
    this.filters = this.entityClass.filters = this.entityClass.filters || []
    this.seletableCols = this.entityClass.fields.filter(field => !field.multiple)
    this.selectedCols = [...this.seletableCols]
  },

  mounted() {
    this.$el.addEventListener('keydown', this.onKeydown)
    document.addEventListener('focusin', this.onFocusOut)
    this.datagrid = this.$refs.datagrid
    this.loadPage(true)
  },

  beforeDestroy() {
    this.$el.removeEventListener('keydown', this.onKeydown)
    document.removeEventListener('focusin', this.onFocusOut)
  },

  computed: {

    sortable () {
      return !!this.value?.$staticDB
    },
    selectable() {
      return !this.sortable
    },
    metadata () {
      return this.field && this.field.metadata
    },
    indexed () {
      return this.entityClass.cache === this.list
    },
    list() {
      return this.value
    },
    totalPages() {
      if (!this.entityClass.config.freeze) return 1
      if (!this.totalEntries) return 1
      return Math.ceil(this.totalEntries / this.pageSize)
    },
    pages() {
      return [...Array(this.totalPages).keys()].map(page => ({text: String(page + 1), value: page + 1}))
    },
    colsPrepend() {
      return [
        new Field({key: '$', label: '', size: 35, sticky: 'left', fixed: true}),
        new Field({key: '$label', label: this.i18n(`Entity.${this.entityClass.name}`, 1, this.entityClass.name.toSpaces()).capitalize(), size: 180, sticky: 'left', fixed: true})
      ]
    },
    colsAppend() {
      return [
        new Field({key: '$actions', label: '', size: this.showSave ? 85 : 50, sticky: 'right', fixed: true})
      ]
    },
    showSave() {
      return this.entityClass.config.frezze && dataForm
    }
  },

  methods: {
    getFieldOperatorsOptions(field) {
      const isDate = field.type === Date
      const options = [
        // {value: 'like', text: this.i18n('filters.operators.like')},
        {value: 'between', text: this.i18n('filters.operators.between')},
        {value: 'equalTo', text: this.i18n('filters.operators.equalTo')},
        // {value: 'in', text: this.i18n('filters.operators.in')},
        {value: 'lessThan', text: this.i18n(`filters.operators.${isDate ? 'before' : 'lessThan'}`)},
        {value: 'greaterThan', text: this.i18n(`filters.operators.${isDate ? 'after' : 'greaterThan'}`)}
      ]
      // if (!isDate) {
        options.push(
          {value: 'lessThanOrEqualTo', text: this.i18n(`filters.operators.${isDate ? 'beforeOrEqualTo' : 'lessThanOrEqualTo'}`)},
          {value: 'greaterThanOrEqualTo', text: this.i18n(`filters.operators.${isDate ? 'afterOrEqualTo' : 'greaterThanOrEqualTo'}`)}
        )
      // }
      return options
    },
    async save(form) {
      if (this.metadata) {
        form.apply()
      } else {
        await form.save(this.api)
      }
      this.onDetailSave(this.inlineEditForm.$parent)
    },
    onDetailSave(entity) {
      if (entity === this.newEntity) {
        this.newEntity = undefined
        this.inlineEditForm = undefined
        /*
        if (this.inlineEditForm && entity === this.inlineEditForm.$parent) {
          this.addEntity()
        }
        */
        if (!this.indexed && !this.api) {
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
      const Class = this.entityClass
      const newEntity = new Class()
      this.newEntity = newEntity
    },
    SQLiteHandler(filters, page, pageSize) {
      const queryFilter = []
      if (filters.length > 0) {
        // console.log('filtering', filters)
        filters.forEach(filter => {
          queryFilter.push(filter.map(operand => {
            const field = operand.field
            const key = field.key
            const operandValueKeys = Object.keys(operand).filter(key => !['field', 'operator'].includes(key))
            const operandValues = Object.fromEntries(operandValueKeys.map(key => [key, operand[key]]))
            return {[key]: operandValues}
          }))
        })
      }

      const filter = JSON.stringify(queryFilter)
      // console.log('QUERY', filter)

      return APP.FrontboardAPI.get('sqlite/' + this.entityClass.plural.toKebabCase(), { params: { filter, page, pageSize } }).then(response => {
        response.data.forEach(entry => {
          entry.$type = this.entityClass.name
        })
        return Entity.populate(response.data)
        // console.info('Saved', { formated, stringified })
      })
    },
    JSONAPIHandler(filters, page, pageSize) {
      return this.entityClass.list({page, pageSize}, this.parentEntity, this.field)
    },
    testRow(row, field, filterValue) {
      // console.log('filterValue', {row, field, filterValue})
      const key = field.key
      if (field.class || field.options) {
        if (field.multiple) {
          if (filterValue.length === 0) return true
          return row[key].some(option => filterValue.includes(option))
        } else {
          if (!filterValue) return true
          return filterValue.includes(row[key])
        }
      } else if (typeof filterValue === 'string') {
        if (!filterValue) return true
        return row[key] && row[key].toLowerCase().includes(filterValue.toLowerCase())
      } else {
        // console.log('check if for', key, 'item', row, 'has', row[key], '===', filterValue)
        return row[key] === filterValue
      }
    },
    getFilteredList(list) {
      // console.log('Apply filters', this.filters)

      const queryFilter = []
      if (this.filters.length > 0) {
        // console.log('filtering', this.filters)
        this.filters.forEach(filter => {
          queryFilter.push(filter.map(operand => {
            const field = operand.field
            const key = field.key
            const operandValueKeys = Object.keys(operand).filter(key => !['field', 'operator'].includes(key))
            const operandValues = Object.fromEntries(operandValueKeys.map(key => [key, operand[key]]))
            return {[key]: operandValues}
          }))
        })
      }

      console.log('QUERY', JSON.stringify(queryFilter), queryFilter)

      if (this.filters.length === 0) return list
      return list.filter(row => {
        return this.filters.every(filter => {
          return filter.some(operand => {
            const field = operand.field
            const operator = operand.operator
            if (operator === 'between') {
              const greaterThan = Number(operand.between) || 0 //= [undefined, null].includes(row['>' + field.key]) ? true :
              const lessThan = Number(operand.and) || 0
              const isGreaterThan = [undefined, null, ''].includes(greaterThan) ? true : (row[field.key] >= greaterThan)
              const isLessThan = [undefined, null, ''].includes(lessThan) ? true : (row[field.key] <= lessThan)
              return isGreaterThan && isLessThan
            } else if (['lessThan', 'greaterThan', 'lessThanOrEqualTo', 'greaterThanOrEqualTo'].includes(operator)) {
              const compartors = {
                lessThan: (a, b) => a > b,
                greaterThan: (a, b) => a < b,
                lessThanOrEqualTo: (a, b) => a >= b,
                greaterThanOrEqualTo: (a, b) => a <= b
              }
              const operatorValue = Number(operand[operator]) || 0
              return [undefined, null, ''].includes(operatorValue) ? true : compartors[operator](operatorValue, row[field.key], operand[operator][1])
            } else {
              const filterValue = operand[operand.operator]
              return this.testRow(row, field, filterValue)
            }
          })
        })
      })
    },
    async loadPage(initial) {
      // console.info('load page', event)
      const Class = this.entityClass
      this.loading = true

      if (this.list && !this.handler) {
        const filteredList = this.getFilteredList(this.list)
        this.totalEntries = filteredList.length
        this.currentPage = filteredList
        // this.$nextTick().then(this.refresh)
      } else if (this.handler && initial === true) {
        const filteredList = await this.handler(this.filters, this.page, this.pageSize)
        this.totalEntries = filteredList.totalEntries
        this.requestCache = filteredList
        this.currentPage = filteredList
      } else if (initial !== true) {
        const filteredList = this.getFilteredList(this.requestCache)
        // this.totalEntries = filteredList.length
        this.currentPage = filteredList
      } else {
        throw new Error('Not implemented')
      }

      this.loading = false
    },
    mark (field, text) {
      if (!text) return String(text)
      text = String(text)
      const fieldOperands = this.filters.filter(filter => filter.some(operand => operand.field === field)).flat()
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

.--ds {

  .fds-c-entity--full {
    display: flex;
    flex-direction: row;
    flex-shrink: 1;
    overflow: auto;
    flex-grow: 1;
  }

  .fds-c-entity, .fds-c-entity-list {
    // background: var(--color--white);
    flex-shrink: 1;
    overflow: hidden;

    display: flex;
    flex-direction: column;
    z-index: 2;
    flex-grow: 1;
    position: relative;
  }

  .fds-c-entity__list {
    // padding: var(--spacing-l);
    // display: flex;
    // justify-content: center;
    background-color: var(--color--light-3);
    border-radius: var(--border-radius);
    flex-grow: 1;
    display: flex;

    flex-shrink: 1;
    overflow: hidden;
    margin: -1px -1px 0;

    // Redesign
    // background-color: var(--color--light-2);
    flex-grow: 1;
    display: flex;
    flex-shrink: 1;
    overflow: hidden;

    // margin: -1px -2px 0px -1px;

    // max-width: none;
    // border-right: 1px solid var(--color--pale-1);

    .fds-c-datagrid {
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

      margin-left: -1px;
      margin-right: -1px;
    }
  }

  .fds-c-entity__pagination {
  }

  .fds-c-entity__columns-selector {
    max-width: 120px;
  }

  .fds-c-entity__header {
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
    // gap: var(--spacing-xl);
    flex-direction: row;
    // justify-content: flex-end;
    // justify-content: flex-start;
    align-items: flex-start;
    justify-content: flex-end;

    gap: var(--spacing-xl);
    background-color: var(--color--light-3);
  }

  .fds-c-entity__header--reverse {
    flex-direction: row-reverse;
    box-shadow: 0 0 30px 15px var(--color--white);
    z-index: 1;
    gap: var(--spacing-s);
  }

  /* *
  .fds-c-entity__cell-actions {
    visibility: hidden;
  }

  .fds-c-entity__record {
    cursor: pointer;
    &:hover, &:focus-within, &[active] {
      .fds-c-entity__cell-actions {
        visibility: visible;
      }
    }
  }
  /* */

  .fds-c-entity__title {
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
    /*
    .fds-c-selector {
      width: 300px;
    }
    */
  }

  .fds-c-entity__toolbar {
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

  .fds-c-entity__tabs {
    // width: 100%;
    border-bottom-style: none;
    margin-bottom: calc(-1 * var(--spacing-l));
    padding: 0;
    align-self: end;
    // order: 1;
    justify-content: flex-start;

    &>li:first-of-type {
      h2 {
        font-weight: var(--font-weight--semibold);
        display: flex;
        flex-direction: column;
        padding-left: var(--spacing-m);
        >em {
          font-size: var(--font-size--s);
          color: var(--color--light-1);
        }
        >span {
          text-decoration: dashed underline currentColor 1px;
          margin: 0 var(--spacing-l) var(--spacing-m) 0;
          font-size: var(--font-size--xl);
          cursor: pointer;
          &:hover {
            color: var(--color--dark-2);
          }
        }
      }
      // font-size: 20px;
    }
  }

  .fds-c-entity-label {
    display: flex;
    align-items: flex-start;
    /*
    >.fds-c-chip { // <----
      cursor: pointer !important;
      margin: 0;
      gap: 0;
    }
    */
    >.fds-c-emergent {
      width: 750px;
      max-width: 100%;
      height: 500px;
    }
  }

  .fds-c-entity-label__text {
    text-decoration: underline dotted;
    cursor: pointer;
    font-weight: var(--font-weight--semibold);
    &:not(:last-child) { // .fds-c-entity-label {
      margin-right: 0;
    }
    &:hover {
      color: var(--color--dark-2);
    }
  }

  .fds-c-entity-label--linked {

  }

  .fds-c-entity-label__type {
    margin-left: 0;
    font-size: 0.5em;
  }
  /*
  .fds-c-entity__field {
    display: flex;
    // margin: -3px -7px;
    flex-grow: 1;

    // align-self: normal;

    // margin: calc(var(--spacing-xs)* -1 + 1px) calc(var(--spacing-m)* -1 + 1px);

    .fds-c-input {
      width: 100%;
    }
  }
  */
  .fds-c-entity-field {
    display: flex;
    flex-direction: column;
    // flex-direction: row;
    // align-items: flex-start;
    align-items: stretch;
    flex-grow: 1; // <---
    // justify-content: center;
    width: 100%;
    position: relative;

    justify-content: flex-start;
    min-width: 0;
  }
  .fds-c-entity-field__input {
    display: flex;
    // align-self: center;
    flex-grow: 1;
    > .fds-c-input {
      width: 100%;
    }
  }
  .fds-c-entity-field__multiple {
    display: flex;
    gap: var(--spacing-m);
    flex-wrap: wrap;
    > .fds-c-field {
      width: 75%;
    }
  }

  .fds-c-entity-field__foot {
    position: absolute;
    display: none;
    z-index: 1;
    top: 100%;
    margin-top: 1px;
    right: 0;
    > .fds-c-chip {
      border: 1px solid var(--color--default--light-3);
    }
  }

  .fds-c-entity-field:focus-within {
    >.fds-c-entity-field__foot:not(:empty) {
      display: block;
    }
  }

  .fds-c-datagrid__cell {

    >.fds-c-entity-field {
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

      >.fds-c-entity-field__input, >.fds-c-entity-field__viewer {
        flex-grow: 0;
        >.fds-c-field {
          width: 100%;
        }
        >.fds-c-checkbox, .fds-c-radio {
          margin-top: var(--spacing-s);
        }
        >.fds-c-entity__multiple {
          gap: var(--spacing-m);
          flex-wrap: nowrap;
        }
        >textarea {
          height: 26px;
          min-height: unset;
          z-index: 2;
        }
      }
      /* */
      >.fds-c-entity-field__foot {
        margin-top: var(--spacing-xs);
        left: calc(-1* var(--spacing-m));
        right: auto;
      }
      /* */
    }
  }

  .fds-c-entity-field__error {

  }
  .fds-c-entity__multiple {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-m);
  }
  .fds-c-entity__location {
    display: flex;
    width: 100%;
  }
  .fds-c-entity__invent {
    pointer-events: none;
    opacity: 0.3;
  }

  .fds-c-entity__filters {
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
  .fds-c-entity__filter {
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
  .fds-c-entity-field__filter {
    flex-grow: 1;
    display: flex;
    &>.fds-c-input {
      flex-grow: 1;
    }
  }
  .fds-c-entity__filter__selector {
    display: flex;
    // flex-grow: 1;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
    &>.fds-c-selector {
      width: 190px;
    }
  }

  .fds-c-entity__filter__operands {
    display: flex;
    flex-grow: 1;
    gap: var(--spacing-xs);
    flex-direction: column;
  }
  .fds-c-entity__filter__operand {
    display: flex;
    flex-grow: 1;
    gap: var(--spacing-xs);
    justify-content: flex-start;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    align-content: flex-start;
  }

  .fds-c-emergent--open {
    >.fds-c-entity {
      border-radius: var(--border-radius);
      &::after {
        content: "";
        height: var(--spacing-l);
        box-shadow: 0 0 30px 15px var(--color--white);
        z-index: 1;
        position: relative;
      }
    }
  }

  .fds-c-entity-action {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
  }

  /* TODO: Review
  .fds-c-entity__fieldset {
    > .fds-c-entity-wrp {
      margin: 0 calc(var(--spacing-l)* -1 + var(--spacing-xxl)* -1);
    }
  }
  */

  /* *
  .fds-c-entity__fieldset > .fds-c-entity-wrp.fds-c-entity-wrp--mini {
    // padding: var(--spacing-xl);
    border-style: none;
    margin: 0;
    // max-width: 450px;
    &> .fds-c-entity {
      // border-color: var(--color--white) !important;
      &:first-child {
        &> .fds-c-entity__header {
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
      > .fds-c-entity__list {
        background-color: var(--color--white);
        margin: 0;
        >.fds-c-datagrid {
          --table-border: 1px solid transparent;
          --td-border: 1px solid transparent;
          &> table {
            &>tbody, &>thead, &>tfoot {
              &>tr {
                &>th, &>td {
                  background-color: var(--color--white);
                  background-image: none;
                  border-color: transparent;
                  &>.fds-c-datagrid__expand-content {
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
                &:focus-within, &.fds-c-entity__formrow, &[active], &:hover {
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
  /* */
}

</style>
