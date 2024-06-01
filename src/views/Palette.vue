<template>
  <!-- c-palette--full -->
  <div v-if="palette.active" class="c-palette">
    <div v-if="currentTab === 'CSSVars'" class="c-palette__section">
      <div class="c-scheme__header">
        <div class="c-scheme__title"><h2>CSS variables</h2></div>
      </div>

      <draggable tag="fieldset" class="c-fieldset c-palette__table c-dragable" draggable=".c-draggable__item" handle=".c-draggable__handler" :list="palette.baseCSSVars">
        <div class="c-fieldset__item c-draggable__item" v-for="cssVar in palette.baseCSSVars">
          <label><span class="c-draggable__handler c-draggable__handler--grabber"></span>{{ cssVar.name.toSpaces().capitalize() }}</label>
          <template v-if="cssVar.format === 'px'">
            <div class="c-field">
              <input type="number" class="c-input" v-model="cssVar.value" min="0" max="50">
              <input type="range" v-model="cssVar.value" min="0" max="50">
            </div>
          </template>
          <template v-else-if="cssVar.format === 'color'">
            <div class="c-input"><input type="color" v-model="cssVar.value"></div>
          </template>
          <template v-else>
            <div class="c-input"><input type="text" v-model="cssVar.value"></div>
          </template>
        </div>
      </draggable>
    </div>
    <div v-else-if="currentTab === 'Colors'" class="c-palette__section">
      <div class="c-scheme__header">
        <div class="c-scheme__title"><h2>Colors</h2></div>
      </div>

      <fieldset class="c-fieldset">
        <!-- <Selector useObject :options="palette.colors" multiple v-model="palette.colors" optionValue="name" optionText="name" /> -->
        <draggable tag="table" class="c-palette__table c-dragable" draggable=".c-draggable__item" handle=".c-draggable__handler" :list="palette.colors">
          <tr v-for="color in palette.colors" :key="color.uid" class="c-draggable__item">
            <td class="c-draggable__handler c-draggable__handler--grabber"></td>
            <td>
              <div class="c-field">
                <!-- <label>{{ color.name.capitalize() }}</label> -->
                <input type="text" class="c-input" v-model="color.name">
                <!-- <input type="checkbox" v-model="color.toned"> -->
                <!-- <input type="text" class="c-input" v-model="color.tone" :placeholder="color.name"> -->
                <input type="number" class="c-input" v-model="color.hue" min="0" max="360">
                <input type="range" v-model="color.hue" min="0" max="360">
                <input type="number"class="c-input" v-model="color.saturation" min="0" max="100">
                <input type="range" v-model="color.saturation" min="0" max="100">
                <input type="number" class="c-input" v-model="color.lightness" min="0" max="100">
                <input type="range" v-model="color.lightness" min="0" max="100">
              </div>
            </td>
            <td
              v-for="level in [90,80,70,60,50,40,30,20,10]"
              :style="{backgroundColor: 'color-mix(in srgb, var(--color-' + color.name + '), black '+ level + '%'}"
            ></td>
            <td></td>
            <td
              v-for="level in [0]"
              :style="{backgroundColor: 'color-mix(in srgb, var(--color-' + color.name + '), white '+ level + '%'}"
            ></td>
            <td></td>
            <td
              v-for="level in [10,20,30,40,50,60,70,80,90,95]"
              :style="{backgroundColor: 'color-mix(in srgb, var(--color-' + color.name + '), white '+ level + '%'}"
            ></td>
          </tr>
        </draggable>
        <button type="button" class="c-action t-primary" @click="palette.addColor()">Add color</button>
      </fieldset>
    </div>
    <div v-else-if="currentTab === 'Tones'" class="c-palette__section">
      <div class="c-scheme__header">
        <div class="c-scheme__title"><h2>Tones</h2></div>
      </div>
      <fieldset class="c-fieldset">
        <draggable tag="table" class="c-palette__table c-dragable" draggable=".c-draggable__item" handle=".c-draggable__handler" :list="palette.colorTones">
          <tr v-for="colorTone in palette.colorTones" :key="colorTone.uid" class="c-draggable__item">
            <td class="c-draggable__handler c-draggable__handler--grabber"></td>
            <td>
              <Selector useObject :options="palette.colors" v-model="colorTone.color" optionValue="name" optionText="name"/>
              <input type="text" class="c-input" v-model="colorTone.name">
            </td>
            <td
              v-for="colorShadow in palette.colorShadows"
              :style="`background-color: var(--color--${colorTone}${colorShadow.name !== 'default' ? '--' + colorShadow.name : ''})`"
            ></td>
          </tr>
          <tr slot="header">
            <td></td>
            <td></td>
            <td v-for="colorShadow in palette.colorShadows">{{ colorShadow.name }}</td>
          </tr>
        </draggable>
        <button type="button" class="c-action t-primary" @click="palette.addColorTone()">Add tone</button>
      </fieldset>
    </div>
    <div v-else-if="currentTab === 'Shadows'" class="c-palette__section">
      <div class="c-scheme__header">
        <div class="c-scheme__title"><h2>Shadows</h2></div>
      </div>

      <fieldset class="c-fieldset">
        <table class="c-palette__table">
          <tr>
            <td></td>
            <td v-for="colorTone in palette.colorTones">{{ colorTone.name }}</td>
          </tr>
          <tr v-for="colorShadow in palette.colorShadows">
            <td>
              <div class="c-field">
                <label>{{ colorShadow.name.capitalize() }}</label>
                <input type="number" class="c-input" v-model="colorShadow.hue" min="-360" max="360">
                <input type="range" v-model="colorShadow.hue" min="0" max="360">
                <input type="number"class="c-input" v-model="colorShadow.saturation" min="-100" max="100">
                <input type="range" v-model="colorShadow.saturation" min="-100" max="100">
                <input type="number" class="c-input" v-model="colorShadow.lightness" min="-100" max="100">
                <input type="range" v-model="colorShadow.lightness" min="-100" max="100">
              </div>
            </td>
            <td
              v-for="colorTone in palette.colorTones"
              :style="`background-color: var(--color--${colorTone}${colorShadow.name !== 'default' ? '--' + colorShadow.name : ''})`"
            ></td>
          </tr>
        </table>
      </fieldset>
    </div>
    <!--
    <div v-else-if="currentTab === 'Components'" class="c-palette__section">
      <div class="c-scheme__header">
        <div class="c-scheme__title">
          <h2>Components</h2>
        </div>
        <div class="c-scheme__toolbar">
        </div>
      </div>
      <fieldset class="c-fieldset">Components</fieldset>
    </div>
    -->
    <menu class="c-tabs c-tabs--bottom">
      <li><button type="button" class="c-action" @click="currentTab = 'CSSVars'" :active="currentTab === 'CSSVars'">CSS vars</button></li>
      <li><button type="button" class="c-action" @click="currentTab = 'Colors'" :active="currentTab === 'Colors'">Colors</button></li>
      <li><button type="button" class="c-action" @click="currentTab = 'Tones'" :active="currentTab === 'Tones'">Tones</button></li>
      <li><button type="button" class="c-action" @click="currentTab = 'Shadows'" :active="currentTab === 'Shadows'">Shadows</button></li>
      <!-- <li><button type="button" class="c-action" @click="currentTab = 'Components'" :active="currentTab === 'Components'">Components</button></li> -->
    </menu>
  </div>
</template>

<script>

import APP from '#services/APP'
import StaticDB from '#services/StaticDB'
import palette from '#services/palette'
import draggable from 'vuedraggable'

export default {
  name: 'Palette',
  components: {
    draggable
  },
  data: () => ({
    APP,
    palette,
    currentTab: localStorage.getItem('Palette:currentTab')
  }),
  created() {
    window.Palette = this
  },
  watch: {
    currentTab(value) {
      localStorage.setItem('Palette:currentTab', value)
    }
  }
}

</script>

<style lang="scss">
.c-palette {
  background-color: var(--color--white);
  border: 1px solid var(--color--pale-1);
  position: absolute;
  border-radius: var(--border-radius) var(--border-radius) 0 0;
  bottom: 0;

  z-index: 10000;
  left: var(--spacing-m);
  right: var(--spacing-m);

  display: flex;
  flex-direction: column;
  max-height: calc(100% - 42px);
}

.c-palette--full {
  top: 42px;
}

.c-palette__table {
  // padding: 10px;
  border-spacing: 1px;
  z-index: 1000;
  // width: 0;
  /*
  &:hover {
    background-color: var(--color--black);
    color: var(--color--white);
  }
  */
  td {
    padding: 2px 8px;
    white-space: nowrap;
  }
  .c-field label {
    width: 100px;
  }
  input[type=number] {
    max-width: 60px;
  }
  input[type=text], .c-selector {
    width: 120px;
  }
}

.c-palette__section {
  // padding: var(--spacing-xxl);
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.c-palette__section--staticdb {
  // height: 590px;
  display: flex;
  flex-direction: column;

  flex-shrink: 1;
  overflow: auto;
  height: 100%;
  .c-datagrid {
    max-height: 400px;
  }
  .c-tabs-content {
   // max-height: 440px;
  }
  > .c-scheme__header {
    background-color: var(--color--dark-3);
    // border-top: 2px solid var(--color--dark-2);
    margin-top: 2px;
    border-radius: 8px 0 0 0;
  }
}

.c-palette__wheel-base {
  width: 100px;
  height: 100px;
  background: conic-gradient(
    hsl(0 100% 50%),
    hsl(45 100% 50%),
    hsl(90 100% 50%),
    hsl(135 100% 50%),
    hsl(180 100% 50%),
    hsl(225 100% 50%),
    hsl(270 100% 50%),
    hsl(315 100% 50%),
    hsl(360 100% 50%)
  );
  clip-path: circle(closest-side);
}

.c-palette__wheel-own {
  width: 100px;
  height: 100px;
  background: conic-gradient(
    var(--color-red),
    var(--color-orange),
    var(--color-amber),
    var(--color-yellow),
    var(--color-lime),
    var(--color-green),
    var(--color-cyan),
    var(--color-azure),
    var(--color-blue),
    var(--color-violet),
    var(--color-purple),
    var(--color-magenta),
    var(--color-rose),
    var(--color-red),
  );
  clip-path: circle(closest-side);
}
</style>
