# Fields

`c-field`

Fields CSS clases make it easy to composed mixed inputs with labeling and actions all together.

**_Work in progress_**

```html
<template>
  <div>
    <div class="v-flex-col" :class="{'v-invert': APP.services.palette.invert}">
      <!-- <dialog>dialog</dialog> -->

      <div class="c-field">
        <label for="i1">Label</label>
        <input id="i1" class="c-input" value="input">
      </div>

      <div class="c-field t-error">
        <label for="i3">Label</label></dt>
        <button class="c-action">Action x</button>
        <button class="c-action">Action x</button>
        <div class="c-input"><input id="i3" value="field 1"></div>
        <input id="i4" type="checkbox">
        <button class="c-action">Action 2</button>
        <input id="i6" type="radio">
        <button class="c-action t-primary">Action x</button>
        <button class="c-action">Action 2</button>
        <button class="c-action">Action 2</button>
        <button class="c-action s-disabled">disabled 2</button>
      </div>

      <div class="c-field">
        <label for="i3">Label</label></dt>
        <button class="c-action">Action x</button>
        <button class="c-action">Action x</button>
        <div class="c-input"><input id="i3" value="field 1"></div>
        <div class="c-input"><input id="i4" value="field 1"></div>
        <button class="c-action t-primary">Action 2</button>
        <button class="c-action">Action 2</button>
        <label for="i4">Label</label></dt>
        <input id="i4" type="checkbox">
        <button class="c-action t-secondary">Action 2</button>
        <button class="c-action s-disabled">disabled 2</button>
        <button class="c-action t-warning">Action 2</button>
      </div>

      <div class="c-field">
        <input id="i4" type="checkbox">
        <input id="i6" type="radio">
        <div class="c-input">
          <div class="c-chip v-solid">
            <div class="c-action"><span class="fi fi-rs-heart"></span></div>
            <span>Chip</span>
            <div class="c-action"><span class="fi fi-rs-user"></span></div>
          </div>
        </div>
        <div class="c-input t-warning">
          <div class="c-chip v-solid">
            <div class="c-action"><span class="fi fi-rs-heart"></span></div>
            <span>Chip</span>
            <div class="c-action"><span class="fi fi-rs-user"></span></div>
          </div>
        </div>
        <label for="i3">Label</label></dt>
      </div>

      <div class="c-field">
        <label class="u-loading" for="i1">Label</label>
        <input id="i1" class="c-input" value="input">
        <input id="i6" type="radio">
      </div>

      <div class="c-field">
        <label for="i2">Label</label></dt>
        <div class="c-input"><input id="i2" value="field"></div>
        <button class="c-action t-info"><span class="fi fi-rs-calendar"></span></button>
      </div>

      <div class="c-emergent c-emergent--open">
        <menu class="c-options">
          <li><button class="c-action c-option">option</button></li>
          <li><button class="c-action c-option t-error">option</button></li>
          <li><button class="c-action c-option s-disabled">option</button></li>
        </menu>
      </div>

      <!--
      <div>
        <div class="c-ranges"><input type="range" v-model="range1"><input type="range" v-model="range2"></div>
        <br><br>
        <div class="c-ranges --vertical"><input type="range" v-model="range1"><input type="range" v-model="range2"></div>
      </div>

      <div>
        <input type="range" v-model="range1">
        <input type="range" v-model="range1">
      </div>

      {{ range1 }} {{ range2 }}
      -->

    </div>
  </div>
</template>
<script>
({
  range1: 5,
  range2: 10
})
</script>
```