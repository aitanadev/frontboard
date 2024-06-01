# Buttons

`c-action`

Buttons uses only CSS classes (not component needed) and can have three **variations**

* `v-default`
* `v-semi`
* `v-solid`

The color **tones** depends on Palette colors definitions using `t-colorToneName` , like `t-succes`

```html
<template>
  <button type="button" class="c-action t-success">Default</button>
  <button type="button" class="c-action v-semi t-success">Semi</button>
  <button type="button" class="c-action v-solid t-success">Solid</button>
</template>
```

## All buttons variations for all available tones

```html
<template>
  <label><input type="checkbox" v-model="APP.services.palette.showFixedStatuses"> All status</label><br><br>
  <div class="--toolbar" :class="{'v-invert': APP.services.palette.invert}">
    <template v-for="variation in ['default', 'semi', 'solid']">
      <br>
      <h3>{{ variation.capitalize() }}</h3>
      <table>
        <tr>
          <td></td>
          <td v-for="colorTone in APP.services.palette.colorTones">{{ colorTone.name.capitalize() }}</td>
        </tr>
        <tr v-for="status in APP.services.palette.statuses">
          <td>{{ status.capitalize() }}</td>
          <td v-for="colorTone in APP.services.palette.colorTones">
            <button
              :class="[
                'c-action',
                {['t-' + colorTone.name]: colorTone.name !== 'default'},
                {['v-' + variation]: variation !== 'default'},
                {['s-' + status]: status !== 'default'},
              ]"
            >
              <span class="fi fi-rs-picture"></span>{{ colorTone.name }}
            </button>
          </td>
        </tr>
      </table>
    </template>
  </div>
</template>
```