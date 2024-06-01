<template>
  <node-view-wrapper class="c-hightlighter" :class="{'c-hightlighter--fullscreen': fullScreen}" @click.native="click">
    <div contenteditable="false" class="c-hightlighter__toolbar">
      <div class="c-field v-radius-bottom-none">
        <Selector :options="options" v-model="selectedLanguage" class="c-hightlighter__selector" />
        <button class="c-hightlighter__button c-action" @click="toggleCodeView" v-if="isRunable">{{ showCodeView ? 'Hide code' : 'Show code' }}</button>
        <button class="c-hightlighter__button c-action" @click="fullScreen = !fullScreen">{{ fullScreen ? 'Full screen exit' : 'Full screen' }}</button>
      </div>
    </div>
    <pre v-show="!isRunable || showCodeView" class="c-hightlighter__hljs hljs" :class="{'c-hightlighter__hljs--runnable': isRunable }"><code><node-view-content /></code></pre>
    <!-- TODO: Refactor node-view-content as custom to fix the nowrap tiptap limitation for codeblocks-->
    <div ref="runner" v-show="isRunable" class="c-hightlighter__runner" contenteditable="false">
      <div v-if="errors.length > 0"><pre class="c-hightlighter__error" v-for="error in errors"><code>{{ error }}</code></pre></div>
      <div v-if="warnings.length > 0"><pre class="c-hightlighter__warning" v-for="warn in warnings"><code>{{ warn }}</code></pre></div>
      <div class="c-hightlighter__runner__contents" ref="mounter"/>
    </div>

  </node-view-wrapper>
</template>

<script>
import APP from '#services/APP'
import Vue from 'vue'
import { NodeViewContent, nodeViewProps, NodeViewWrapper } from '@tiptap/vue-2'

export default {
  name: 'Highligther',
  components: {
    NodeViewWrapper,
    NodeViewContent
  },

  props: nodeViewProps,

  data () {
    return {
      showCodeView: undefined,
      errors: [],
      warnings: [],
      fullScreen: false,
      languages: this.extension.options.lowlight.listLanguages()
    }
  },

  watch: {
    node: {
      handler(newValue) {
        this.run(true)
      },
      deep: true
    }
  },

  created () {
    this.lastContent = this.node.textContent
    window.Highligther = this
    document.addEventListener('vue:error', this.onError)
    document.addEventListener('vue:warn', this.onWarn)
    // document.addEventListener('showCodeView', this.onShowCodeView)
  },

  mounted () {
    this.editor.on('update', this.run)
    // this.onShowCodeView()
    this.run(true)
  },

  beforeDestroy () {
    this.editor.off('update', this.run)
    document.removeEventListener('vue:error', this.onError)
    document.removeEventListener('vue:warn', this.onWarn)
    // document.removeEventListener('showCodeView', this.onShowCodeView)
  },

  computed: {
    options () {
      return [
        { text: 'auto', value: null },
        { text: 'html', value: 'html' },
        { text: 'ruby', value: 'ruby' },
        { text: 'javascript', value: 'javascript' },
        { text: 'json', value: 'json' },
        { text: 'vue', value: 'vue' },
        { text: 'bash', value: 'bash' }
        // ...this.languages.map(language => ({text: language, value: language}))
      ]
    },
    selectedLanguage: {
      get () {
        return this.node.attrs.language
      },
      set (language) {
        this.updateAttributes({ language })
        this.run(true)
      }
    },
    isHTML () {
      return this.selectedLanguage === 'html'
    },
    isWebcomponent () {
      return this.selectedLanguage === 'vue' || this.selectedLanguage === 'webcomponent' // Review
    },
    isRunable () {
      return this.isHTML || this.isWebcomponent
    }
  },

  methods: {
    /*
    onShowCodeView () {
      this.showCodeView = localStorage.getItem('showCodeView') === 'true'
    },
    */
    toggleCodeView () {
      // localStorage.setItem('showCodeView', !this.showCodeView)
      // document.dispatchEvent(new Event('showCodeView'))
      this.showCodeView = !this.showCodeView
    },
    onError (event) {
      const { error, vm, info } = event.detail
      if (vm && vm.closestComponent && vm.closestComponent('Runner') === this.lastRunner) {
        this.destroyRunner()
        this.errors.push(error.toString())
      }
    },
    onWarn (event) {
      const { message, vm, trace } = event.detail
      if (vm && vm.closestComponent && vm.closestComponent('Runner') === this.lastRunner) {
        this.destroyRunner()
        this.warnings.push(message.toString())
      }
    },
    click () {
      window.Highligther = this
    },
    async run (force) {
      const content = this.node.textContent
      if (force !== true && content === this.lastContent) return
      this.lastContent = content
      this.destroyRunner()
      this.errors = []
      this.warnings = []
      await this.$nextTick()
      if (this.isHTML) {
        return this.runWebcomponent()
      } else if (this.isWebcomponent) {
        return this.runWebcomponent()
      }
    },
    /*
    runHTML () {
      const self = this
      const content = this.node.textContent
      const template = this.lastContent = content
      const base = document.createElement('div')
      this.$refs.mounter.appendChild(base)
      const lastRunner = new Vue({
        name: 'Runner',
        template: '<div>' + template + '</div>',
        data: {},
        created () {
          self.lastRunner = this
        },
        el: base
      })
    },
    */
    destroyRunner () {
      if (this.lastRunner) {
        // this.lastRunner.$destroy() // TODO: REview weird error
        this.$refs.mounter.textContent = ''
      }
    },
    parseWebcomponent (webcomponent) {
      try {
        const webcomponentRegex = /(?:<template>\s*((?:.|\n)*)\s*<\/template>)\s*(?:<script>\s*((?:.|\n)*)\s*<\/script>)?\s*(?:<style>\s*((?:.|\n)*)\s*<\/style>)?\s*/gm
        const [, template, js, css] = webcomponentRegex.exec(webcomponent)
        return { template, js, css }
      } catch (error) {
        throw new Error('Invalid Webcomponent format')
      }
    },
    runWebcomponent () {
      const self = this
      const content = this.node.textContent

      try {
        const webcomponent = this.lastContent = content
        const { template, js, css } = this.parseWebcomponent(webcomponent)
        const base = document.createElement('div')
        const style = document.createElement('style')
        style.type = 'text/css'
        style.textContent = css
        const component = document.createElement('component')
        base.appendChild(style)
        base.appendChild(component)
        this.$refs.mounter.appendChild(base)

        const evalConfig = js ? eval(js) : {} // eslint-disable-line no-eval
        const config = evalConfig.data ? evalConfig : { data: evalConfig }
        Object.assign(config.data, {
          APP,
          window
        })

        const lastRunner = new Vue(Object.assign({}, config, {
          name: 'Runner',
          template: '<div>' + template + '</div>',
          created () {
            self.lastRunner = this
            if (typeof config.created === 'function') config.created.call(this)
          },
          el: component
        }))
      } catch (error) {
        error.message = 'Highligther Error creating runner: ' + error.message
        this.errors.push(error.toString())
        console.error(error)
      }
    }
  }
}
</script>

<style lang="scss">
.c-hightlighter {
  position: relative;
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  &.c-hightlighter--fullscreen {
    position: fixed;
    z-index: 1;
    height: auto;
    width: auto;
    top: 0;
    left: 0;
    bottom: 0;
    padding: var(--spacing-m) 0 0;
    right: 0;
    margin: 0;
    background-color: var(--color--light-3);
    .c-hightlighter__toolbar {
      padding-right: 6px;
    }
    .c-hightlighter__runner {
      max-height: none;
    }
  }
  .c-emergent__modal-overlay {
    position: static;
    padding: 20px;
  }
}
.c-hightlighter__toolbar {
  margin-right: var(--spacing-s);
  justify-content: flex-end;
  display: flex;
  margin-bottom: -1px;
}

.c-hightlighter__runner {
  width: 100%;
  margin: 0 0 21px;
  border: 1px solid var(--color--pale-1);
  border-width: 1px 1px 1px 1px;
  border-radius: 0 0 var(--border-radius) var(--border-radius);
  background-color: var(--color--white);
  flex-grow: 1;
  min-height: 0;
  height: auto;
  margin: 0;
  max-height: 700px;
  display: flex;
  flex-direction: column;
  overflow: auto;
}
.c-hightlighter__runner__contents {
  margin: 20px;
  min-height: 0;
  max-height: 100%;
}
.c-hightlighter__error, .c-hightlighter__warning {
  padding: 12px;
  margin: 0 0 18px;
  border-radius: var(--border-radius);
  box-shadow: 0px 8px 7px -9px #6a6a6a;
}
.c-hightlighter__error {
  color: #d03a3a;
  background-color: #ffd8d8;
  border: 1px solid #d03a3a;
}
.c-hightlighter__warning {
  color: #e4aa00;
  background-color: #fff5d8;
  border: 1px solid #e4aa00;
}
.c-hightlighter__hljs {
  padding: 16px 18px;
  border-radius: var(--border-radius);
  box-shadow: 0 0 9px 0px rgb(0 0 0 / 43%) inset;
  border: 1px solid var(--color--pale-1);
  max-height: 500px;
  overflow: auto;
}
.c-hightlighter__hljs--runnable {
  padding: 16px;
  border-radius: var(--border-radius) var(--border-radius) 0 0;
  margin: 0;
}

// Dark mode
.--darkmode {
  .c-hightlighter__runner {
    background-color: var(--color--dark-3);
    color: var(--color--pale-2);
    border: var(--color--black);
  }
}
</style>
