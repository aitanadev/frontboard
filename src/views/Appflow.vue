<template>
  <div class="fds-c-entity--full">
    <div class="fds-c-drawer">
      <div v-for="route in localRoutes" class="fds-c-drawer__option" :class="{'active': route.isActive}">
        <div
          class="fds-c-drawer__option-handler"
          :class="{'fds-c-drawer__option-handler--single': route.params.single}"
          @click="route.params.single && route.load(true)"
        >{{ route.label }}</div>
        <div v-if="!route.params.single" class="fds-c-drawer__options">
          <div
            v-for="suboption in route.routes"
            class="fds-c-drawer__options-item"
            :class="{'active': suboption.isActive}"
            @click="suboption.load(true)"
          >{{ suboption.label }}</div>
        </div>
      </div>
    </div>

    <template v-if="currentDataset && currentDataset.SQLite">
      <EntityDetail v-if="currentEntity" api :entityClass="currentDataset.Class" :id="currentEntity.id" :key="currentDataset.name + ':' + currentEntity.id"/>
      <EntityList v-else api :entityClass="currentDataset.Class" :key="currentDataset.name"/>
    </template>
    <template v-else-if="currentDataset && currentDataset.Class && !currentDataset.Class.config.frezze">
      <EntityDetail v-if="currentEntity" :entityClass="currentDataset.Class" :use="currentEntity" :key="currentDataset.name + ':' + currentEntity.id"/>
      <EntityList v-else :key="currentDataset.name" :entityClass="currentDataset.Class" v-model="currentDataset.data"/>
    </template>
    <template v-else-if="currentDataset && currentDataset.cache">
      <EntityDetail v-if="currentEntity" api :entityClass="currentDataset" :id="currentEntity.id" :key="currentDataset.name + ':' + currentEntity.id"/>
      <EntityList v-else api :key="currentDataset.name" :entityClass="currentDataset"/>
    </template>
    <template v-else-if="currentDataset">
      <fieldset class="fds-c-entity__list fds-c-fieldset" >Not implemented - config panel</fieldset>
    </template>
    <template v-else>
      <fieldset class="fds-c-entity__list fds-c-fieldset" >Select a staticDB dataset</fieldset>
    </template>
  </div>
</template>

<script>

import APP from '#services/APP'
import draggable from 'vuedraggable'
import Selector from '#components/selector/Selector'
import routes from '#config/routes'

export default {
  name: 'Appflow',
  components: {
    draggable,
    Selector
  },
  data: () => ({
    APP
  }),
  created() {
    window.Appflow = this
  },
  computed: {
    localRoutes () {
      return this.router.indexes.get('data').routes
    },
    currentPath: {
      get() {
        const current = this.router.current
        if (current) {
          const id = current.pathParams.id
          const view = current.pathParams.view
          if (view) {
            return current.parent.parent.path
          } else if (id) {
            return current.parent.path
          } else {
            return current.path
          }
        }
      },
      set(path) {
        this.router.to(path, true)
      }
    },
    currentDataset() {
      return this.router.current?.params.dataset
    },
    currentEntity() {
      const id = this.router.current?.pathParams.id
      const Class = this.currentDataset.Class || this.currentDataset
      if (id) {
        return new Class(id)
      }
    }
    /*
    contextMenu(event) {
      // @contextmenu.stop.prevent="contextMenu"
      // document.addEventListener('contextmenu', this.contextMenu)
      // event.preventDefault()
      console.log('contextMenu', event)
    },
    */
  }
}

</script>
