# Selector component

`Selector` `c-selector`

The Selector component make it easy to create any kind of dropdown options and supports:

* Multiple selection
* Groping options
* Filtering/autosugest
* Nested options - multilevel dropdown
* Custom datasets using optionText optionValue props
* Complete keyboard navigation
* Many slots: handler, handler items, append/prepend options, option content

## Basic use example

```html
<template>
  <Selector :options="options" v-model="selection" />
  <div>Current selection: {{ selection }}</div>
</template>
<script>
({
  options: ['Option 1','Option 2','Option 3','Option 4'],
  selection: 'Option 3'
})
</script>
```

## Advanced options all together

```html
<template>
  <Selector
    :options="options"
    v-model="selection"
    filterable
    multilevel
    grouped
    style="width: 400px;"
    multiple
  />
</template>
<script>
({
  options: [
    {
      text: 'Group multilevel',
      options: ['M 1', 'M 2', 'M 3', 'M 4', 'M 5'].map(option => ({
        text: option,
        options: ['1', '2', '3'].map(subOption => ({
          text: option.replace(' ', ' ') + ' Option ' + subOption,
          options: ['1sub', '2sub', '3sub'].map(subOption2 => ({
            text: option.replace(' ', ' ') + ' Option ' + subOption + ' ' + subOption2,
            value: option.replace(' ', '') + ' Option ' + subOption + ' ' + subOption2
          }))
        }))
      }))
    },
    {
      text: 'Group A',
      options: ['GA 1', 'GA 2', 'GA 3'].map(option => ({
          text: option,
          options: ['1', '2', '3', '4', '5', '6'].map(subOption => ({
            text: option.replace(' ', '') + ' Option ' + subOption,
            value: option.replace(' ', '') + ' Option ' + subOption
          }))
        }))
    },
    {
      text: 'Group B',
      options: ['GB 1', 'GB 2', 'GB 3', 'GB 4', 'GB 5'].map(option => ({
          text: option,
          options: ['1', '2', '3'].map(subOption => ({
            text: option.replace(' ', '') + ' Option ' + subOption,
            value: option.replace(' ', '') + ' Option ' + subOption
          }))
        }))
    }
  ],
  selection: []
})
</script>
```