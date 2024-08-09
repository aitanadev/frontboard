# Entity views

`EntityList` `EntityDetail` `EntityLabel`

Some Entity views examples using StaticDB data

_Drag&drop features on data grids rows are not available inside text editor examples (try it on Palette)_

## EntityDetail example

Using directly custom data over a existing model

```html
<template>
  <EntityDetail :entityClass="Entity.models.Color" :use="color"/>
</template>
<script>
({
  color: new $APP.Entity.models.Color({
    id: 'dummy-sample',
    name: 'Dummy color',
    hue: 191,
    saturation: 87,
    lightness: 58
  })
})
</script>
```

## EntityLabel example

Referencing to the same object

```html
<template>
  <EntityLabel typed :entity="new Entity.models.Color('1001')"/>
</template>
```

## EntityList example

Using example dataset and automatically creating the base CRUD

```html
<template>
  <EntityList :entityClass="Entity.models.Color" v-model="APP.services.palette.colors" />
</template>
```


