import Vue from 'vue'
import i18n from '#services/i18n'

Vue.config.productionTip = false
Vue.config.devtools = false

Vue.mixin({
  data: function() {
return {
    i18n
  }
},
  methods: {
    closestComponent (Component) {
      const componentName = typeof Component === 'string' ? Component : Component.name
      let closest = this
      while (closest && closest.$options.name !== componentName) {
        closest = closest.$parent
      }
      return closest
    }
  }
})

Vue.config.errorHandler = function (error, vm, info) {
  document.dispatchEvent(new CustomEvent('vue:error', {bubbles: true, detail: { error, vm, info }}))
  const frontboardActive = window.Frontboard && !window.Frontboard.isHidden
  const componentName = vm?.$options?.name
  error.message = 'Vue error' + (componentName ? ' at ' + componentName : '') + ', ' + error.message
  console.error(error, {error, vm, info})
}

Vue.config.warnHandler = function (message, vm, trace) {
  if (!Vue.config.silent) {
    const componentName = vm?.$options?.name
    message = 'Vue warning' + (componentName ? ' at ' + componentName : '') + ', ' + message
    document.dispatchEvent(new CustomEvent('vue:warn', {bubbles: true, detail: { message, vm, trace}}))
    console.warn(message, {message, vm, trace})
  }
}

// Vue.directive('focus', {
//   inserted: function (el) {
//     el.focus()
//   }
// })
