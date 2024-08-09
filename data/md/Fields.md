# Fields

`fds-c-field`

Fields CSS clases make it easy to composed mixed inputs with labeling and actions all together.

**_Work in progress_**

```html
<template>
  <div>
    <div class="v-flex-col" :class="{'v-invert': APP.services.palette.invert}">
      <!-- <dialog>dialog</dialog> -->

      <div class="fds-c-field">
        <label for="i1">Label</label>
        <input id="i1" class="fds-c-input" value="input">
      </div>

      <div class="fds-c-field t-error">
        <label for="i3">Label</label></dt>
        <button class="fds-c-action">Action x</button>
        <button class="fds-c-action">Action x</button>
        <div class="fds-c-input"><input id="i3" value="field 1"></div>
        <input id="i4" type="checkbox" class="fds-c-checkbox">
        <button class="fds-c-action">Action 2</button>
        <input id="i6" type="radio" class="fds-c-radio">
        <button class="fds-c-action t-primary">Action x</button>
        <button class="fds-c-action">Action 2</button>
        <button class="fds-c-action">Action 2</button>
        <button class="fds-c-action s-disabled">disabled 2</button>
      </div>

      <div class="fds-c-field">
        <label for="i3">Label</label></dt>
        <button class="fds-c-action">Action x</button>
        <button class="fds-c-action">Action x</button>
        <div class="fds-c-input"><input id="i3" value="field 1"></div>
        <div class="fds-c-input"><input id="i4" value="field 1"></div>
        <button class="fds-c-action t-primary">Action 2</button>
        <button class="fds-c-action">Action 2</button>
        <label for="i4">Label</label></dt>
        <input id="i4" type="checkbox" class="fds-c-checkbox">
        <button class="fds-c-action t-secondary">Action 2</button>
        <button class="fds-c-action s-disabled">disabled 2</button>
        <button class="fds-c-action t-warning">Action 2</button>
      </div>

      <div class="fds-c-field">
        <input id="i4" type="checkbox" class="fds-c-checkbox">
        <input id="i6" type="radio" class="fds-c-radio">
        <input id="i7" type="checkbox" class="fds-c-switch">
        <div class="fds-c-input">
          <div class="fds-c-chip v-solid">
            <div class="fds-c-action"><span class="fi fi-rs-heart"></span></div>
            <span>Chip</span>
            <div class="fds-c-action"><span class="fi fi-rs-user"></span></div>
          </div>
        </div>
        <div class="fds-c-input t-warning">
          <div class="fds-c-chip v-solid">
            <div class="fds-c-action"><span class="fi fi-rs-heart"></span></div>
            <span>Chip</span>
            <div class="fds-c-action"><span class="fi fi-rs-user"></span></div>
          </div>
        </div>
        <label for="i3">Label</label></dt>
      </div>

      <div class="fds-c-field">
        <label class="u-loading" for="i1">Label</label>
        <input id="i1" class="fds-c-input" value="input">
        <input id="i6" type="radio" class="fds-c-radio">
      </div>

      <div class="fds-c-field">
        <label for="i2">Label</label></dt>
        <div class="fds-c-input"><input id="i2" value="field"></div>
        <button class="fds-c-action t-info"><span class="fi fi-rs-calendar"></span></button>
      </div>

      <div class="fds-c-emergent fds-c-emergent--open">
        <menu class="fds-c-options">
          <li><button class="fds-c-action fds-c-option">option</button></li>
          <li><button class="fds-c-action fds-c-option t-error">option</button></li>
          <li><button class="fds-c-action fds-c-option s-disabled">option</button></li>
        </menu>
      </div>

      <!--
      <div>
        <div class="fds-c-ranges"><input type="range" v-model="range1"><input type="range" v-model="range2"></div>
        <br><br>
        <div class="fds-c-ranges --vertical"><input type="range" v-model="range1"><input type="range" v-model="range2"></div>
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