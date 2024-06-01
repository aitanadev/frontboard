<template>
  <div v-if="!isHidden" class="--ds c-frontboard" :class="{'v-darkmode': darkModeActive}"><!-- remove --darkmode class -->
    <div class="c-frontboard__toolbar">
      <div>
        <span class="c-frontboard__logo"><span>🦦</span> Frontboard <i class="fi fi-rr-check"></i></span>
        <span class="c-frontboard__title">{{ title }}</span>
      </div>
      <div>
        <div class="c-frontboard__darkmode" @click="darkmodeToggle">
          <span v-if="darkModeActive"class="fi fi-rs-toggle-on"></span>
          <span v-else class="fi fi-rs-toggle-off"></span>
          Dark mode
        </div>
        <div class="c-frontboard__darkmode" @click="palette.toggle()">
          <span v-if="palette.active"class="fi fi-rs-toggle-on"></span>
          <span v-else class="fi fi-rs-toggle-off"></span>
          Palette
        </div>
        <div class="c-frontboard__exit" @click="exit">Exit</div>
      </div>
    </div>
    <div class="c-frontboard__main">
      <div class="c-frontboard__main-contents">
        <div class="c-frontboard__menu">
          <div v-for="option in options">
            <div
              class="c-frontboard__option__handler"
              :class="{'active': !option.options && currentRoute && option === currentRoute}"
              @click="option.options ? option.opened = !option.opened : load(option)"
            >{{ option.name }}</div>
            <div class="c-frontboard__options" v-if="option.opened">
              <div
                v-for="suboption in option.options"
                class="c-frontboard__options__item"
                :class="{'active': currentRoute && suboption === currentRoute}"
                @click="load(suboption)"
              >{{ suboption.name }}</div>
            </div>
          </div>
        </div>
        <div class="c-frontboard__body"><component v-if="currentRoute" :is="currentRoute.component" v-bind="currentRoute.attrs" :key="currentRoute.path"/></div>
      </div>
    </div>
    <Palette/>
  </div>
</template>

<script>

import Axios from 'axios'
import FileLoader from 'views/richEditor/FileLoader'
import ComponentViewer from 'views/ComponentViewer'
import StaticDB from 'views/StaticDB'
import Palette from 'views/Palette'
import palette from '#services/palette'

const API = Axios.create({ baseURL: 'http://localhost:3035/api' })

function getContextRoutes (base, context, component) {
  // console.log('---> context key', base, context.keys())
  return context.keys().map(contextPath => {
    const path = [base, contextPath].pathJoin()
    const name = contextPath.split('/').slice(-1)[0].replace(/\.[^.]*$/, '').toSpaces()
    const route = {
      name,
      path,
      component,
      attrs: {
        file: {
          name,
          path,
          import: async () => {
            // console.log('----> loading contextPath', contextPath, path)
            const module = await context(contextPath)
            return typeof module === 'string' ? module : module.default
          }
        }
      }
    }
    routes.push(route)
    return route
  })
}

const routes = []
const docsRoutes = getContextRoutes('data/md', import.meta.webpackContext('@/data/md', { recursive: true, regExp: /\.md$/, mode: 'lazy' }), FileLoader)
// const componentsRoutes = getContextRoutes('src/components', import.meta.webpackContext('@/src/components?raw', { recursive: true, regExp: /\.vue$/, mode: 'lazy' }), ComponentViewer)
// const snapshotsRoutes = getContextRoutes('tests', require.context('@/tests', true, /\.snap$/, 'lazy'), FileLoader)

const staticDBRoute = {
  name: 'Appflow',
  path: 'data',
  component: StaticDB
}
routes.push(staticDBRoute)

const whiteBoardRoute = {
  name: 'Whiteboard',
  path: '.whiteboard.md',
  component: FileLoader,
  attrs: {
    file: {
      name: 'Whiteboard',
      path: '.whiteboard.md',
      import: async () => await import('@/src/views/RichEditor/lib/whiteboard.md.example').then(module => module.default)
    }
  }
}
routes.push(whiteBoardRoute)

const options = [
  staticDBRoute,
  {
    name: 'Docs',
    opened: false,
    options: docsRoutes
  },
  /*
  {
    name: 'Components',
    opened: false,
    options: componentsRoutes
  },
  */
  whiteBoardRoute
]

export default {
  name: 'Frontboard',
  components: {
    Palette,
    FileLoader
  },
  props: {
    path: { type: String, default: '.whiteboard.md' }
  },
  data: () => ({
    palette,
    routes,
    options,
    isHidden: false,
    currentRoute: undefined,
    darkModeActive: localStorage.getItem('darkmode') === 'true'
  }),
  created () {
    palette.darkmode = this.darkModeActive
  },
  mounted () {
    const route = this.routes.find(route => route.path === this.path)
    if (route) {
      this.load(route)
    } else {
      throw new Error('File not exist', this.path)
    }
  },
  computed: {
    title () {
      return this.currentRoute ? this.currentRoute.path : ''
    }
  },
  methods: {
    darkmodeToggle () {
      this.darkModeActive = !this.darkModeActive
      palette.darkmode = this.darkModeActive
      localStorage.setItem('darkmode', this.darkModeActive)
    },
    load (route) {
      const group = this.options.find(option => option.options && option.options.includes(route))
      if (group) {
        group.opened = true
      }
      if (window.history.pushState) {
        const newurl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?frontboard=' + route.path
        window.history.pushState({ path: newurl }, '', newurl)
      }
      this.currentRoute = route
    },
    toggle () {
      this.isHidden = !this.isHidden
    },
    exit () {
      this.isHidden = true
      if (history.pushState) {
        const newurl = window.location.protocol + '//' + window.location.host + window.location.pathname
        window.history.pushState({ path: newurl }, '', newurl)
      }
    }
  }
}

</script>

<style lang="scss">
.c-frontboard {
  display: flex;
  flex-direction: column;
  position: fixed;
  z-index: 100;
  inset: 0;
  background-color: var(--color--white);
}

.c-frontboard__toolbar {
  color: var(--color--pale-2);
  background-color: var(--color--dark-3);
  padding: 10px 13px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  // border-bottom: 1px solid var(--color--dark-3);
  > div {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.c-frontboard__logo {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 24px;
  gap: 0.5em;
  span {
    background-color: rgba(137, 137, 137, 0.05);
    border-radius: 100%;
    font-size: 30px;
    display: none;
  }
}

.c-frontboard__title {
  font-size: 12px;
  margin-left: 12px;
  margin-top: 10px;
}

.c-frontboard__exit {
  padding: 6px 12px;
  border-radius: 3px;
  cursor: pointer;
}

.c-frontboard__darkmode {
  cursor: pointer;
}

.c-frontboard__main {
  flex-grow: 1;
  position: relative;
}

.c-frontboard__main-contents {
  display: flex;
  position: absolute;
  inset: 0;
  background-color: var(--color--dark-2);
  @media (max-width: 576px) {
    flex-direction: column;
  }
}

.c-frontboard__menu {
  position: relative;
  width: 220px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 12px 0;
  flex-shrink: 0;
  // border-right: 1px solid var(--color--dark-3);
  overflow: auto;
  color: var(--color--pale-1) !important;
}

.c-frontboard__option__handler {
  padding: 10px 20px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  text-shadow: var(--text-shadow--dark);

  &.active {
    background-color: var(--color--pale-3);
    box-shadow: 2px 2px 7px -6px black inset;
  }
  &:hover {
    background-color: var(--color--dark-3);
    box-shadow: 2px 2px 7px -6px black inset;
  }
}

.c-frontboard__options {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 3px 11px;
}

.c-frontboard__options__item {
  font-size: 12px;
  padding: 10px 20px;
  cursor: pointer;
  font-weight: 600;
  border-radius: 3px;
  text-overflow: ellipsis;
  overflow: hidden;
  text-shadow: var(--text-shadow--dark);
  &.active {
    box-shadow: 2px 2px 7px -6px black inset;
    background-color: var(--color--dark-3);
  }
  &:hover {
    background-color: var(--color--pale-3);
    box-shadow: 2px 2px 7px -6px black inset;
  }
}

.c-frontboard__body {
  flex-grow: 1;
  overflow: auto;
  position: relative;
}
</style>
