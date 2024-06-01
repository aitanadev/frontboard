<template>
  <div
    class="c-datagrid"
    tabindex="0"
    :class="{
      '--scroll-none': !scroll.left && !scroll.right,
      '--scroll-bottom': scroll.bottom,
      '--scroll-right': scroll.right,
      '--scroll-top': scroll.top,
      '--scroll-left': scroll.left
    }"
  >
    <table
      ref="table"
      v-if="records || HTMLrecords"
      :style="{
        width: tableWidth + 'px' // $el.offsetWidth + 'px' //
      }"
    >
      <thead>
        <draggable tag="tr" class="c-dragable" draggable=".c-draggable__item" handle=".c-draggable__handler" :list="cols" @end="colsOrderUpdate">
          <template v-for="(col, index) in cols">
            <th
              v-if="col.col"
              :style="colStyle(col)"
              :class="(col.sticky ? ('--sticky-'+ col.sticky) : 'c-draggable__item') + (canSitcky(col) ? ' --stickable' : '')"
              v-bind="col.attributes"
              @mousedown="mouseDown(col, $event)"
              @mouseenter="mouseEnter(col, $event)"
              @mousemove="mouseMove(col, $event)"
              @mouseleave="mouseLeave(col, $event)"
              @dblclick="toggleSticky(col)"
            ><div class="c-datagrid__cell"><div :class="{'c-draggable__handler': !col.sticky}" @mousedown.stop>{{ col.label }}</div></div></th>
            <!-- <input type="checkbox" class="c-checkbox" @input="onColumVisibility" v-model="col.col"> -->
          </template>
          <template #header>
            <th
              v-for="(col, index) in colsPrepend"
              :style="colStyle(col)"
              :class="(col.sticky ? ('--sticky-'+ col.sticky) : '') + (canSitcky(col) ? ' --stickable' : '')"
              v-bind="col.attributes"

            ><div class="c-datagrid__cell">{{ col.label }}</div></th>
          </template>
          <template #footer>
            <th
              v-for="(col, index) in colsAppend"
              :style="colStyle(col)"
              :class="(col.sticky ? ('--sticky-'+ col.sticky) : '') + (canSitcky(col) ? ' --stickable' : '')"
              v-bind="col.attributes"
            ><div class="c-datagrid__cell">{{ col.label }}</div></th>
          </template>
        </draggable>
      </thead>
      <draggable ref="tbody" tag="tbody" class="c-dragable" draggable=".c-draggable__item" handle=".c-draggable__handler" :list="records || HTMLrecords">
        <template v-for="record in (records || HTMLrecords)">
          <template v-if="record === expand">
            <slot name="record" v-bind="{ record, cols: allCols, selectable, selected: isSelected(record) }">
              <DatagridRecord :record="record" :cols="allCols" :selectable="selectable" :sortable="sortable" :selected="isSelected(record)" :key="record.uid" @select="selectRecord"/>
            </slot>
            <tr class="c-datagrid__expand">
              <td :colspan="allCols.length">
                <div
                  class="c-datagrid__expand-content"
                  :style="{
                    width: offsetWidth + 'px'
                  }"
                >
                  <slot name="expand" v-bind="{ record, cols: allCols, selectable, selected: isSelected(record) }"></slot>
                </div>
              </td>
            </tr>
          </template>
          <template v-else>
            <slot name="record" v-bind="{ record, cols: allCols, selectable, selected: isSelected(record) }">
              <DatagridRecord :record="record" :cols="allCols" :selectable="selectable" :sortable="sortable" :selected="isSelected(record)" :key="record.uid" @select="selectRecord"/>
            </slot>
          </template>
        </template>
        <template v-if="draftLine" #footer>
          <slot name="record" v-bind="{ record: draftLine, cols: allCols, selectable, draftLine: true }">
            <DatagridRecord :record="draftLine" :cols="allCols" :key="draftLine.uid" class="c-datagrid__draftline"/>
          </slot>
          <tr class="c-datagrid__expand" v-if="draftLine === expand">
            <td :colspan="allCols.length">
              <div
                class="c-datagrid__expand-content"
                :style="{
                  width: offsetWidth + 'px'
                }"
              >
                <slot name="expand" v-bind="{ record: draftLine, cols: allCols, selectable }"></slot>
              </div>
            </td>
          </tr>
        </template>
      </draggable>
      <tfoot><tr><td :colspan="allCols.length"></td></tr></tfoot>
    </table>
  </div>
</template>

<script>

import Vue from 'vue'
import draggable from 'vuedraggable'
import Field from '#models/internals/Field'

// Put to ignore 'cell' and 'record' tags to remove this --->
const record = Vue.component('record', {
  template: '<div class="record"><slot></slot></div>'
})

const cell = Vue.component('cell', {
  template: '<div class="cell"><slot></slot></div>'
})

export default {
  name: 'Datagrid',

  components: {
    draggable
  },

  props: {
    records: { type: Array },
    cols: { type: Array, default: () => [] },
    colsPrepend: { type: Array },
    colsAppend: { type: Array },
    selectable: { type: Boolean},
    sortable: { type: Boolean},
    expand: { type: Object },
    draftLine: { type: Object }
  },

  data: () => ({
    HTMLrecords: undefined,
    mouseStatus: {},
    selection: [],
    scroll: {},
    tableSpace: 0,
    offsetWidth: 0
  }),

  created() {
    window.Datagrid = this
    const defaultSlot = this.$slots.default

    this.cols.forEach((col, index) => (this.cols[index] = col.Class !== Field ? new Field(col) : col))

    if (defaultSlot) {
      const renderer = new Vue({
        render: function (createElement) {
          return createElement(
            'template',
            defaultSlot
          )
        }
      }).$mount()

      const records = []
      renderer.$el.querySelectorAll('.record').forEach(($record) => {
        const cells = [...$record.querySelectorAll('.cell')].map($cell => $cell.innerHTML)
        const record = Object.fromEntries(this.cols.map((col, index) => {
          return [col.key, cells[index]]
        }))
        records.push(record)
      })

      // console.log({records})

      this.HTMLrecords = records
    }
  },

  mounted() {
    document.addEventListener('mousemove', this.allMouseMove)
    document.addEventListener('mouseup', this.allMouseUp)
    this.$el.addEventListener('keydown', this.onKeydown)
    this.$el.addEventListener('scroll', this.onTableChange)
    this.$el.addEventListener('wheel', this.onTableChange)
    this.$nextTick().then(() => this.onTableChange())
    this.sizingControl()
  },

  beforeDestroy() {
    document.removeEventListener('mousemove', this.allMouseMove)
    document.removeEventListener('mouseup', this.allMouseUp)
    this.$el.removeEventListener('keydown', this.onKeydown)
    this.$el.removeEventListener('scroll', this.onTableChange)
    this.$el.removeEventListener('wheel', this.onTableChange)
  },

  computed: {
    tableWidth() {
      return this.allCols.reduce((acumulator, col) => acumulator + col.size, 0)
    },
    allCols() {
      return [...(this.colsPrepend || []), ...this.cols, ...(this.colsAppend || [])].filter(col => col.col)
    }
  },

  methods: {
    sizingControl () {
      if (!this.$el.isConnected) return
      if (this.$el.offsetWidth !== this.offsetWidth) {
        // console.log('requestAnimationFrame')
        this.offsetWidth = this.$el.offsetWidth
        this.onTableChange()
      }
      window.requestAnimationFrame(this.sizingControl)
    },
    onKeydown (event) {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        event.stopPropagation()
        this.focusNext()
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        event.stopPropagation()
        this.focusNext(true)
      }
    },
    colsOrderUpdate() {
      // console.log('update cols order')
      // this.$emit('cols:update')
      // this.$forceUpdate()
    },
    onColumVisibility() {
      // TODO
    },
    colStyle(col) {
      const allCols = this.allCols
      const index = allCols.indexOf(col)
      return {
        width: col.size + (index === allCols.length - 1 ? this.tableSpace : 0) + 'px',
        left: col.sticky === 'left' ? (allCols.slice(0, index).reduce((acumulator, col) => acumulator + col.size, 0) + 'px') : 'unset',
        right: col.sticky === 'right' ? (allCols.slice(index + 1).reduce((acumulator, col) => acumulator + col.size, 0) + 'px') : 'unset'
      }
    },
    focusNext(reverse) {
      const allRows = [...this.$el.querySelectorAll('.c-datagrid__row')]
      const focusedIndex = allRows.indexOf(document.activeElement)
      if (focusedIndex >= 0) {
        const nextIndex = (allRows.length + focusedIndex + (reverse ? -1 : 1)) % allRows.length
        // console.log('....>', {focusedIndex, nextIndex})
        allRows[nextIndex].focus()
      } else {
        const nextIndex = reverse ? allRows.length - 1 : 0
        allRows[nextIndex].focus()
      }
    },
    selectRecord(record) {
      const index = this.selection.indexOf(record)
      if (index >= 0) {
        this.selection.splice(index, 1)
      } else {
        this.selection.push(record)
      }
      this.$emit('selectionChange', this.selection)
    },
    isSelected(record) {
      return this.selection.includes(record)
    },
    canSitcky(col) {
      let stickablesLeft = []
      let stickablesRight = []
      this.allCols.every((col, index) => {
        if (!stickablesLeft.length || (stickablesLeft.length === index && stickablesLeft[index - 1].sticky)) {
          stickablesLeft.push(col)
          return true
        }
      })
      this.allCols.toReversed().every((col, index) => {
        if (!stickablesRight.length || (stickablesRight.length === index && stickablesRight[index - 1].sticky)) {
          stickablesRight.push(col)
          return true
        }
      })
      if (stickablesLeft.includes(col)) return 'left'
      if (stickablesRight.includes(col)) return 'right'
    },
    toggleSticky(col) {
      col.sticky = col.sticky ? false : this.canSitcky(col)
      // this.$forceUpdate()
    },
    onTableChange() {
      const scrollElement = this.$el
      const newScroll = {
        bottom: scrollElement.scrollHeight - scrollElement.scrollTop > scrollElement.offsetHeight,
        right: scrollElement.scrollWidth - scrollElement.scrollLeft > scrollElement.offsetWidth,
        top: scrollElement.scrollTop > 0,
        left: scrollElement.scrollLeft > 0
      }
      if (JSON.stringify(this.scroll) !== JSON.stringify(newScroll)) this.scroll = newScroll

      // console.log('onTableChange', this.scroll)
      const space = this.$el.offsetWidth - this.tableWidth
      this.tableSpace = space > 0 ? space : 0
    },

    mouseEnter (col) {
      // console.log('mouseEnter', col.key)
      if (!this.mouseStatus.down) {
        this.mouseStatus.col = col
      }
    },
    mouseLeave (col) {
      // console.log('mouseLeave', col.key)
      if (!this.mouseStatus.down) {
        this.mouseStatus.col = false
      }
    },
    mouseMove (col, event) {
      if (!this.mouseStatus.down) {
        const resizeActiveSpace = 8
        const colIndex = this.allCols.indexOf(col)
        const isFirst = colIndex === 0
        const isLast = colIndex + 1 === this.allCols.length
        const leftResizeArea = event.offsetX < resizeActiveSpace && !isFirst
        const rightResizeArea = event.currentTarget.offsetWidth - event.offsetX < resizeActiveSpace // && !isLast
        // console.log('moving', { leftResizeArea, rightResizeArea })
        if (leftResizeArea || rightResizeArea) {
          this.mouseStatus.resize = {
            left: leftResizeArea,
            right: rightResizeArea,
            colIndex,
            isFirst,
            isLast
          }
        } else {
          this.mouseStatus.resize = false
        }
      }
    },
    mouseDown (col, event) {
      // console.log('colDown', col)
      event.preventDefault()
      this.mouseStatus.down = {
        x: event.x
      }
    },
    allMouseMove (event) {
      const mouseStatus = this.mouseStatus
      if (mouseStatus.col && mouseStatus.resize) {
        if (mouseStatus.resize.left) {
          this.$el.style.setProperty('cursor', 'ew-resize', 'important')
        } else {
          this.$el.style.setProperty('cursor', 'ew-resize', 'important')
        }
      } else {
        this.$el.style.removeProperty('cursor')
      }
      if (mouseStatus.down && mouseStatus.resize) {
        const scroll = false // !this.scroll.right && !this.scroll.left
        const leftResize = mouseStatus.resize.left && mouseStatus.col.sticky !== 'right'
        const col = leftResize ? this.allCols[mouseStatus.resize.colIndex - 1] : mouseStatus.col
        const diff = event.x - mouseStatus.down.x
        mouseStatus.down.x = event.x
        const currentColSize = col.size
        const move = ((mouseStatus.resize.left && !leftResize) ? -diff : diff)
        // TODO: Needs a refactor
        // Try different aproach using the table offsetWidth (using a width auto table) and a last adjustable empty row
        // Other option: Use a switch to turn on scroll on a no scrolled tale using a width auto table too
        // Other option: Use diferent cursor on resizable columns headers noticing the type of the resizing method per column (left/right arrows cursor?)
        /*
        if (scroll && !mouseStatus.resize.isLast) {
          const next = leftResize ? this.allCols[mouseStatus.resize.colIndex] : this.allCols[mouseStatus.resize.colIndex + 1]
          const nextColSize = next.size
          next.size = (nextColSize - move) || 1
        }
        */

        if (mouseStatus.resize.isLast && mouseStatus.resize.left) {
          const prev = this.allCols[mouseStatus.resize.colIndex - 1]
          const prevColSize = prev.size
          prev.size = (prevColSize - move) || 1
        }

        col.size = (currentColSize + move) || 1

        // console.log('allMouseMove', mouseStatus.resize, mouseStatus.down.x, diff, currentColSize, col.size, col)

        this.onTableChange()
      }
    },
    allMouseUp (event) {
      this.mouseStatus.down = false
    }
  }
}
</script>
<style lang="scss">
.c-datagrid {
  --table-border: 1px solid var(--color--pale-1);
  --td-border: 1px solid var(--color--pale-1);
  display: inline-block;
  width: auto;
  overflow: auto;
  // overscroll-behavior: contain;
  max-width: 100%;
  max-height: 500px;
  &:focus-within {
    --table-border: 1px solid var(--color--primary);
  }
}

.c-datagrid > table {
  // background-color: var(--color--white);
  border-spacing: 0;
  border-collapse: separate;
  table-layout: fixed;
  min-width: 100%;

  >thead, >tbody, >tfoot {
    > tr {
      >td, >th {
        padding: 0;
        border: var(--td-border);
        background-color: var(--color--white);
        border-bottom-style: none; // review before top
        border-right-style: none;
        position: relative;
        // height: 3em;
        // height: 37px;
        white-space: nowrap;
        // text-align: left;
        &>.c-datagrid__cell {
          // overflow: visible; // <-----
          // position: absolute; // <-----
          // align-items: center;
          // align-items: start;
          align-items: stretch;
          display: flex;
          gap: var(--spacing-s);
          padding: var(--spacing-s) var(--spacing-m);

          // min-height: 1em;
          min-height: 100%;
          // <---
          // top: 0;
          // left: 0;
          // bottom: 0;
          // right: 0;
          // <---

          flex-direction: column;

          // align-items: stretch; // <---- review
          // border: 1px solid red;
        }
        &.--sticky-left {
          z-index: 2;
          position: sticky;
          left: 0;
          border-right: var(--td-border);
          & + td, & + th {
            border-left-style: none;
          }
        }
        &.--sticky-right {
          z-index: 2;
          position: sticky;
          right: 0;
          border-left: var(--td-border);
        }
        &:first-child {
          border-left: var(--table-border);
        }
        &:last-child {
          border-right: var(--table-border);
        }
        /*
        &>*{
          white-space: nowrap;
          // overflow: hidden; // review
        }
        */
      }
      >th, >td.--sticky-left, >td.--sticky-right {
        background-color: var(--color--light-3);
        background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0.04));
        &.--sticky-left {
          // text-align: center;
          .c-datagrid__cell {
            // justify-content: center;
          }
        }
      }
    }
  }
  > thead > tr {
    z-index: 3;
    position: sticky;
    top: 0;
    > th {
      border-bottom-style: none;
      background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1));
      border-top: var(--table-border);

      // border-bottom: var(--table-border);
      &.--stickable {
        // cursor: pointer;
      }

      >* { // reivew, copied from .c-scheme-field__viewer

        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;

        width: 100%;
        overflow: auto;
        height: 100%;
        flex-grow: 1;
        padding: var(--spacing-xs);
      }
      &:hover {
        // background-color: #e7e7e7;
        background-color: var(--color--light-2);
      }
    }
  }
  > tbody > tr {
    // position: relative;
    z-index: 1;
    &:first-child > td {
      // border-top-style: none;
    }
    &:last-child > td {
      border-bottom-style: solid;
    }
    /*
    &.c-datagrid__row--selected, &:hover, &:focus-within {
      td {
        border-color: var(--color--primary);
      }
      &+:not(.c-datagrid__row--selected) td {
        border-top-color: var(--color--primary);
      }
    }
    */
    &:focus-within:not(.c-datagrid__expand), &[active] {
      > td {
        border-color: var(--color--primary);
      }
      &+:not(:focus-within) > td {
        border-top-color: var(--color--primary);
      }
    }
    &:hover {
      > td {
        // background-color: var(--color--light-3);
        // background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0.04));
      }
      >.--sticky-left, >.--sticky-right {
        background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.08));
      }
    }
  }
  > tfoot > tr {
    z-index: 3;
    position: sticky;
    bottom: 0;
    > td {
      border: none;
      // border-top: var(--table-border) !important;
      padding: 0;
      height: 0;
    }
  }
  > tbody:empty + tfoot > tr > td {
    border-bottom: var(--table-border);
  }
}
  // &.--scroll-none thead tr th:nth-last-child(1 of :not(.--sticky-right)) // Prev sticky selector
.c-datagrid {
  --linear-gradient: rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.02), rgba(0, 0, 0, 0);
  &.--scroll-left table {
    >thead, >tbody, >tfoot {
      > tr >.--sticky-left {
        &::after {
          content: "";
          position: absolute;
          top: -1px;
          bottom: 0;
          left: 100%;
          width: 12px;
          background-image: linear-gradient(90deg, var(--linear-gradient));
        }
      }
    }
  }
  &.--scroll-right table {
    >thead, >tbody, >tfoot {
      >tr >.--sticky-right {
        &::after {
          content: "";
          position: absolute;
          top: -1px;
          bottom: 0;
          right: 100%;
          width: 12px;
          background-image: linear-gradient(270deg, var(--linear-gradient));
        }
        & + .--sticky-right {
          &::after {
            display: none;
          }
        }
      }
    }
  }
  &.--scroll-top > table > thead > tr {
    > th {
      border-bottom: var(--td-border);
    }
    &::after {
      content: "";
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      height: 12px;
      background-image: linear-gradient(180deg, var(--linear-gradient));
    }
  }
  &.--scroll-bottom {
    border-bottom: var(--table-border);
  }
  &.--scroll-bottom > table > tfoot > tr > td {
    &::after {
      content: "";
      position: absolute;
      top: -12px;
      left: 0;
      right: 0;
      height: 12px;
      background-image: linear-gradient(0deg, var(--linear-gradient));
      // border-bottom: var(--table-border);
    }
  }
}

.c-datagrid__expand {
}

.c-datagrid__draftline {
  border-top: 1px solid red;
}

.c-datagrid__expand-content {
  position: sticky !important;
  left: 0;
  margin: 0 -1px;
  border: 1px solid var(--color--pale-1);
  border-style: solid none;
  // box-shadow: 0 2px 21px 0px rgba(0, 0, 0, 0.2) inset;
  box-shadow: 1px 1px 10px 0px rgba(0, 0, 0, 0.2) inset;
  background: var(--color--white);
}
</style>>
