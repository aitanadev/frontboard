# Scheme views

`SchemeList` `SchemeDetail` `SchemeChip`

Some Scheme views examples using StaticDB data

_Drag&drop features on data grids rows are not available inside text editor examples (try it on Palette)_

## SchemeDetail example

Using existing example data

```html
<template>
  <SchemeDetail :schemeClass="APP.services.Scheme.models.User" :use="new APP.services.Scheme.models.User('1001')"/>
</template>
```

## SchemeChip example

Referencing to the same object

```html
<template>
  <SchemeChip typed :entity="new APP.services.Scheme.models.User('1001')"/>
</template>
```

## SchemeList example

Using example dataset and automatically creating the base CRUD

```html
<template>
  <SchemeList :schemeClass="APP.services.Scheme.models.Color" v-model="APP.services.palette.colors" />
</template>
```

## Using directly custom data over a existing model

```html
<template>
  <SchemeDetail :schemeClass="APP.services.Scheme.models.User" :use="user"/>
</template>
<script>
({
  user: new APP.services.Scheme.models.User({
    id: 'dummy-sample',
    name: 'Dummy name',
    lastName: 'Dummy lastname 2',
    birthDate: new Date('1982-11-06')
  })
})
</script>
```