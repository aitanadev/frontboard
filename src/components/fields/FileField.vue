<template>
  <div class="c-file-field">
    <template v-if="!viewer && !field.readonly">
      <input ref="fileInput" type="file" @change="onChange" :multiple="field.multiple">
      <button type="button" class="c-action t-secondary v-semi" @click="open"><i class="fi fi-rr-file-upload"></i>Select {{ field.multiple ? 'files' : 'file' }}</button>
      <span class="c-file-field__message">{{ message }}</span>
    </template>
    <div class="c-file-field__files" :class="{'c-input': !viewer && !field.readonly}" v-if="files.length > 0">
      <template v-for="file in files">
        <img v-if="file.isImage" :src="file.contents">
        <span v-else>{{ file.name }} {{ file.mime }}</span>
      </template>
    </div>
  </div>
</template>

<script>

import Vue from 'vue'
import Scheme from '#services/Scheme'
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
    if (value) this.files = this.field.multiple ? value : [value]
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
          id: Scheme.UidIndex++,
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
    .c-file-field {
      position: relative;
      > input[type=file] {
        display: none;
      }
      > button {
        margin-bottom: var(--spacing-m);
      }
    }
    .c-file-field__files {
      display: flex;
      gap: var(--spacing-l);
      padding: var(--spacing-s);
      flex-direction: column;
      img {
        border: 1px solid var(--color--light-2);
        border-radius: 2px;
      }
    }
  }
</style>
