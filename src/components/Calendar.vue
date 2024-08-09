<template>
  <div class="fds-c-calendar">
    <table>
      <thead>
        <tr>
          <td colspan="8">{{ calendar.selector.toLocaleString('default', { month: 'long' }).capitalize() }} {{ year }}</td>
        </tr>
        <tr>
          <th>Wº</th>
          <th v-for="weekDay in calendar.weekDays" :key="weekDay">{{ ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][weekDay] }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="week in calendar" :key="week.weekNumber">
          <th>{{ week.weekNumber }}</th>
          <td
            v-for="weekDay in week.days"
            :key="weekDay.toString()"
            :active="isSelected(weekDay)"
            :class="{'--weekend': weekDay.getUTCDay() === 0 || weekDay.getUTCDay() === 6}"
          >
            <button type="button" class="fds-c-action">{{ weekDay.getUTCDate() }}</button>
            <template v-for="selection in selections">
              <div v-if="isInSelection(weekDay, selection)">{{ selection.name }}</div>
            </template>
          </td>
        </tr>
      </tbody>
      <tfoot>
        <td colspan="8"></td>
      </tfoot>
    </table>
    <div class="fds-c-timeline">
      <template v-for="selection in selections">
        <div class="fds-c-timeline__info">{{ calendar.selector.toLocaleString('default', { month: 'long' }).capitalize() }} {{ year }} {{ selection.name }}</div>
        <div class="fds-c-timeline__selection">
          <div class="fds-c-timeline__week" v-for="week in calendar" :key="week.weekNumber">
            <div
              v-for="weekDay in week.days"
              :key="weekDay.toString()"
              :active="isInSelection(weekDay, selection)"
              first
              :dayNumber="weekDay.getUTCDay()"
              class="fds-c-timeline__day"
            >
              <button type="button" class="fds-c-action">{{ weekDay.getUTCDate() }}</button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Calendar',

  props: {
  },

  data: () => ({
    mondays: true,
    year: 2024,
    month: 2,
    dayNames: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    selections: [
      {
        name: 'one',
        start: new Date(2024, 2, 27),
        end: new Date(2024, 2, 29, 24),
        pattern: '* * * * *'
      }, {
        name: 'two',
        start: new Date(2024, 2, 2),
        end: new Date(2024, 2, 7, 24)
      }, {
        name: 'three',
        start: new Date(2024, 2, 3),
        end: new Date(2024, 2, 4, 24)
      }, {
        name: 'four',
        start: new Date(2024, 2, 18),
        end: new Date(2024, 2, 18, 24)
      }
    ]
  }),

  created() {
    window.Calendar = this
  },

  mounted() {
  },

  beforeDestroy() {
  },
  computed: {
    calendar() {
      return Date.getCalendar(this.year, this.month, this.mondays ? 1 : 0)
    }
  },

  methods: {
    isInSelection(date, selection) {
      return date.getTime() >= selection.start.getTime() && date.getTime() <= selection.end.getTime()
    },
    isSelected(date) {
      return this.selections.some(selection => this.isInSelection(date, selection))
    }
  }
}
</script>

<style lang="scss">

.fds-c-calendar {
  width: 280px;
  padding: 12px;
  border: 1px solid var(--color--pale-1);
  > table {
    border-spacing: 0;
    td, th {
      padding: 0;
      text-align: center;
      border: 1px solid transparent;
      vertical-align: top;
      white-space: break-spaces;
      > button {
        width: 100%;
        justify-content: center;
        border-radius: 0;
      }
    }
    th, td > button {
      padding: 3px 6px;
    }
    td.--weekend {
      background-color: var(--color--light-2);
    }
    td[active] {
      border-radius: 0;
      border: 1px solid var(--color--primary);
      /*
      & + td[active] {
        border-radius: 0px;
      }
      */
      &:nth-child(1 of td[active]):nth-last-child(1 of td[active]) {
        // border-radius: 10px;
      }
      &:nth-last-child(1 of td[active]){
        // border-radius: 0 10px 10px 0;
      }
      &:nth-child(1 of td[active]){
        // border-radius: 10px 0 0 10px;
      }
    }
    tbody tr {
      cursor: pointer;
      &:hover {
        background-color: var(--color--light-2);
      }
    }
  }
}

.fds-c-timeline {
  border: 1px solid black;
}

.fds-c-timeline__info {
  background-color: grey;
}
.fds-c-timeline__selection {
  max-width: 200px;
}

.fds-c-timeline__week {
  display: inline;
}

.fds-c-timeline__day {
  display: inline;
  &[dayNumber="0"], &[dayNumber="6"] {
    background-color: var(--color--light-2);
  }
  &[active] {
    border-radius: 0;
    border: 1px solid var(--color--primary);
    /*
    & + td[active] {
      border-radius: 0px;
    }
    */
    &:nth-child(1 of [active]):nth-last-child(1 of [active]) {
      border-radius: 10px;
    }
    &:nth-last-child(1 of [active]){
      border-radius: 0 10px 10px 0;
    }
    &:nth-child(1 of [active]){
      border-radius: 10px 0 0 10px;
    }
  }
}
</style>
