<template>
  <tr
    class="fds-c-draggable__item fds-c-datagrid__row"
    :class="{'fds-c-datagrid__row--selected': selected }"
    tabindex="0"
    :key="record.uid"
  >
    <template v-for="(col, index) in cols">
      <td v-if="col.col" v-bind="colBind(col)">
        <div v-if="record[col.key + 'HTML']" class="fds-c-datagrid__cell fds-c-datagrid__cell--html" v-html="record[col.key + 'HTML']"></div>
        <div v-else class="fds-c-datagrid__cell">
          <slot name="cell" v-bind="{ record, col }">
            <div v-if="col.key === '$'">
              <span v-if="sortable" class="fds-c-draggable__handler fds-c-draggable__handler--grabber"></span>
              <input v-if="selectable" type="checkbox" class="fds-c-checkbox" :checked="selected" @input="$emit('select', record)">
            </div>
            <template v-else>{{ record[col.key] }}</template>
          </slot>
        </div>
      </td>
    </template>
  </tr>
</template>

<script>

import Vue from 'vue'

export default {
  name: 'FrontboardDatagridRecord',

  props: {
    record: { type: Object },
    cols: { type: Array },
    sortable: { type: Boolean },
    selectable: { type: Boolean},
    selected: { type: Boolean }
  },

  methods: {
    colBind(col) {
      const index = this.cols.indexOf(col)
      return {
        style: {
          left: col.sticky === 'left' ? (this.cols.slice(0, index).reduce((acumulator, col) => acumulator + col.size, 0) + 'px') : 'unset',
          right: col.sticky === 'right' ? (this.cols.slice(index + 1).reduce((acumulator, col) => acumulator + col.size, 0) + 'px') : 'unset'
        },
        class: col.sticky ? ('--sticky-' + col.sticky) : '',
        key: col.key
      }
    }
  }
}
</script>
