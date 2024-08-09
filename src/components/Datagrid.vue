<template>
  <div
    class="fds-c-datagrid"
    tabindex="0"
    :class="{
      'datagrid--scroll-none': !scroll.left && !scroll.right,
      'datagrid--scroll-bottom': scroll.bottom,
      'datagrid--scroll-right': scroll.right,
      'datagrid--scroll-top': scroll.top,
      'datagrid--scroll-left': scroll.left,
      'datagrid--grouped': grouped
    }"
  >
    <table
      ref="table"
      :style="{ width: tableWidth + 'px' }"
    >
      <thead>
        <draggable tag="tr" class="fds-c-dragable" draggable=".fds-c-draggable__item" handle=".fds-c-draggable__handler" :list="cols" @end="colsOrderUpdate">
          <template v-for="col in cols">
            <th
              v-if="col.col"
              v-bind="colBind(col)"
              v-on="colOn(col)"
            >
              <div class="fds-c-datagrid__cell" :class="'fds-c-datagrid__header__' + col.key">
                <div v-if="col.labelHTML" :class="{'fds-c-draggable__handler': !col.sticky}" @mousedown.stop v-html="col.labelHTML"></div>
                <div v-else :class="{'fds-c-draggable__handler': !col.sticky}" @mousedown.stop>
                  <slot :name="'header.' + col.key">{{ col }}</slot>
                </div>
              </div>
            </th>
          </template>
          <template #header>
            <th
              v-for="col in colsPrepend"
              v-bind="colBind(col)"
              v-on="colOn(col)"
            >
              <div class="fds-c-datagrid__cell" :class="'fds-c-datagrid__header__' + col.key">
                <div v-if="col.labelHTML" v-html="col.labelHTML"></div>
                <template v-else-if="col.key === '$'">
                  <button
                    v-if="selectable"
                    type="checkbox"
                    class="fds-c-checkbox"
                    :checked="allPagesSelected || isAllSelection"
                    :indeterminate="isIndeterminateSelection"
                    @click="toggleSelection"
                    tid="table_select_all"
                  ></button>
                </template>
                <slot :name="'header.' + col.key">{{ col }}</slot>
            </div></th>
          </template>
          <template #footer>
            <th
              v-for="col in colsAppend"
              v-bind="colBind(col)"
              v-on="colOn(col)"
            >
              <div class="fds-c-datagrid__cell" :class="'fds-c-datagrid__header__' + col.key">
                <div v-if="col.labelHTML" v-html="col.labelHTML"></div>
                <slot v-else :name="'header.' + col.key">{{ col }}</slot>
              </div>
            </th>
          </template>
        </draggable>
      </thead>

      <template>
        <template v-for="[groupHeader, records] in groups">
          <draggable ref="tbody" tag="tbody" class="fds-c-dragable" draggable=".fds-c-draggable__item" handle=".fds-c-draggable__handler" :list="records">
            <template v-for="record in records">
              <template v-if="record === expand">
                <slot name="record" v-bind="{ record, cols: allCols, selectable, selected: isSelected(record) }">
                  <DatagridRecord :record="record" :cols="allCols" :selectable="selectable" :sortable="sortable" :selected="isSelected(record)" :key="record.uid" @select="selectRecord">
                    <template #cell="{ record, col }">
                      <slot name="cell" v-bind="{ record, col }"></slot>
                    </template>
                  </DatagridRecord>
                </slot>
                <tr class="fds-c-datagrid__expand">
                  <td :colspan="allCols.length">
                    <div class="fds-c-datagrid__expand-content" :style="{ width: offsetWidth + 'px' }">
                      <slot name="expand" v-bind="{ record, cols: allCols, selectable, selected: isSelected(record) }"></slot>
                    </div>
                  </td>
                </tr>
              </template>
              <template v-else>
                <slot name="record" v-bind="{ record, cols: allCols, selectable, selected: isSelected(record) }">
                  <DatagridRecord :record="record" :cols="allCols" :selectable="selectable" :sortable="sortable" :selected="isSelected(record)" :key="record.uid" @select="selectRecord">
                    <template #cell="{ record, col }">
                      <slot name="cell" v-bind="{ record, col }"></slot>
                    </template>
                  </DatagridRecord>
                </slot>
              </template>
            </template>
            <template v-if="groups.length > 1" #header>
              <tr class="datagrid__group-space"><td :colspan="allCols.length"></td></tr>
              <tr class="datagrid__group-header">
                <template v-for="(col, index) in allCols">
                  <th
                    v-if="col.col"
                    :class="col.sticky ? ('--sticky-'+ col.sticky) : ''"
                    :key="col.key"
                  >
                    <div class="fds-c-datagrid__cell">
                      <div v-if="groupHeader[col.key + 'HTML']" v-html="groupHeader[col.key]"></div>
                      <slot v-else :name="'group.header.' + col.key">{{ groupHeader[col.key] }}</slot>
                    </div>
                  </th>
                </template>
              </tr>
            </template>
            <template v-if="draftLine" #footer>
              <slot name="record" v-bind="{ record: draftLine, cols: allCols, selectable, draftLine: true }">
                <DatagridRecord :record="draftLine" :cols="allCols" :key="draftLine.uid" class="fds-c-datagrid__draftline">
                  <template #cell="{ record, col }">
                    <slot name="cell" v-bind="{ record, col }"></slot>
                  </template>
                </DatagridRecord>
              </slot>
              <tr class="fds-c-datagrid__expand" v-if="draftLine === expand">
                <td :colspan="allCols.length">
                  <div
                    class="fds-c-datagrid__expand-content"
                    :style="{ width: offsetWidth + 'px' }"
                  >
                    <slot name="expand" v-bind="{ record: draftLine, cols: allCols, selectable }"></slot>
                  </div>
                </td>
              </tr>
            </template>
          </draggable>
        </template>
      </template>
      <tfoot><tr><td :colspan="allCols.length"><slot name="footer"></slot></td></tr></tfoot>
    </table>
  </div>
</template>

<script>

import Vue from 'vue'
import draggable from 'vuedraggable'
import Field from '#models/internals/Field'
import DatagridRecord from '#components/DatagridRecord'

Vue.config.ignoredElements.push('data-group', 'data-group-header', 'data-record', 'data-cell')

export default {
  name: 'FrontboardDatagrid',

  components: {
    draggable,
    DatagridRecord
  },

  props: {
    records: { type: Array },
    cols: { type: Array },
    grouped: { type: Boolean },
    colsPrepend: { type: Array },
    colsAppend: { type: Array },
    selectable: { type: Boolean},
    sortable: { type: Boolean},
    expand: { type: Object },
    totalRecords: { type: Number, default: 0 },
    draftLine: { type: Object },
    typeNaming: { type: Array, default: () => ['item', 'items'] }
  },

  data: () => ({
    mouseStatus: {},
    selection: [],
    scroll: {},
    tableSpace: 0,
    offsetWidth: 0,
    allPagesSelected: false
  }),

  created() {
    window.Datagrid = this
    this.cols.forEach((col, index) => (this.cols[index] = col.Class !== Field ? new Field(col) : col))
    this.initialCols = [...this.cols]
    this.slotGroups = this.getSlotGroups()
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
    },
    groups() {
      const dataSlot = this.$slots.data
      if (dataSlot) {
        const renderer = new Vue({ render: (createElement) => createElement('template', dataSlot) }).$mount()

        if (this.grouped) {
          const groups = [...renderer.$el.querySelectorAll('data-group')].map(group => {
            const dataGroupHeader = group.querySelector('data-group-header')
            const dataGroupHeaderCells = this.getSlotRecord(dataGroupHeader)
            return [ dataGroupHeaderCells, this.getSlotRecords(group) ]
          })
          return groups
        } else {
          const records = this.getSlotRecords(renderer.$el)
          return [[{}, records]]
        }
      } else if (this.grouped) {
        return this.records
      } else {
        return [[{}, this.records]]
      }
    },
    allRecords() {
      return this.groups.map(group => group[1]).flat()
    },
    isAllSelection() {
      return this.selectionCount > 0 && this.selectionCount === this.allRecords.length
    },
    isIndeterminateSelection() {
      return this.selectionCount > 0 && !this.isAllSelection
    },
    selectionCount() {
      return this.selection.length
    },
    paginated() {
      return this.allRecords.length < this.totalRecords
    }
  },

  methods: {
    selectAll() {
      if (this.allPagesSelected) return this.clearSelection()
      this.selection = [...this.allRecords]
      this.onSelectionChange()
    },
    selectAllPages() {
      this.allPagesSelected = true
      this.selection = [...this.allRecords]
      this.onSelectionChange()
    },
    clearSelection() {
      this.allPagesSelected = false
      this.selection = []

      this.onSelectionChange()
    },
    toggleSelection() {
      if (this.selectionCount > 0) {
        this.clearSelection()
      } else {
        this.selectAll()
      }
    },
    colBind(col) {
      const allCols = this.allCols
      const index = allCols.indexOf(col)
      const lastNoSticky = allCols.toReversed().find(col => !col.sticky)

      return {
        style: {
          width: col.size + (col === lastNoSticky ? this.tableSpace : 0) + 'px', // col.size + 'px', // For no-full-width tables
          // width: col.size + (index === allCols.length - 1 ? this.tableSpace : 0) + 'px', // col.size + 'px', // For no-full-width tables
          left: col.sticky === 'left' ? (allCols.slice(0, index).reduce((acumulator, col) => acumulator + col.size, 0) + 'px') : 'unset',
          right: col.sticky === 'right' ? (allCols.slice(index + 1).reduce((acumulator, col) => acumulator + col.size, 0) + 'px') : 'unset'
        },
        class: (col.sticky ? ('--sticky-' + col.sticky) : (index >= 0 ? 'fds-c-draggable__item' : '')) + (this.canSitcky(col) ? ' --stickable' : ''),
        key: col.key
      }
    },
    colOn(col) {
      return {
        mousedown: (event) => this.onColMouseDown(col, event),
        mouseenter: (event) => this.onColMouseEnter(col, event),
        mousemove: (event) => this.onColMouseMove(col, event),
        mouseleave: (event) => this.onColMouseLeave(col, event),
        dblclick: (event) => this.onColDblclick(col)
      }
    },
    getSlotGroups() {
      const dataSlot = this.$slots.data
      if (!dataSlot) return

      const renderer = new Vue({ render: (createElement) => createElement('template', dataSlot) }).$mount()

      if (this.grouped) {
        const groups = [...renderer.$el.querySelectorAll('data-group')].map(group => {
          const dataGroupHeader = group.querySelector('data-group-header')
          const dataGroupHeaderCells = this.getSlotRecord(dataGroupHeader)
          return [ dataGroupHeaderCells, this.getSlotRecords(group) ]
        })
        return groups
      } else {
        const records = this.getSlotRecords(renderer.$el)
        return [[{}, records]]
      }
    },
    getSlotRecords(dataGroup) {
      return [...dataGroup.querySelectorAll('data-record')].map(this.getSlotRecord)
    },
    getSlotRecord(dataRecord) {
      const record = JSON.parse(dataRecord.getAttribute('record')) || {}
      const htmlCells = [...dataRecord.querySelectorAll('data-cell')].map(cell => cell.innerHTML)
      this.initialCols.forEach((col, index) => {
        record[col.key + 'HTML'] = htmlCells[index]
      })
      return record
    },
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
    onSelectionChange() {
      this.$emit('selectionChange', this.selection)
      this.$el.dispatchEvent(new CustomEvent('Datagrid:selectionChange', { bubbles: true, detail: this }))
    },
    colsOrderUpdate() {
      this.$emit('cols:update')
    },
    focusNext(reverse) {
      const allRows = [...this.$el.querySelectorAll('.fds-c-datagrid__row')]
      const focusedIndex = allRows.indexOf(document.activeElement)
      if (focusedIndex >= 0) {
        const nextIndex = (allRows.length + focusedIndex + (reverse ? -1 : 1)) % allRows.length
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
      this.onSelectionChange()
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
    onColDblclick(col) {
      col.sticky = col.sticky ? false : this.canSitcky(col)
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

      this.$forceUpdate()
    },

    onColMouseEnter (col) {
      // console.log('onColMouseEnter', col.key)
      if (!this.mouseStatus.down) {
        this.mouseStatus.col = col
      }
    },
    onColMouseLeave (col) {
      // console.log('onColMouseLeave', col.key)
      if (!this.mouseStatus.down) {
        this.mouseStatus.col = false
      }
    },
    onColMouseMove (col, event) {
      if (!this.mouseStatus.down) {
        const resizeActiveSpace = 8
        const colIndex = this.allCols.indexOf(col)
        const isFirst = colIndex === 0
        const isLast = colIndex + 1 === this.allCols.length
        const leftResizeArea = event.offsetX < resizeActiveSpace && !isFirst
        const rightResizeArea = event.currentTarget.offsetWidth - event.offsetX < resizeActiveSpace && !isLast
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
    onColMouseDown (col, event) {
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
        const leftResize = mouseStatus.resize.left && mouseStatus.col.sticky !== 'right'
        const col = leftResize ? this.allCols[mouseStatus.resize.colIndex - 1] : mouseStatus.col
        const diff = event.x - mouseStatus.down.x
        mouseStatus.down.x = event.x
        const currentColSize = col.size
        const move = ((mouseStatus.resize.left && !leftResize) ? -diff : diff)

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
.fds-c-datagrid {
  --table-border: 1px solid var(--color--pale-1);
  --td-border: 1px solid var(--color--pale-1);
  display: inline-block;
  width: auto;
  overflow: auto;
  max-width: 100%;
  max-height: 500px;
  &:focus-within {
    // --table-border: 1px solid var(--color);
  }
}

.fds-c-datagrid > table {
  border-spacing: 0;
  border-collapse: separate;
  table-layout: fixed;
  min-width: 100%; // Remove to use no-full-width tables
  // margin-bottom: -1px;

  >thead, >tbody, >tfoot {
    > tr {
      >td, >th {
        padding: 0;
        border: var(--td-border);
        background-color: var(--color--white);
        border-bottom-style: none;
        border-right-style: none;
        position: relative;
        white-space: nowrap;
        align-content: flex-start;
        text-align: left;
        >.fds-c-datagrid__cell {
          align-items: stretch;
          display: flex;
          gap: var(--spacing-s);
          padding: var(--spacing-s) var(--spacing-m);
          min-height: 100%;
          flex-direction: column;

          overflow: hidden;
          /* Invisible scroll *
          overflow: scroll;
          scrollbar-width: none;
          -ms-overflow-style: none;
          // max-height: 300px;
          /* */
          &::-webkit-scrollbar {
            display: none;
          }
          &::-webkit-scrollbar-thumb {
            display: none;
          }

          &:has(.fds-c-emergent--open) {
            background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0.04));
          }
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
        &:has(.fds-c-emergent--open) {
          z-index: 5;
        }
      }
      >th, >td.--sticky-left, >td.--sticky-right {
        background-color: var(--color--light-3);
        background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.04), rgba(0, 0, 0, 0.04));
      }
    }
  }
  > thead > tr {
    z-index: 3;
    position: sticky;
    top: 0;
    > th {
      background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1));
      border-bottom-style: none;
      border-top: var(--table-border);
      text-align: left;
      &.--stickable {
      }
      &:hover {
        background-color: var(--color--light-2);
      }
    }
  }
  > tbody {
    > tr {
      z-index: 1;
      &:last-child > td {
        border-bottom-style: solid;
      }
      &:focus-within:not(.fds-c-datagrid__expand), &[active] {
        > td {
          border-color: var(--color);
        }
        &+:not(:focus-within) > td {
          border-top-color: var(--color);
        }
      }
      /*
      &:focus-within { // &:focus-within {
        >:is(td, th):has(.fds-c-emergent--open) {
          z-index: 4;
        }
      }
      */

      &:hover {
        > td {
          background-image: linear-gradient(0deg, rgba(127, 127, 127, 0.04), rgba(127, 127, 127, 0.04));
        }
        >.--sticky-left, >.--sticky-right {
          background-image: linear-gradient(0deg, rgba(127, 127, 127, 0.2), rgba(127, 127, 127, 0.2));
        }
      }
    }
    &:empty + tfoot > tr > td {
      border-bottom: var(--table-border);
    }
    >.datagrid__group-header {
      margin-top: 10px;
    }
    >.datagrid__group-space {
      > td {
        border-top-style: none;
        height: 2em;
      }
    }
  }
  > tbody:last-of-type > tr:last-child > td {
    border-bottom-style: solid;
  }
  > tfoot > tr {
    z-index: 3;
    position: sticky;
    bottom: 0;
    > td {
      border-style: none;
      padding: 0;
      height: 0;
    }
  }
}

.fds-c-datagrid.datagrid--grouped > table > thead > tr > th {
  border-bottom: var(--td-border);
}

// Scroll shadows
.fds-c-datagrid {
  --linear-gradient: rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.02), rgba(0, 0, 0, 0);
  &.datagrid--scroll-left > table {
    >thead, >tbody, >tfoot {
      > tr > :nth-last-child(1 of :is(.--sticky-left)) {
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
  &.datagrid--scroll-right > table {
    >thead, >tbody, >tfoot {
      >tr > :nth-child(1 of :is(.--sticky-right)) {
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
  &.datagrid--scroll-top > table > thead > tr {
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
  &.datagrid--scroll-top:not(.datagrid--scroll-bottom) {
    > table > tbody:last-of-type > tr:last-child > td {
      border-bottom-style: none;
    }
    > table > tfoot > tr > td {
      border-bottom: var(--table-border);
    }
  }
  &.datagrid--scroll-bottom > table > tfoot > tr > td {
    border-bottom: var(--table-border);
    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 12px;
      background-image: linear-gradient(0deg, var(--linear-gradient));
    }
  }
}

// Expand and Draftline

.fds-c-datagrid__expand {
  > td {
    z-index: 100;
  }
}

.fds-c-datagrid__expand-content {
  position: sticky !important;
  left: 0;
  margin: 0 -1px;
  border: 1px solid var(--color--pale-1);
  border-style: solid none;
  // box-shadow: 0 2px 21px 0px rgba(0, 0, 0, 0.2) inset;
  box-shadow: 1px 1px 10px 0px rgba(0, 0, 0, 0.2) inset;
  background: var(--color--white);
}

.fds-c-datagrid__draftline {
  border-top: 1px solid red;
}
</style>>
