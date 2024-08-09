<template>
  <div class="fds-c-file-field">
    <template v-if="!viewer && !field.readonly">
      <input ref="fileInput" type="file" @change="onChange" :multiple="field.multiple">
      <button type="button" class="fds-c-action t-secondary v-semi" @click="open"><i class="fi fi-rr-file-upload"></i>Select {{ field.multiple ? 'files' : 'file' }}</button>
      <span class="fds-c-file-field__message">{{ message }}</span>
    </template>
    <div class="fds-c-file-field__files" v-if="files.length > 0">
      <div v-for="file in files">
        <template v-if="file.isImage">
          <div :class="{'fds-c-input': !viewer && !field.readonly}"><img  :src="file.contents"></div>
        </template>
        <div v-else :class="{'fds-c-input': !viewer && !field.readonly}"><span>{{ file.name }} {{ file.mime }}</span></div>
      </div>
    </div>
  </div>
</template>

<script>

import Vue from 'vue'
import Entity from '#services/Entity'
import File from '#models/internals/File'

export default {
  name: 'FileField',

  props: {
    form: { type: Object },
    field: { type: Object },
    filter: { type: Boolean },
    viewer: { type: Boolean }
  },

  data: () => ({
    files: []
  }),

  created() {
    const value = this.form[this.field.key]
    if (value) {
      const files = this.field.multiple ? value : [value]
      this.files = files.map(file => {
        if (typeof file === 'object') {
          return file
        } else {
          return {
            isImage: true,
            contents: file
          }
        }
      })
    }
  },

  computed: {
    message() {
      return this.files.length > 0 ? this.i18n('common.filesSelected', this.files.length, `${this.files.length} ${this.files.length === 1 ? 'file' : 'files'}`) : this.i18n('common.filesSelected', 0, 'No files')
    }
  },

  methods: {
    open() {
      this.$refs.fileInput.click()
    },
    onChange(event) {
      const fileList = this.$refs.fileInput.files

      const files = Promise.all([...fileList].map(fileData => {
        const reader = new FileReader()
        return new Promise(resolve => {
          reader.addEventListener('load', () => resolve({
            fileData,
            contents: reader.result
          }))
          reader.readAsDataURL(fileData)
        })
      })).then(results => {
        this.files = results.map(({fileData, contents}) => new File({
          id: Entity.UidIndex++ + '-' + Date.now(),
          lastModified: fileData.lastModifiedDate,
          name: fileData.name,
          size: fileData.size,
          mime: fileData.type,
          contents
        }))
        const value = this.field.multiple ? this.files : this.files[0]
        this.form[this.field.key] = value
        this.$emit('input', value)
        this.$el.dispatchEvent(new Event('input', { bubbles: true }))
        console.log('files!!', { event, files: this.files })
      })
      /*
      if (file) {
        output.innerText = await file.text();
      }
      */
    }
  }
}
</script>

<style lang="scss">
  .--ds {
    .fds-c-file-field {
      position: relative;
      > input[type=file] {
        display: none;
      }
      > button {
        margin-bottom: var(--spacing-m);
      }
    }
    .fds-c-file-field__files {
      display: flex;
      gap: var(--spacing-l);
      padding: var(--spacing-s);
      flex-direction: column;
      > img {
        border: 1px solid var(--color--light-2);
        border-radius: 2px;
        max-width: 200px;
      }
    }
  }
</style>
