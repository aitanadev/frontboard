# Data grid

`DataGrid` `c-data-grid`

Data grid component allow you to compose any kind of tabular data visualization.

Datagrid supports:

* Sticky columns
* Custom column resize
* Column _drag&drop_ positioning
* Row _drag&drop_
* Bulk operations and row multiselect
* Available **slots** for header cells, regular cells and named cells

```html
<template>
  <Datagrid :cols="cols" :records="records"/>
</template>
<script>
({
 records: [
    {id: '1', name: 'name', data: 10, value: true},
    {id: '2', name: 'name', data: 10, value: true},
    {id: '3', name: 'name', data: 10, value: true},
    {id: '4', name: 'name', data: 10, value: true},
    {id: '5', name: 'name', data: 10, value: true},
    {id: '6', name: 'name', data: 10, value: true},
    {id: '7', name: 'name', data: 10, value: true},
    {id: '8', name: 'name', data: 10, value: true},
    {id: '9', name: 'name', data: 10, value: true},
    {id: '10', name: 'name', data: 10, value: true},
    {id: '11', name: 'name', data: 10, value: true},
    {id: '12', name: 'name', data: 10, value: true},
    {id: '13', name: 'name', data: 10, value: true},
    {id: '14', name: 'name', data: 10, value: true},
    {id: '15', name: 'name', data: 10, value: true},
    {id: '16', name: 'name', data: 10, value: true},
    {id: '17', name: 'name', data: 10, value: true},
    {id: '18', name: 'name end', data: 10, value: true}
  ],
  cols: [
    {key: 'id', col: true, size: 100, sticky: 'left', label: 'Id'},
    {key: 'name', col: true, size: 200, sticky: false, label: 'Name'},
    {key: 'data', col: true, size: 200, sticky: false, label: 'Data'},
    {key: 'value', col: true, size: 200, sticky: false, label: 'Value'},
    {key: 'actions', col: true, size: 100, sticky: 'right', label: 'Actions'}
  ]
})
</script>
```
<!--- section --->
# Injected contents

```html
<template>
  <Datagrid
    :cols="[
      {key: 'id', col: true, size: 80, sticky: 'left', label: 'Id'},
      {key: 'name', col: true, size: 200, sticky: false, label: 'Name'},
      {key: 'data', col: true, size: 150, sticky: false, label: 'Data'},
      {key: 'value', col: true, size: 300, sticky: 'right', label: 'Value'}
    ]"
  >
    <record>
      <cell>1</cell><cell><strong>name 1</strong></cell><cell>😀</cell><cell>true</cell>
    </record>
    <record>
      <cell>2</cell><cell><em>name 2</em></cell><cell>🙂</cell><cell>false</cell>
    </record>
    <record>
      <cell>3</cell><cell>name 3</cell><cell>😁</cell><cell>true</cell>
    </record>
    <record>
      <cell>4</cell><cell>name 4</cell><cell>😃</cell><cell>false</cell>
    </record>
    <record>
      <cell>5</cell><cell>name 5</cell><cell>😄</cell><cell>true</cell>
    </record>
    <record>
      <cell>6</cell><cell>name 6</cell><cell>🙃</cell><cell>false</cell>
    </record>
  </Datagrid>
</template>
```
<!--- section --->
# Injected contents advance

```html
<template>
  <Datagrid
    selectable
    sortable
    :colsPrepend="[
      {key: '$', col: true, size: 90, sticky: 'left', label: ''},
    ]"
    :cols="[
      {key: 'id', col: true, size: 80, sticky: false, label: 'Id'},
      {key: 'name', col: true, size: 200, sticky: false, label: 'Name'},
      {key: 'data', col: true, size: 150, sticky: false, label: 'Data'},
      {key: 'value', col: true, size: 300, sticky: false, label: 'Value'},
      {key: 'action', col: true, size: 120, sticky: 'right', label: 'Actions'}
    ]"
    @selectionChange="window.selection = $event;$forceUpdate()"
  >
    <record>
      <cell>1</cell><cell><strong>name 1</strong></cell><cell>😀</cell><cell>true</cell><cell>...</cell>
    </record>
    <record>
      <cell>2</cell><cell><em>name 2</em></cell><cell>🙂</cell><cell>false</cell><cell>...</cell>
    </record>
    <record>
      <cell>3</cell><cell>name 3</cell><cell>😁</cell><cell>true</cell><cell>...</cell>
    </record>
    <record>
      <cell>4</cell><cell>name 4</cell><cell>😃</cell><cell>false</cell><cell>...</cell>
    </record>
    <record>
      <cell>5</cell><cell>name 5</cell><cell>😄</cell><cell>true</cell><cell>...</cell>
    </record>
    <record>
      <cell>6</cell><cell>name 6</cell><cell>🙃</cell><cell>false</cell><cell>...</cell>
    </record>
    <record>
      <cell>1</cell><cell><strong>name 1</strong></cell><cell>😀</cell><cell>true</cell><cell>...</cell>
    </record>
    <record>
      <cell>2</cell><cell><em>name 2</em></cell><cell>🙂</cell><cell>false</cell><cell>...</cell>
    </record>
    <record>
      <cell>3</cell><cell>name 3</cell><cell>😁</cell><cell>true</cell><cell>...</cell>
    </record>
    <record>
      <cell>4</cell><cell>name 4</cell><cell>😃</cell><cell>false</cell><cell>...</cell>
    </record>
    <record>
      <cell>5</cell><cell>name 5</cell><cell>😄</cell><cell>true</cell><cell>...</cell>
    </record>
    <record>
      <cell>6</cell><cell>name 6</cell><cell>🙃</cell><cell>false</cell><cell>...</cell>
    </record>
    <record>
      <cell>1</cell><cell><strong>name 1</strong></cell><cell>😀</cell><cell>true</cell><cell>...</cell>
    </record>
    <record>
      <cell>2</cell><cell><em>name 2</em></cell><cell>🙂</cell><cell>false</cell><cell>...</cell>
    </record>
    <record>
      <cell>3</cell><cell>name 3</cell><cell>😁</cell><cell>true</cell><cell>...</cell>
    </record>
    <record>
      <cell>4</cell><cell>name 4</cell><cell>😃</cell><cell>false</cell><cell>...</cell>
    </record>
    <record>
      <cell>5</cell><cell>name 5</cell><cell>😄</cell><cell>true</cell><cell>...</cell>
    </record>
    <record>
      <cell>6</cell><cell>name 6</cell><cell>🙃</cell><cell>false</cell><cell>...</cell>
    </record>
  </Datagrid>
  {{ window.selection?.map(record => record.data) }}
</template>
```