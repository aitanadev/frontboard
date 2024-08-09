<template>
  <div v-if="!isHidden" class="--ds fds-c-frontboard" :class="{'v-darkmode': darkModeActive}"><!-- remove --darkmode class -->
    <div class="fds-c-frontboard__toolbar v-darkmode">
      <div>
        <span class="fds-c-frontboard__logo"><span>🦦</span> Frontboard <i class="fi fi-br-check"></i></span>
        <!-- <span class="fds-c-frontboard__title">{{ title }}</span> -->
      </div>
      <div>
        <div class="fds-c-frontboard__darkmode" @click="darkmodeToggle"><span v-if="darkModeActive"class="fi fi-rs-toggle-on"></span><span v-else class="fi fi-rs-toggle-off"></span>Dark mode</div>
        <div class="fds-c-frontboard__palette" @click="palette.toggle()"><span v-if="palette.active"class="fi fi-rs-toggle-on"></span><span v-else class="fi fi-rs-toggle-off"></span>Palette</div>
        <Selector v-model="APP.language" :options="['ES','EN']" class="v-darkmode" />
        <div class="fds-c-frontboard__exit" @click="exit">Exit</div>
      </div>
    </div>
    <div class="fds-c-frontboard__toolbar fds-c-frontboard__toolbar--secondary v-darkmode">
      <div class="fds-c-frontboard__menu">
        <div v-for="route in localRoutes" class="fds-c-action" :class="{'t-primary': route.isActive}" @click="load(route)">{{ route.label }}</div>
        <!-- <Selector class="fds-c-frontboard__selector-menu" :value="currentRoute" @input="load" use-object multilevel :options="localRoutes" optionText="label" optionValue="path"/> -->
      </div>
      <div>
        <button class="fds-c-action v-semi" @click="APP.StaticDB.save()" type="button">Save staticDB</button>
      </div>
    </div>
    <div class="fds-c-frontboard__body">
      <component v-if="currentRoute && localRoutes.includes(currentRoute)" :is="currentRoute.params.component" :key="currentRoute.path"/>
    </div>
    <Palette/>
  </div>
</template>

<script>

import APP from '#services/APP'
import routes from '#config/routes'
import Axios from 'axios'
import FileLoader from '#views/FileLoader'

import Selector from '#components/selector/Selector'
import Appflow from '#views/Appflow'
import Palette from '#views/Palette'
import palette from '#services/palette'

export default {
  name: 'Frontboard',
  components: {
    Palette,
    FileLoader,
    Selector,
    Appflow
  },
  data: () => ({
    palette,
    isHidden: false,
    darkModeActive: localStorage.getItem('darkmode') === 'true'
  }),
  created () {
    palette.darkmode = this.darkModeActive
  },
  computed: {
    localRoutes () {
      return routes.main
    },
    title () {
      return this.router.current ? this.router.current.label : ''
    },
    currentRoute() {
      return this.localRoutes.find(route => route.isActive)
    }
  },
  methods: {
    load(route) {
      route.load(true)
    },
    exit() {
      this.router.exit()
      this.isHidden = true
    },
    darkmodeToggle () {
      this.darkModeActive = !this.darkModeActive
      palette.darkmode = this.darkModeActive
      localStorage.setItem('darkmode', this.darkModeActive)
    }
  }
}

</script>

<style lang="scss">
.fds-c-frontboard {
  display: flex;
  flex-direction: column;
  position: fixed;
  z-index: 100;
  inset: 0;
  background-color: var(--color--white);
}

.fds-c-frontboard__toolbar {
  color: var(--color--pale-2);
  background-color: var(--color--light-2);
  padding: var(--spacing-m) var(--spacing-l);
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: var(--spacing-m);
  > div {
    display: flex;
    align-items: center;
    gap: var(--spacing-s);
  }
  &.fds-c-frontboard__toolbar--secondary {
    background-color: var(--color--secondary--white);
  }
  .fds-c-frontboard__menu {

    // padding: var(--spacing-m) var(--spacing-xxl);
    align-items: stretch;
    display: flex;
    margin: calc(-1* var(--spacing-m)) 0;
    gap: 0;
    > .fds-c-action {
      border-style: none;
      border-radius: 0;
      padding: var(--spacing-m) var(--spacing-xl);
      color: var(--color--dark-1);
      background-color: transparent;
      &:hover {
        background-color: var(--color--dark-2);
      }
    }
    /*
    > .fds-c-field {
      font-size: var(--font-size--l);
      font-weight: var(--font-weight--semibold);
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      > .fds-c-action {
        align-content: center;
        padding: var(--spacing-m) var(--spacing-xl);

        color: var(--color);
        background-color: var(--color--dark-3);
        &:hover {
          background-color: var(--color--dark-2);
        }
      }
    }
    */
  }
}

.fds-c-frontboard__logo {
  display: flex;
  align-items: center;
  font-weight: var(--font-weight--bold);
  font-size: 24px;
  gap: 0.5em;
  span {
    background-color: rgba(137, 137, 137, 0.05);
    border-radius: 100%;
    font-size: 30px;
    display: none;
  }
}

.fds-c-frontboard__title {
  font-size: 12px;
  margin-left: 12px;
  margin-top: 10px;
}

.fds-c-frontboard__exit {
  padding: 6px 12px;
  border-radius: 3px;
  cursor: pointer;
}

.fds-c-frontboard__darkmode, .fds-c-frontboard__palette {
  cursor: pointer;
}

.fds-c-frontboard__body {
  flex-grow: 1;
  overflow: auto;
  position: relative;
  display: flex;
  border-top: 1px solid var(--color--light-1);
}

.fds-c-drawer {
  position: relative;
  width: 220px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: var(--spacing-l) 0;
  flex-shrink: 0;
  border-right: 1px solid var(--color--light-1);
  overflow: auto;
  background-color: var(--color--light-2);
}

.fds-c-drawer__option {
  &.active {
  }
}

.fds-c-drawer__option-handler {
  padding: var(--spacing-l);
  // cursor: pointer;
  font-weight: var(--font-weight--bold);
  font-size: var(--font-size--l);
  &:hover {
    // background-color: var(--color--light-1);
  }
  &.fds-c-drawer__option-handler--single {
    cursor: pointer;
    &:hover {
      background-color: var(--color--light-1);
    }
  }
}

.fds-c-drawer__option.active {
  .fds-c-drawer__option-handler {
    font-weight: var(--font-weight--bold);
    background-color: var(--color--dark-1);
    color: var(--color--light-2);
  }
}

.fds-c-drawer__options {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 3px 11px;
}

.fds-c-drawer__options-item {
  font-size: var(--font-size--m);
  padding: var(--spacing-xs) var(--spacing-m);
  cursor: pointer;
  border-radius: var(--border-radius);
  text-overflow: ellipsis;
  overflow: hidden;
  &:hover {
    background-color: var(--color--light-1);
  }
  &.active {
    background-color: var(--color--dark-1);
    color: var(--color--light-2);
    font-weight: var(--font-weight--bold);
  }
}

</style>
