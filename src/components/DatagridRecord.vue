<template>
  <tr
    class="c-draggable__item c-datagrid__row"
    :class="{'c-datagrid__row--selected': selected }"
    tabindex="0"
  >
    <template v-for="(col, index) in cols">
      <!-- review v-if col.col, move to upper scope -->
      <td
        v-if="col.col"
        :style="{
          left: col.sticky === 'left' ? (cols.slice(0, index).reduce((acumulator, col) => acumulator + col.size, 0) + 'px') : 'unset',
          right: col.sticky === 'right' ? (cols.slice(index + 1).reduce((acumulator, col) => acumulator + col.size, 0) + 'px') : 'unset',
          // backgroundColor: record.tone ? `var(--color--${record.tone.name}--light-3)` : undefined
        }"
        :class="col.sticky ? ('--sticky-'+ col.sticky) : ''"
        :key="col.key"
      >
        <!-- v-bind="col.attributes" -->
        <div class="c-datagrid__cell">
          <slot :name="'cell.' + col.key" v-bind="{ record, col }">
            <div v-if="col.key === '$'">
              <span v-if="sortable" class="c-draggable__handler c-draggable__handler--grabber"></span>
              <input v-if="selectable" type="checkbox" class="c-checkbox" :checked="selected" @click="$emit('select', record)">
            </div>
            <slot v-else name="cell" v-bind="{ record, col }"><div v-html="record[col.key]"></div></slot>
          </slot>
        </div>
      </td>
    </template>
  </tr>
</template>

<script>

import Vue from 'vue'

export default {
  name: 'DatagridRecord',

  props: {
    record: { type: Object },
    cols: { type: Array },
    sortable: { type: Boolean },
    selectable: { type: Boolean},
    selected: { type: Boolean }
  }
}
</script>
