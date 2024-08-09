<template>
  <node-view-wrapper class="fds-c-rich-editor-section">
    <div
      class="fds-c-rich-editor-section__drag-handle"
      contenteditable="false"
      draggable="true"
      data-drag-handle
    ><span class="mdicon">drag_indicator</span></div>
    <node-view-content class="fds-c-rich-editor-section__content" @keydown.enter.native.stop.prevent />
  </node-view-wrapper>
</template>

<script>
import { NodeViewContent, nodeViewProps, NodeViewWrapper } from '@tiptap/vue-2'

export default {
  props: nodeViewProps,

  components: {
    NodeViewWrapper,
    NodeViewContent
  }
}
</script>
