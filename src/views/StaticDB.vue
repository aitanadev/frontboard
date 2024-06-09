<template>
  <div class="c-palette__section--staticdb">
    <div class="c-scheme__header">
      <div class="c-scheme__title v-darkmode">
        <h2>Databases</h2>
        <Selector v-model="currentCollection" use-object multilevel :options="collections" optionText="name" optionValue="id">
          <template #option="{ option }"><i v-if="option.hidden" class="fi fi-rr-eye-crossed">&nbsp;</i>{{ option.name }}</template>
          <!--
          <template #options.append>
            <SelectorOption @select:option="currentCollection = 'SQLite'">SQLite</SelectorOption>
          </template>
          -->
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
        <label><input type="checkbox" v-model="palette.showBoth" class="c-switch"><i class="fi fi-rr-table-columns">&nbsp;</i>Treeview</label>
        <button class="c-action t-primary v-semi" @click="save" type="button">Save staticDB</button>
      </div>
    </div>
    <template v-if="currentCollection && currentCollection.SQLite">
      <SchemeList ref="SchemeViewer" :schemeClass="currentCollection.Class" api :key="currentCollection.id"/>
    </template>
    <SchemeList ref="SchemeViewer" v-else-if="currentCollection && currentCollection.Class" :key="currentCollection.id" :schemeClass="currentCollection.Class" v-model="currentCollection.data">
      <!-- <template #title><h2>{{ currentCollection.Class.pluralize(currentCollection.Class.toString()) }}</h2></template> -->
    </SchemeList>
    <fieldset class="c-scheme__list c-fieldset" v-else-if="currentCollection">Not implemented - config panel</fieldset>
    <fieldset class="c-scheme__list c-fieldset" v-else>Select a staticDB collection</fieldset>
  </div>
</template>

<script>

import APP from '#services/APP'
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
      .find(collection => collection.id === localStorage.getItem('StaticDB:currentCollection')) || Object.values(APP.models).map(Class => ({ Class, SQLite: true, id: Class.name, name: Class.name })).find(Class => Class.name === localStorage.getItem('StaticDB:currentCollection'))
  }),
  created() {
    window.StaticDB = this
  },
  computed: {
    collections() {
      return [
        {
          name: 'Examples',
          options: [
            {
              name: 'HomeStock',
              options: Object.values(StaticDB.databases.homeStock.collections).toSorted(category => category.hidden ? 1 : -1)
            },
            ...Object.values(StaticDB.databases.examples.collections).toSorted(category => category.hidden ? 1 : -1),
            ...Object.values(APP.models).filter(Class => Class.sqlite).map(Class => ({ Class, SQLite: true, id: Class.name, name: Class.name }))
          ]
        },
        {
          name: 'Internals',
          options: [
            ...Object.values(StaticDB.databases.internals.collections).toSorted(category => category.hidden ? 1 : -1)
            // StaticDB.databases.translations.collections.translations
          ]
        },
        {
          name: 'Palette',
          options: [
            ...Object.values(StaticDB.databases.palette.collections).toSorted(category => category.hidden ? 1 : -1)
          ]
        },
        StaticDB.databases.translations.collections.translations
      ]
      /*
      return Object.values(StaticDB.databases).map(database => ({
        name: database.path, // review, grouped uses default 'text' accesor, multilevel uses 'name'. And bad current selection on load
        options: Object.values(database.collections).toSorted(category => category.hidden ? 1 : -1)
      }))
      */
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
