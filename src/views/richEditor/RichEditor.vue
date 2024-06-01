<template>
  <div class="c-rich-editor">
    <div class="c-rich-editor__top">
      <div class="c-rich-editor__toolbar">
        <span class="c-rich-editor__btn-group">
          <button title="Bold" :class="editor.isActive('bold') ? activeClass : null" @mousedown.prevent.stop="editor.commands.toggleBold()"><span class="fi fi-rs-bold"></span></button>
          <button title="Italic" :class="editor.isActive('italic') ? activeClass : null" @mousedown.prevent.stop="editor.commands.toggleItalic()"><span class="fi fi-rs-italic"></span></button>
          <button title="Strike" :class="editor.isActive('strike') ? activeClass : null" @mousedown.prevent.stop="editor.commands.toggleStrike()"><span class="fi fi-rs-strikethrough"></span></button>
          <button title="Underline" :class="editor.isActive('underline') ? activeClass : null" @mousedown.prevent.stop="editor.commands.toggleUnderline()"><span class="fi fi-rs-underline"></span></button>
          <button title="Highlight" :class="editor.isActive('highlight') ? activeClass : null" @mousedown.prevent.stop="editor.commands.toggleHighlight()"><span class="fi fi-rs-highlighter-line"></span></button>
          <button title="code" :class="editor.isActive('code') ? activeClass : null" @mousedown.prevent.stop="editor.commands.toggleCode()"><span class="fi fi-rs-code-simple"></span></button>
          <button title="link" :class="editor.isActive('link') ? activeClass : null" @mousedown.prevent.stop="toggleLinkUrl"><span class="fi fi-rs-link"></span></button>
          <!-- <button :class="editor.isActive('iframe') ? activeClass : null" @mousedown.prevent.stop="addIframe"><span class="fi fi-rs-link"></span></button> -->
        </span>
        <span class="c-rich-editor__btn-group">
          <button title="Code block" :class="editor.isActive('codeBlock') ? activeClass : null" @mousedown.prevent.stop="editor.commands.toggleCodeBlock()"><span class="fi fi-rs-rectangle-code"></span></button>
          <button title="Paragraph" :class="editor.isActive('paragraph') ? activeClass : null" @mousedown.prevent.stop="editor.commands.setParagraph()"><span class="fi fi-rs-paragraph"></span></button>
          <button title="H1" :class="editor.isActive('heading', {level : 1}) ? activeClass : null" @mousedown.prevent.stop="editor.commands.toggleHeading({level : 1})"><span class="fi fi-rs-h1"></span></button>
          <button title="H2" :class="editor.isActive('heading', {level : 2}) ? activeClass : null" @mousedown.prevent.stop="editor.commands.toggleHeading({level : 2})"><span class="fi fi-rs-h2"></span></button>
          <button title="H3" :class="editor.isActive('heading', {level : 3}) ? activeClass : null" @mousedown.prevent.stop="editor.commands.toggleHeading({level : 3})"><span class="fi fi-rs-h3"></span></button>
          <button title="H4" :class="editor.isActive('heading', {level : 4}) ? activeClass : null" @mousedown.prevent.stop="editor.commands.toggleHeading({level : 4})"><span class="fi fi-rs-h4"></span></button>
          <button title="Blockquote" :class="editor.isActive('blockquote') ? activeClass : null" @mousedown.prevent.stop="editor.commands.toggleBlockquote()"><span class="fi fi-rs-block-quote"></span></button>
        </span>
        <span class="c-rich-editor__btn-group">
          <button title="Horizontal rule" @click="editor.commands.setHorizontalRule()"><span class="fi fi-rs-horizontal-rule"></span></button>
          <button title="Bullet list" :class="editor.isActive('bulletList') ? activeClass : null" @mousedown.prevent.stop="editor.commands.toggleBulletList()"><span class="fi fi-rs-list"></span></button>
          <button title="Ordered list" :class="editor.isActive('orderedList') ? activeClass : null" @mousedown.prevent.stop="editor.commands.toggleOrderedList()"><span class="fi fi-rs-bars-sort"></span></button>
          <button title="Task list" :class="editor.isActive('taskList') ? activeClass : null" @mousedown.prevent.stop="editor.commands.toggleTaskList()"><span class="fi fi-rs-list-check"></span></button>
        </span>
        <span class="c-rich-editor__btn-group">
          <button title="Undo" @click="editor.commands.undo()"><span class="fi fi-rs-undo"></span></button>
          <button title="Redo" @click="editor.commands.redo()"><span class="fi fi-rs-redo"></span></button>
          <!-- <button title="HTML view" :class="htmlView ? activeClass : null" @click="(htmlView = !htmlView) && (mdView = false)">html</button> -->
          <button title="Markdown view" :class="mdView ? activeClass : null" @click="(mdView = !mdView) && (htmlView = false)"><span class="fi fi-rs-file-code"></span></button>
          <template v-if="!autosave">
            <button :title="!pristine ? 'Saved' : 'Unsaved'" :class="!pristine ? activeClass : null" @click="save"><span class="fi fi-rs-disk"></span></button>
          </template>
          <div class="c-rich-editor__autosave c-rich-editor__flag" :class="autosave ? activeClass : null" @click="toggleAutosave">
            <span v-if="autosave"class="fi fi-rs-toggle-on"></span>
            <span v-else class="fi fi-rs-toggle-off"></span>
            <span>Autosave</span>
          </div>
          <!--
          <div class="c-rich-editor__editable c-rich-editor__flag" :class="editor.isEditable ? activeClass : null" @click="toggleEditable">
            <span v-if="editor.isEditable"class="fi fi-rs-toggle-on"></span>
            <span v-else class="fi fi-rs-toggle-off"></span>
            <span>Editable</span>
          </div>
          -->
        </span>
        <input
          type="text"
          v-if="linkUrlVisible"
          v-model="linkUrl"
          ref="linkActivator"
          @keydown.enter.prevent="setLinkUrl(false)"
          @keydown.esc="setLinkUrl(true)"
          @blur="setLinkUrl(false)"
          placeholder="http://"
        />
      </div>

      <div v-if="fromMemory" class="c-rich-editor__memory">Saved on local memory <span @click="$emit('clearMemory')">click here</span> to restore original content.</div>
    </div>

    <draggable tag="menu" class="c-rich-editor__sections-tabs c-tabs c-dragable" draggable=".c-draggable__item" :list="sections" @end="onSectionsChange">
      <li v-for="(section, sectionIndex) in sections" class="c-draggable__item">
        <span class="c-action v-semi" >
          <span v-html="section.title || 'Untitled'" @click="loadSection(sectionIndex)"></span>
          <button class="c-chip" @click.prevent="removeSection(sectionIndex)">
            <span class="fi fi-rr-cross-small"></span>
          </button>
          </span>
        </span>
      </li>
      <li slot="footer">
        <button class="c-action v-semi" @click="addSection">+</button>
      </li>
    </draggable>

    <div v-if="!htmlView && !mdView" class="c-rich-editor__document" v-bind="$attrs">
      <editor-content :editor="editor" class="c-rich-editor__page" />
    </div>

    <textarea
      class="c-rich-editor__textarea"
      v-else-if="htmlView"
      v-bind="$attrs"
      @input="$emit('input', $event)"
      :value="sections[currentSectionIndex].html"
    ></textarea>

    <textarea
      class="c-rich-editor__textarea"
      v-else-if="mdView"
      v-bind="$attrs"
      @input="$emit('input', $event)"
      :value="md"
    ></textarea>

  </div>
</template>

<script>
import Vue from 'vue'
import { Node, extensions } from '@tiptap/core'
import { Editor, EditorContent, VueNodeViewRenderer } from '@tiptap/vue-2'
import StarterKit from '@tiptap/starter-kit'
import Typography from '@tiptap/extension-typography'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Image from '@tiptap/extension-image'
import Highlight from '@tiptap/extension-highlight'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Indent from './lib/tiptapIndent'
import Highlighter from './Highlighter'
import { lowlight } from 'lowlight'
import webcomponent from './lib/webcomponent.highlight'
import htmlToMarkdown from './lib/htmlToMarkdown'
import markdownToHtml from './lib/markdownToHtml'
import draggable from 'vuedraggable'
// import Section from './tiptapSection'
// import Keymap from './tiptapKeymap'
// import Iframe from './tiptapIframe'

import 'highlight.js/styles/atom-one-dark-reasonable.css'

// const coreExtensions = Object.keys(extensions).filter(key => key !== 'Keymap' ).map(key => extensions[key])
// coreExtensions.push(Keymap)

/*
const Document = Node.create({
  name: 'doc',
  topNode: true,
  content: 'section+'
})
*/

lowlight.registerLanguage('webcomponent', webcomponent)
lowlight.registerLanguage('html', webcomponent)
lowlight.registerAlias('webcomponent', 'vue')
// lowlight.registerAlias('xml', 'html')

const sectionHash = '\n<!--- section --->\r\n'

export default Vue.component('RichEditor', {
  components: {
    EditorContent,
    draggable
  },
  props: {
    value: { type: String, default: null },
    fromMemory: { type: Boolean, default: false }
  },
  data: () => ({
    pristine: true,
    currentSectionIndex: 0,
    autosave: localStorage.getItem('autosave') === 'true',
    editor: null,
    htmlView: false,
    mdView: false,
    linkUrl: null,
    linkUrlVisible: false,
    activeClass: 'active',
    sections: [],
    md: undefined
  }),
  watch: {
    value: {
      handler (value, oldValue) {
        this.refresh(value)
        this.pristine = true
      }
    }
  },
  created () {
    window.RichEditor = this
    this.editor = new Editor({
      // content: '',
      enableCoreExtensions: true,
      extensions: [
        // ...coreExtensions,
        StarterKit.configure({
          // document: false,
          heading: {
            levels: [1, 2, 3, 4]
          },
          link: { openOnClick: false },
          codeBlock: false
        }),
        Typography,
        Link.configure({
          openOnClick: false
        }),
        Underline,
        TaskList.configure({
          HTMLAttributes: {
            class: 'c-rich-editor__task-list'
          }
        }),
        TaskItem.configure({
          HTMLAttributes: {
            class: 'c-rich-editor__task-item'
          }
        }),
        // Document,
        Indent,
        Highlight,
        // Iframe,
        // Section,
        Image.configure({
          allowBase64: true,
          inline: true
        }),
        CodeBlockLowlight.extend({
          addNodeView () {
            return VueNodeViewRenderer(Highlighter)
          }
        }).configure({
          defaultLanguage: 'auto',
          lowlight
        })
      ],
      onUpdate: this.onUpdate
    })
    this.refresh(this.value)
  },
  mounted () {
    this.$el.addEventListener('keydown', this.onKeydown)
  },
  beforeDestroy () {
    this.$el.removeEventListener('keydown', this.onKeydown)
    this.editor.destroy()
  },
  methods: {
    loadSection(sectionIndex) {
      this.currentSectionIndex = sectionIndex
      this.editor.commands.setContent(this.sections[this.currentSectionIndex].html)
    },
    addSection() {
      this.sections.push({
        html: '<h1>New section</h1>',
        title: 'New section'
      })
      this.loadSection(this.sections.length - 1)
      this.onUpdate()
    },
    removeSection(sectionIndex) {
      this.sections.splice(sectionIndex, 1)
      this.onSectionsChange()
    },
    /*
    addIframe() {
      const url = window.prompt('URL')
      if (url) {
        this.editor.chain().focus().setIframe({ src: url }).run()
      }
    },
    */
    toggleAutosave () {
      this.autosave = !this.autosave
      localStorage.setItem('autosave', this.autosave)
    },
    onKeydown (event) {
      if (event.key === 's' && event.metaKey) {
        event.preventDefault()
        this.save()
      }
    },
    onUpdate () {
      const currentEditorHTML = this.editor.getHTML()
      const currentSection = this.sections[this.currentSectionIndex]
      currentSection.html = currentEditorHTML
      this.onSectionsChange(false)
      // if (currentSection.html !== currentEditorHTML) {}
    },
    onSectionsChange(refresh = true) {
      const md = this.sections.map(section => htmlToMarkdown(section.html)).join(sectionHash)
      this.pristine = false

      if (refresh) {
        this.refresh(md)
      } else {
        this.parseSections(md)
      }
      if (this.autosave) this.save()
    },
    parseSections(fileContents) {
      this.sections = fileContents.split(sectionHash).map(sectionContent => ({
        html: markdownToHtml(sectionContent),
        title: markdownToHtml(/^# (.*)/gm.exec(sectionContent)?.[1] || '')
      }))
      if (this.currentSectionIndex >= this.sections.length) this.currentSectionIndex = 0
      this.md = fileContents
    },
    refresh (fileContents) {
      if (this.md !== fileContents) {
        this.parseSections(fileContents)

        if (this.editor.getHTML() !== this.sections[this.currentSectionIndex].html) {
          /*
          const parser = new DOMParser()
          const serializer = new XMLSerializer()
          const domObject = parser.parseFromString( this.html || '', 'text/html')
          const sections = domObject.body.childNodes
          sections.forEach(child => {
            if (!child.textContent.trim()) return
            const section = document.createElement('section')
            section.append(child.cloneNode(true))
            child.replaceWith(section)
          })
          const sectioned = serializer.serializeToString(domObject)
          this.editor.commands.setContent(sectioned)
          */
          this.loadSection(this.currentSectionIndex)
        }
      }
    },
    save () {
      this.pristine = true
      this.$emit('input', this.md)
    },
    toggleLinkUrl () {
      this.linkUrl = null
      this.linkUrlVisible = !this.linkUrlVisible

      if (this.linkUrlVisible) {
        this.$nextTick(() => {
          if (this.$refs.linkActivator) {
            this.$refs.linkActivator.focus()
          }
        })
      }

      if (this.editor.isActive('link')) {
        this.linkUrl = this.editor.getAttributes('link').href
      }
    },
    toggleEditable() {
      this.editor.setEditable(!this.editor.isEditable)
    },
    setLinkUrl (cancel) {
      if (!cancel) {
        this.editor.commands.focus()
        this.editor.commands.setLink({ href: this.linkUrl })
      }
      this.toggleLinkUrl()
    },
    clearLinkUrl () {
      this.editor.commands.setLink({ href: null })
      this.toggleLinkUrl()
    }
  }
})
</script>

<style lang="scss">
.c-rich-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.c-rich-editor__btn-group {
  display: inline-block;
  display: flex;
  gap: 6px;
  button {
    cursor: pointer;
    border: 1px solid transparent;
    background-color: var(--color--dark-2);
    border-radius: 3px;
    padding: 0px 2px;
    display: inline-block;
    line-height: 1em;
    overflow: hidden;
    width: 2.2em;
    height: 2em;
    &.active {
      color: var(--color--white);
      background-color: var(--color--pale-3);
      border-bottom-color: var(--color--white);
    }
    &:hover {
      background-color: var(--color--dar-3);
    }
  }
}

.c-rich-editor__flag {
  cursor: pointer;
  align-self: center;
  display: flex;
  grid-gap: 4px;
  gap: 4px;
  flex-direction: row;
  font-size: 12px;
  line-height: 12px;
  margin-left: 12px;
  align-content: center;
  align-items: center;
  &.active {
    color: var(--color-green);
  }
}

.c-rich-editor__textarea {
  width: 100%;
  padding: 20px;
  resize: vertical;
  flex-grow: 1;
  border-style: none;
  background-color: var(--color--pale-3);
  color: #cbcbcb;
  border-radius: 0;
  font-weight: 400;
  line-height: 1.4em;
}

.c-rich-editor__top {
  box-shadow: 0 0 30px rgba(0,0,0,0.4);
  flex-grow: 0;
  z-index: 1;
  background-color: var(--color--dark-2);
}

.c-rich-editor__toolbar {
  border-top: 2px solid var(--color--dark-2);
  border-bottom: 1px solid var(--color--dark-2);
  display: flex;
  grid-gap: 12px;
  gap: 12px;
  // background-color: var(--color--pale-3);
  background-color: var(--color--dark-3);
  flex-direction: row;
  flex-wrap: wrap;
  padding: 18px 18px 18px;
  justify-content: space-between;
  align-items: stretch;
  align-content: flex-start;
  color: var(--color--pale-1);
  border-radius: 8px 0 0 0;
}

.c-rich-editor__memory {
  border-bottom: 1px solid rgba(0,0,0,0.1);
  background-color: var(--color-amber);
  padding: 8px;
  text-align: center;
  color: var(--color--white);
  font-weight: 600;
  span {
    cursor: pointer;
    text-decoration: underline;
    &:hover {
      color: var(--color--white);
    }
  }
}

.c-rich-editor__sections-tabs {
  padding-top: var(--spacing-l);
  background-color: var(--color--light-3);
}

.c-rich-editor__document {
  overflow: auto;
  background-color: var(--color--light-2);
  flex-grow: 1;
  position: relative;
  // display: flex;
}

.c-rich-editor__page {
  max-width: 920px;
  margin: 0 auto;
  padding: 40px 50px;
  font-weight: normal;
  // font-size: 12px;
  line-height: 1.45;
  background-color: var(--color--white);
  border: 1px solid var(--color--pale-1);
  border-width: 0 1px;
  flex-grow: 1;
  min-height: 100%;
  height: fit-content;
  display: flex;
}

.tiptap.ProseMirror {
  flex-grow: 1;
  min-height: 1500px; // REVIEW
  width: 100%;
  & > :not(.c-hightlighter) { // .c-rich-editor-section__content
    &,* {
      &:is(
        p,
        pre,
        blockquote,
        ul,
        ol,
        hr
      ) {
        font-size: 1em;
        margin-bottom: 0.8em;
        line-height: 1.4;
      }

      &:is(h1, h2, h3, h4) {
        margin: 1.4em 0 .5em;
        font-weight: 600;
        line-height: 1.5;
      }

      &:is(h1) {
        margin-top: 0;
        font-size: 2em;
      }

      &:is(h2) {
        font-size: 1.6em;
      }

      &:is(h3) {
        font-size: 1.4em;
      }

      &:is(h4) {
        font-size: 1.2em;
        margin-top: -0.5em;
      }

      &:is(h5) {
        font-size: 1em;
      }

      &:is(h6) {
        font-size: 1em;
      }

      &:is(ol, ul) {
        padding: 0 12px;
        margin-left: 1em;
      }

      &:is(ul) {
        list-style-type: disc;
      }

      &:is(ol) {
        list-style-type: numbered;
      }

      &:is(
        img,
        canvas,
        iframe,
        video,
        svg,
        select,
        textarea
      ) {
        max-width: 100%;
        margin: 12px;
      }

      &:is(img) {
        background-color: #dcdcdc;
        border-radius: 3px;
        padding: 5px;
      }

      &:is(blockquote) {
        border-left: 12px solid rgba(139, 139, 139, 0.1);
        padding: 20px 60px 20px 20px;
        background-color: rgba(139, 139, 139, 0.1);
        p:last-child {
          margin-bottom: 0;
        }
      }

      &:is(code, pre) {
        word-wrap: break-word;
        font-family: Monaco,Menlo,Consolas,Courier New,monospace!important;
        font-variant-ligatures: none;
        tab-size: 4;
        white-space: pre;
        word-break: normal;
      }

      &:is(pre) {
        padding: 12px 12px;
        border-radius: 3px;
        width: auto;
        overflow: auto;
        code {
          display: block;
          width: max-content;
          * {
            font-weight: 400 !important;
          }
        }
      }

      &:is(p, h1, h2, h3, h4, h5, h6) {
        code {
          display: inline-block;
          line-height: 1;
          // border: 1px solid #eeeeee;
          // background-color: #f7f7f7;
          border-radius: 3px;
          // color: #484848;
          padding: 2px 4px 1px;
          font-weight: normal;
        }
      }

      &:is(h1, h2, h3, h4, h5, h6) {
        code {
          font-size: 0.8em;
        }
      }
      &.c-rich-editor__task-list {
        list-style-type: none;
        padding: 6px 0px;
        margin-left: 4px;
        .c-rich-editor__task-item {
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
          align-items: flex-start;
          justify-content: flex-start;
          gap: var(--spacing-m);
          margin-bottom: var(--spacing-s);
          & > label {
          }
          & > div {
            flex-grow: 1;
          }
        }
      }
    }

    a, a:visited {
      color: #045e74;
      text-decoration: underline;
      cursor: pointer;
    }

    a:hover, a:focus, a:active {
      color: #65118d;
    }

    strong {
      font-weight: 600;
    }

    em {
      font-style: italic;
    }

    mark {
      background-color: var(--color-yellow);
      color: #2e2e2e;
    }

    small {
      font-size: 0.7em;
    }

    li {
      p {
        margin: 0;
      }
    }

    img.ProseMirror-separator {
      display: none !important;
    }
  }
}

/*
.c-rich-editor-section {
  padding: 6px 6px 6px 30px;
  margin: -6px -6px -6px -30px;
  border-radius: 3px;
  position: relative;
  .c-rich-editor-section__drag-handle {
    display: none;
    position: absolute;
    top: 1px;
    left: 1px;
    font-size: 20px;
    cursor: grab;
    color: rgb(136 136 136 / 50%);
  }
  &:hover {
    background: rgb(136 136 136 / 3%);
    .c-rich-editor-section__drag-handle {
      display: block;
    }
  }

  .c-rich-editor-section__content {
    flex: 1 1 auto;
  }
}
*/

// Dark mode
/*
.--darkmode {
  .c-rich-editor__document {
    background-color: #161616;
  }
  .c-rich-editor__page {
    border: none;
    background-color: #262626;
  }
  .tiptap.ProseMirror > :not(.c-hightlighter) { // .c-rich-editor-section__content
    color: var(--color--pale-1);
    &,* {
      &:is(p, h1, h2, h3, h4, h5, h6) {
        code {
          border: 1px solid #3f3f3f;
          background-color: #343434;
          color: #969696;
        }
      }
    }
  }
}
*/
</style>
