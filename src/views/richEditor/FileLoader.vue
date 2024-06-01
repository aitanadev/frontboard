<template>
  <div class="c-file-loader">
    <div class="c-file-loader__content" v-if="contents !== undefined">
      <RichEditor v-if="ext === 'md'" v-model="contents" @input="save" :file="file" :from-memory="!!fromMemory" @clearMemory="onClearMemory"/>
      <ComponentViewer v-else-if="ext === 'vue'" v-model="contents" :file="file" :from-memory="!!fromMemory" @clearMemory="onClearMemory"/>
      <SnapViewer v-else-if="ext === 'snap'" v-model="contents"/>
      <div v-else>Unsupported file extension {{ path }}</div>
    </div>
  </div>
</template>

<script>

import APP from '#services/APP'
import RichEditor from 'views/richEditor/RichEditor'
import ComponentViewer from 'views/ComponentViewer'
import SnapViewer from 'views/SnapViewer'
import API from '#services/API'

export default {
  name: 'FileLoader',
  components: {
    RichEditor,
    ComponentViewer,
    SnapViewer
  },
  props: {
    file: {type: Object, required: true }
  },
  data: () => ({
    path: undefined,
    ext: undefined,
    contents: undefined,
    fromMemory: undefined,
    offline: !APP.isWebpackServe
  }),
  created () {
    console.log('new file loader', this, this.file)
    this.path = this.file.path
    this.ext = this.file.path.split('.').pop()
    this.open()
  },
  mounted () {
    window.FileLoader = this
  },
  methods: {
    onClearMemory () {
      localStorage.removeItem('FrontBoardSave:' + this.path)
      this.open()
    },
    open () {
      this.contents = undefined
      this.fromMemory = undefined
      if (this.offline) {
        const localSaved = localStorage.getItem('FrontBoardSave:' + this.path)
        if (localSaved) {
          this.fromMemory = true
          this.contents = localSaved
        } else {
          this.file.import().then(contents => {
            this.contents = contents
          })
        }
      } else {
        API.get('files/' + this.path).then(response => {
          if (this.path === '.whiteboard.md' && !response.data) {
            this.file.import().then(contents => {
              this.contents = contents
            })
          } else {
            this.contents = response.data
          }
        })
      }
    },
    save () {
      if (this.offline) {
        localStorage.setItem('FrontBoardSave:' + this.path, this.contents)
        this.fromMemory = true
        console.info('Saved to local storage')
      } else {
        API.put('files/' + this.path, { contents: this.contents}, {
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
.c-file-loader {
  position: absolute;
  inset: 0;
  // background-color: var(--color--light-2);
}
.c-file-loader__content {
  position: absolute;
  inset: 0;
  overflow: auto;
}
</style>
