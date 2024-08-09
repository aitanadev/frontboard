<template>
  <div class="fds-c-file-loader">
    <div class="fds-c-drawer">
      <div v-for="route in localRoutes" class="fds-c-drawer__option" :class="{'active': route.isActive}">
        <div
          class="fds-c-drawer__option-handler"
          @click="route.import && load(route)"
        >{{ route.label }}</div>
        <div v-if="route.routes" class="fds-c-drawer__options">
          <div
            v-for="suboption in route.routes"
            class="fds-c-drawer__options-item"
            :class="{'active': suboption.isActive}"
            @click="load(suboption)"
          >{{ suboption.label }}</div>
        </div>
      </div>
    </div>
    <div class="fds-c-file-loader__content" v-if="contents !== undefined">
      <RichEditor v-if="ext === 'md'" v-model="contents" @input="save" :from-memory="!!fromMemory" @clearMemory="onClearMemory"/>
      <!-- <ComponentViewer v-else-if="ext === 'vue'" v-model="currentRoute"/> -->
      <!-- <SnapViewer v-else-if="ext === 'snap'" v-model="contents"/> -->
      <div v-else>Unsupported file extension {{ path }}</div>
    </div>
  </div>
</template>

<script>

import APP from '#services/APP'
import RichEditor from '#views/richEditor/RichEditor'
// import ComponentViewer from '#views/ComponentViewer'
// import SnapViewer from '#views/SnapViewer'

export default {
  name: 'FileLoader',
  components: {
    RichEditor
    // ComponentViewer,
    // SnapViewer
  },
  data: () => ({
    contents: undefined,
    fromMemory: undefined,
    offline: false // !APP.isWebpackServe
  }),
  created () {
    window.FileLoader = this
  },
  mounted () {
    if (this.currentRoute) {
      this.open()
    }
  },
  computed: {
    localRoutes () {
      return this.router.indexes.get('docs').routes
    },
    path() {
      return this.router.current?.path
    },
    ext() {
      return this.router.current?.ext
    },
    currentRoute() {
      return this.router.current
    }
  },
  methods: {
    load (route) {
      console.log('load file', route)
      route.load(true)
      this.open()
    },
    onClearMemory () {
      localStorage.removeItem('FrontBoardSave:' + this.path)
      this.open()
    },
    open () {
      if (!this.currentRoute.params.import) return
      this.contents = undefined
      this.fromMemory = undefined
      if (this.offline) {
        const localSaved = localStorage.getItem('FrontBoardSave:' + this.path)
        if (localSaved) {
          this.fromMemory = true
          this.contents = localSaved
        } else {
          this.currentRoute.import().then(contents => {
            this.contents = contents
          })
        }
      } else {
        APP.FrontboardAPI.get('files/' + this.path).then(response => {
          if (this.path === '.whiteboard.md' && !response.data) {
            import('#views/richEditor/lib/whiteboard.md.example').then(module => module.default).then(contents => {
              this.contents = contents
            })
          } else {
            this.contents = response.data
          }
        }).catch(error => {
          console.warn(error)
          this.contents = ''
        })
      }
    },
    save () {
      if (this.offline) {
        localStorage.setItem('FrontBoardSave:' + this.path, this.contents)
        this.fromMemory = true
        console.info('Saved to local storage')
      } else {
        APP.FrontboardAPI.put('files/' + this.path, { contents: this.contents}, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }).then(response => {
          console.info('Saved to file system')
        })
      }
    }
  }
}
</script>

<style lang="scss">
.fds-c-file-loader {
  position: absolute;
  display: flex;
  flex-direction: row;
  inset: 0;
  // background-color: var(--color--light-2);
}
.fds-c-file-loader__content {
  flex-grow: 1;
}

</style>
