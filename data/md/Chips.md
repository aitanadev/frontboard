# Chips

`c-chip`

Chips uses only CSS classes (not component needed) and can have three **variations**

* `v-default`
* `v-semi`
* `v-solid`

The color **tones** depends on Palette colors definitions using `t-colorToneName` , like `t-succes`

```html
<template>
  <span>Only chip</span>
  <span type="button" class="c-chip v-semi t-info">Hello</span>
  <br><br>
  <span>Using icons</span>
  <span class="c-chip t-primary">
    <span class="fi fi-rs-heart"></span>Chip<span class="fi fi-rs-user"></span>
  </span>
  <br><br>
  <span>Using buttons inside</span> 
  <span class="c-chip t-warning">
    <div class="c-action"><span class="fi fi-rs-heart"></span></div>
    Chip
    <div class="c-action"><span class="fi fi-rs-user"></span></div>
  </span>
</template>
```

## All chips variations for all available tones

```html
<template>
  <template v-for="variation in ['default', 'semi', 'solid']">
    <h3>{{ variation.capitalize() }}</h3>
    <table>
      <tr>
        <td></td>
        <td v-for="colorTone in APP.services.palette.colorTones">{{ colorTone.name.capitalize() }}</td>
      </tr>
      <tr v-for="status in ['default']">
        <td>{{ status.capitalize() }}</td>
        <td v-for="colorTone in APP.services.palette.colorTones" style="white-space: nowrap;padding: 20px;gap: 5px;">
          <h4>{{ colorTone.name.capitalize() }}</h4>
          <div class="v-flex-col">
            <div>
              <div
                class="c-chip"
                :class="[
                  {['t-' + colorTone.name]: colorTone.name !== 'default'},
                  {['v-' + variation]: variation !== 'default'},
                  {['s-' + status]: status !== 'default'}
                ]"
              >Chip</div>
              <span>some text</span>
            </div>
            <div>
              <div
                class="c-chip" 
                :class="[
                  {['t-' + colorTone.name]: colorTone.name !== 'default'},
                  {['v-' + variation]: variation !== 'default'},
                  {['s-' + status]: status !== 'default'}
                ]"
              >
                <span class="fi fi-rs-heart"></span>Chip<span class="fi fi-rs-user"></span>
              </div>
              <span>some text</span>
            </div>
            <div>
              <div
                class="c-chip"
                :class="[
                  {['t-' + colorTone.name]: colorTone.name !== 'default'},
                  {['v-' + variation]: variation !== 'default'},
                  {['s-' + status]: status !== 'default'}
                ]">
                <div class="c-action"><span class="fi fi-rs-heart"></span></div>Chip<div class="c-action"><span class="fi fi-rs-user"></span></div>
              </div>
              <span>some text</span>
            </div>
          </div>
        </td>
      </tr>
    </table>
  </template>
</template>
```