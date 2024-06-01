# Inputs

`c-input`

Inputs uses only CSS classes (not component needed)

The color **tones** depends on Palette colors definitions using `t-colorToneName` , like `t-succes`

```html
<template>
  <label><input type="checkbox" v-model="APP.services.palette.showFixedStatuses"> All status</label><br><br>
  <div class="--toolbar" :class="{'v-invert': APP.services.palette.invert}">
    <table>
      <tr>
        <td></td>
        <td v-for="status in APP.services.palette.statuses">{{ status.capitalize() }}</td>
      </tr>
      <tr v-for="colorTone in APP.services.palette.colorTones">
        <td>{{ colorTone.name.capitalize() }}&nbsp;&nbsp;</td>
        <td v-for="status in APP.services.palette.statuses">
          <input
            placeholder="placeholder"
            :class="[
              'c-input',
              {['t-' + colorTone.name]: colorTone.name !== 'default'},
              {['s-' + status]: status !== 'default'},
            ]"
            :value="colorTone.name"
          >
        </td>
      </tr>
    </table>
  </div>
</template>
```