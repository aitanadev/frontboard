/* eslint no-extend-native: 0 */
String.prototype.toCamelCase = function () {
  let upperize = false
  return this.toSpaces().split('').map((char) => {
    if (/ /.test(char)) {
      upperize = true
      return ''
    } else {
      if (upperize) {
        upperize = false
        return char.toUpperCase()
      } else {
        return char
      }
    }
  }).join('')
}

String.prototype.toKebabCase = function () {
  return this.toSpaces().toLowerCase().replaceAll(' ', '-')
}

String.prototype.toSnakeCase = function () {
  return this.toSpaces().toLowerCase().replaceAll(' ', '_')
}

String.prototype.toSpaces = function () {
  return this.split('').map((char, index, all) => {
    if (index === 0) {
      return char
    } else if (/_|-/.test(char)) {
      return ' '
    } else if (/[A-Z]/.test(char) && (index + 1) !== all.length) {
      const isBreak = /[a-z]/.test(all[index + 1]) || /[a-z]/.test(all[index - 1])
      const lowered = /[a-z]/.test(all[index + 1]) ? char.toLowerCase() : char
      return (isBreak ? ' ' : '') + lowered
    } else {
      return char
    }
  }).join('')
}

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1)
}

String.prototype.marker = function (text) {
  if (!text) return this
  if (!Array.isArray(text)) text = [text]
  const markerRegex = new RegExp(text.map(textItem => textItem.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&')).join('|'), 'ig')
  return this.replace(markerRegex, '<mark>$&</mark>')
}

String.prototype.isNumber = function () {
  return !Number.isNaN(Number(this))
}

Array.prototype.pathJoin = function () {
  return this.map(piece => piece.replace(/^.?\/+|\/+$/gm, '')).join('/')
}

Array.prototype.toReversed = Array.prototype.toReversed || function (callback) {
  const copy = [...this]
  return copy.reverse(callback)
}

Math.range = function(value, min = 0, max = 0) {
  return Math.min(Math.max(value, min), max)
}

Number.prototype.range = function(min, max) {
  return Math.range(this, min, max)
}

Date.prototype.getDatestamp = function() {
  const timestamp = this.getTime()
  return timestamp - (timestamp % (1000 * 60 * 60 * 24))
}

Date.prototype.getUTCWeek = function (weekZeroDay = Date.weekZeroDay) {
  const week = new Date(this)
  week.setUTCHours(0, 0, 0, 0)
  while (week.getUTCDay() !== weekZeroDay) {
    week.setUTCDate(week.getUTCDate() - 1)
  }
  return week
}

Date.prototype.getUTCFirstWeek = function (weekZeroDay = Date.weekZeroDay) {
  const firstWeek = this.getUTCWeek(weekZeroDay)
  firstWeek.setUTCMonth(0, 1)
  while (firstWeek.getUTCDay() !== weekZeroDay) {
    firstWeek.setUTCDate(firstWeek.getUTCDate() + 1)
  }
  return firstWeek
}

Date.prototype.getUTCWeekNumber = function (weekZeroDay = Date.weekZeroDay) {
  const week = this.getUTCWeek(weekZeroDay)
  const firstWeek = this.getUTCFirstWeek(weekZeroDay)
  const timeDiff = week.getTime() - firstWeek.getTime()
  const days = timeDiff / 1000 / 60 / 60 / 24
  return Math.floor(days / 7) + 1
}

Date.weekZeroDay = 0

// timeZone: 'UTC',
// timeZoneName: 'short'
Date.formats = {
  date: new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }),
  dateTime: new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }),
  dateTimeSeconds: new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }),
  time: new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  }),
  timeSeconds: new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

Date.prototype.getUTCDescriptors = function() {
  return {
    date: this.getUTCDate(),
    day: this.getUTCDay(),
    weekDate: this.getUTCWeek().getUTCDate(),
    weekNumber: this.getUTCWeekNumber(),
    firstWeekDate: this.getUTCFirstWeek().getUTCDate(),
    month: this.getUTCMonth(),
    monthDays: this.getUTCMonthDays(),
    fullYear: this.getUTCFullYear()
  }
}

Date.prototype.format = function(format = 'date') {
  return Date.formats[format].format(this)
}

Date.prototype.getUTCMonthDays = function() {
  const copy = new Date(this)
  copy.setUTCMonth(this.getUTCMonth() + 1)
  copy.setDate(0)
  return copy.getDate()
}

Date.getCalendar = function (_year, _month, weekZeroDay = Date.weekZeroDay) {
  const si = true
  const selector = new Date()
  _year = typeof _year === 'number' ? _year : selector.getUTCFullYear()
  _month = typeof _month === 'number' ? _month : selector.getUTCMonth()
  selector.setUTCHours(0, 0, 0, 0)
  selector.setUTCFullYear(_year, _month, 1)
  const month = selector.getUTCMonth()

  const calendar = selector.getUTCWeek(weekZeroDay)
  const weeks = []
  while (weeks.length === 0 || calendar.getUTCMonth() === month) {
    const week = {
      weekNumber: calendar.getUTCWeekNumber(weekZeroDay),
      days: []
    }
    for (let weekDay = 0; weekDay < 7; weekDay++) {
      week.days.push(new Date(calendar))
      calendar.setUTCDate(calendar.getUTCDate() + 1)
    }
    weeks.push(week)
  }

  weeks.selector = selector

  weeks.weekDays = weeks[0].days.map(day => day.getUTCDay())

  return weeks
}

RegExp.prototype.execBatch = function (string) {
  const regex = this
  const results = []
  while (true) {
    const result = regex.exec(string)
    if (!result) {
      break
    }
    results.push(result)
  }
  return results
}

Object.transform = function (object, handler) {
  const entries = Object.entries(object).map(([key, value]) => {
    const prop = handler({ key, value })
    return prop ? [prop.key, prop.value] : prop
  }).filter(prop => prop)
  return Object.fromEntries(entries)
}
