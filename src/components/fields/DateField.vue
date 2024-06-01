<template>
  <div ref="emergentHook" class="c-date-field">
    <div class="c-field" :hint="currentDate.toString()">
      <label v-if="label">{{ label }}</label>
      <label><span class="fi fi-rs-calendar"></span></label>
      <input
        type="number"
        class="c-input c-date-field__day"
        v-model="day"
        autocomplete="off"
        min="0"
        max="32"
        maxlength="2"
        step="1"
        @focus="focus"
        @input="onChange"
      /><input
        type="number"
        class="c-input c-date-field__month"
        v-model="month"
        autocomplete="off"
        min="0"
        max="13"
        maxlength="2"
        step="1"
        @focus="focus"
        @input="onChange"
      /><input
        type="number"
        class="c-input c-date-field__year"
        v-model="year"
        autocomplete="off"
        min="0"
        maxlength="4"
        step="1"
        @focus="focus"
        @input="onChange"
      />
      <button v-if="clearable" type="button" class="c-action" @click="$emit('input', undefined)"><span class="fi fi-rr-cross-small"></span></button>
      <!-- <input type="checkbox" v-model="mondays"> --->
      <!--
      <label><span class="fi fi-rs-clock"></span></label>
      <input
        type="number"
        class="c-input c-date-field__hours"
        v-model="hours"
        autocomplete="off"
        min="-1"
        max="24"
        maxlength="2"
        step="1"
        @focus="focus"
        @input="onChange"
      />
      <input
        type="number"
        class="c-input c-date-field__minutes"
        v-model="minutes"
        autocomplete="off"
        min="-1"
        max="60"
        maxlength="2"
        step="1"
        @focus="focus"
        @input="onChange"
      />
      -->
    </div>
    <div ref="emergent" class="c-emergent c-calendar" v-if="calendar">
      <table v-if="emergent.opened">
        <thead>
          <tr>
            <td colspan="8">{{ calendar.selector.toLocaleString('default', { month: 'long' }).capitalize() }} {{ year }}</td>
          </tr>
          <tr>
            <th>Wº</th>
            <th v-for="weekDay in calendar.weekDays" :key="weekDay">{{ ['Do', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][weekDay] }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="week in calendar" :key="week.weekNumber">
            <th>{{ week.weekNumber }}</th>
            <td
              v-for="weekDay in week.days"
              :key="weekDay.toString()"
              :active="weekDay.getUTCDate() === day && (weekDay.getUTCMonth() + 1) === month"
              :class="{'--weekend': weekDay.getUTCDay() === 0 || weekDay.getUTCDay() === 6}"
              @click="selectDate(weekDay)"
            >
              <button type="button" class="c-action">{{ weekDay.getUTCDate() }}</button>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <td colspan="8"><div>{{ currentDate }}</div><div>{{ lapse }}</div></td>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script>
import Emergent from '#services/Emergent'

export default {
  name: 'DateField',

  props: {
    value: { type: Date },
    label: { type: String },
    clearable: { type: Boolean }
  },

  data: () => ({
    currentDate: undefined,
    mondays: true,
    lapse: 0,
    emergent: new Emergent()
  }),

  created() {
    window.DateField = this
    this.currentDate = this.value || new Date()
    this.lapseInterval = setInterval(this.setLapse, 1000)
  },

  mounted() {
    const self = this
    this.emergent.sync({
      element: this.$refs.emergent,
      hook: this.$refs.emergentHook,
      config: {
        spacing: 2,
        inheritWidth: false
        // automaticMouseHandling: true
      },
      onOpen () {
        self.$emit('open')
      },
      onClose () {
        self.$emit('close')
      }
    })
  },

  beforeDestroy() {
    clearInterval(this.lapseInterval)
  },
  computed: {
    day: {
      get() {
        return this.currentDate.getUTCDate()
      },
      set(value) {
        if (value !== '') this.currentDate.setUTCDate(value)
      }
    },
    month: {
      get() {
        return this.currentDate.getUTCMonth() + 1
      },
      set(value) {
        if (value !== '') this.currentDate.setUTCMonth(value - 1)
      }
    },
    year: {
      get() {
        return this.currentDate.getUTCFullYear()
      },
      set(value) {
        if (value !== '') this.currentDate.setUTCFullYear(value)
      }
    },
    hours: {
      get() {
        return this.currentDate.getUTCHours()
      },
      set(value) {
        if (value !== '') this.currentDate.setUTCHours(value)
      }
    },
    minutes: {
      get() {
        return this.currentDate.getUTCMinutes()
      },
      set(value) {
        if (value !== '') this.currentDate.setUTCMinutes(value)
      }
    },
    calendar() {
      return Date.getCalendar(this.year, this.month - 1, this.mondays ? 1 : 0)
    }
  },

  methods: {
    setLapse() {
      const diff = Math.abs(Date.now() - this.currentDate.getTime())
      const factors = {
        days: Math.floor(diff / 1000 / 60 / 60 / 24), // TODO: add months and years grouping
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      }

      const textPieces = []
      if (factors.days) textPieces.push(factors.days + ' days')
      if (factors.hours) textPieces.push(factors.hours + ' hours')
      if (factors.minutes) textPieces.push(factors.minutes + ' minutes')
      if (factors.seconds) textPieces.push(factors.seconds + ' seconds')

      this.lapse = textPieces.join(', ')
    },
    focus() {
      this.emergent.open()
    },
    selectDate(date) {
      this.currentDate = date
      this.onChange()
      this.$el.dispatchEvent(new Event('input', { bubbles: true }))
    },
    onChange() {
      const {day, month, year, hours, minutes} = this
      const currentDate = this.currentDate = new Date(this.currentDate.getTime())
      console.log('date text:', currentDate, {day, month, year, hours, minutes})
      this.$emit('input', currentDate)
      // this.$forceUpdate()
    }
  }
}
</script>

<style lang="scss">
.c-date-field {
  display: flex;
}
.c-date-field__day {
  width: 40px !important;
}
.c-date-field__month {
  width: 40px !important;
}
.c-date-field__year {
  width: 60px !important;
}
.c-date-field__hours {
  width: 40px !important;
}
.c-date-field__minutes {
  width: 40px !important;
}
</style>
