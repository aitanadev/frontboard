<template>
  <div class="c-palette__section--staticdb">
    <div class="c-scheme__header">
      <div class="c-scheme__title v-darkmode">
        <h2>Databases</h2>
        <Selector v-model="currentCollection" use-object multilevel :options="collections" optionText="name" optionValue="id">
          <template #option="{ option }"><i v-if="option.hidden" class="fi fi-rr-eye-crossed">&nbsp;</i>{{ option.name }}</template>
          <!-- -->
          <template #options.append>
            <SelectorOption @select:option="currentCollection = 'SQLite'">SQLite</SelectorOption>
          </template>
          <!-- -->
        </Selector>
        <Selector v-model="APP.language" :options="['ES','EN']" />
      </div>
      <div class="c-scheme__toolbar v-darkmode">
        <!--
        <label>
          <input type="checkbox" v-model="palette.miniVariation" class="c-checkbox">
          <tooltip :content="i18n('common.help.lightTables')">Light tables</tooltip>
        </label>
        <label><input type="checkbox" v-model="palette.inlineExpand" class="c-checkbox">Inline expand</label>
        -->
        <label><input type="checkbox" v-model="palette.showBoth" class="c-checkbox"><i class="fi fi-rr-table-columns">&nbsp;</i>Treeview</label>
        <button class="c-action t-primary v-semi" @click="save" type="button">Save staticDB</button>
      </div>
    </div>
    <SchemeList ref="SchemeViewer" v-if="currentCollection && currentCollection.Class" :key="currentCollection.name" :schemeClass="currentCollection.Class" v-model="currentCollection.data">
      <!-- <template #title><h2>{{ currentCollection.Class.pluralize(currentCollection.Class.toString()) }}</h2></template> -->
    </SchemeList>
    <template v-else-if="currentCollection === 'SQLite'">
      <SchemeList ref="SchemeViewer" :schemeClass="APP.models.APIUser" :filterHandler="filterHandler"/>
    </template>
    <fieldset class="c-scheme__list c-fieldset" v-else-if="currentCollection">Not implemented - config panel</fieldset>
    <fieldset class="c-scheme__list c-fieldset" v-else>Select a staticDB collection</fieldset>
  </div>
</template>

<script>

import APP from '#services/APP'
import API from '#services/API'
import Scheme from '#services/Scheme'
import StaticDB from '#services/StaticDB'
import palette from '#services/palette'
import draggable from 'vuedraggable'

// TODO: We need a route state manager with context vars, review
// const newurl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?frontboard=' + this.path
//   window.history.pushState({ path: newurl }, '', newurl)
// }

export default {
  name: 'Palette',
  components: {
    draggable
  },
  data: () => ({
    APP,
    palette,
    currentCollection: Object.values(StaticDB.databases)
      .map(database => Object.values(database.collections))
      .flat()
      .find(collection => collection.id === localStorage.getItem('StaticDB:currentCollection')) || localStorage.getItem('StaticDB:currentCollection')
  }),
  created() {
    window.StaticDB = this
  },
  computed: {
    collections() {
      return Object.values(StaticDB.databases).map(database => ({
        name: database.path, // review, grouped uses default 'text' accesor, multilevel uses 'name'. And bad current selection on load
        options: Object.values(database.collections).toSorted(category => category.hidden ? 1 : -1)
      }))
    }
  },
  watch: {
    currentCollection(value) {
      localStorage.setItem('StaticDB:currentCollection', (value && value.id) ? value.id : value)
    }
  },
  methods: {
    contextMenu(event) {
      // @contextmenu.stop.prevent="contextMenu"
      // document.addEventListener('contextmenu', this.contextMenu)
      // event.preventDefault()
      console.log('contextMenu', event)
    },
    filterHandler(filters) {
      /*
      const query = {}
      if (filters.length > 0) {
        console.log('filtering', filters)
        filters.forEach(filter => {
          const field = filter.field
          const key = field.key
          const value = filter[key]
          query[key] = filter[key]
        })
      }
      */

      const queryFilter = []
      if (filters.length > 0) {
        console.log('filtering', filters)
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

      console.log('QUERY', JSON.stringify(queryFilter))

      return API.get('sqlite/api-users', { params: { filter: JSON.stringify(queryFilter) } }).then(response => {
        response.data.forEach(entry => {
          entry.type = 'APIUser'
        })
        return Scheme.populate(response.data)
        // console.info('Saved', { formated, stringified })
      })

      /*
      [{a:[{between: []]}, {}]
      [
        {a: {equal: 'A'}, b: {like:'B'}, c: {between: [1,10], d: {in: [1,2,3]}}},
        // a = 'A'
        // AND b LIKE 'B'
        // AND c BETWEEN 1 AND 10
        // AND d IN (1,2,3)
        // notEqual !=
        // less <
        // greater >
        // lessOrEqual <=
        // greaterOrEqual >=
        {} // OR...
      ]
      */

      /*
      return this.list.filter(entity => {
        return filters.every(filter => {
          const field = filter.field
          const value = filter[field.key]
          // console.log('filter value is', field, filter, value)
          if (field.type === Number || field.type === Date) {
            const greaterThan = Number(filter['>' + field.key]) || undefined //= [undefined, null].includes(entity['>' + field.key]) ? true :
            const lessThan = Number(filter['<' + field.key]) || undefined
            const isGreaterThan = [undefined, null].includes(greaterThan) ? true : (entity[field.key] >= greaterThan)
            const isLessThan = [undefined, null].includes(lessThan) ? true : (entity[field.key] <= lessThan)
            return isGreaterThan && isLessThan
          } else if (field.class || field.options) {
            if (field.multiple) {
              return entity[field.key].some(entityValue => value.includes(entityValue))
            } else {
              return value.includes(entity[field.key])
            }
          } else if (!value) {
            return true
          } else if (typeof value === 'string') {
            return entity[field.key].toLowerCase().includes(value.toLowerCase())
          } else {
            // console.log('check if for', field.key, 'item', entity, 'has', entity[field.key], '===', value)
            return entity[field.key] === value
          }
        })
      })
      */
    },
    save() {
      StaticDB.save()
      /*
      .then(() => {
        console.log('staticDB saved')
      })
      */
    }
  }
}

</script>
