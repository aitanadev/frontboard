import { mergeAttributes, Node } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-2'
import RichEditorSection from './RichEditorSection.vue'

export default Node.create({
  name: 'section',
  content: 'block',
  isTextblock: false,
  draggable: true,

  parseHTML() {
    return [{tag: 'section'}]
  },

  renderHTML({ HTMLAttributes }) {
    return ['section', mergeAttributes(HTMLAttributes), 0]
  },

  addNodeView() {
    return VueNodeViewRenderer(RichEditorSection)
  }
})
