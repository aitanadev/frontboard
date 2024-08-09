# Data grid

`DataGrid` `fds-c-data-grid`

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
  <FrontboardDatagrid :cols="cols" :records="records"/>
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
# Grouped

```html
<template>
  <FrontboardDatagrid grouped :cols="cols" :records="records"/>
</template>
<script>
({
  records: [
    [
      { name: 'group 1' },
      [
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
      ]
    ],
    [
      { name: 'group 2' },
      [
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
      ]
    ],
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
  <FrontboardDatagrid
    :cols="[
      {key: 'id', col: true, size: 80, sticky: 'left', label: 'Id'},
      {key: 'name', col: true, size: 200, sticky: false, label: 'Name'},
      {key: 'data', col: true, size: 150, sticky: false, label: 'Data'},
      {key: 'value', col: true, size: 300, sticky: 'right', label: 'Value'}
    ]"
  >
    <template #data>
      <data-record>
        <data-cell>123</data-cell><data-cell><strong>name 1</strong></data-cell><data-cell>😀</data-cell><data-cell>true</data-cell>
      </data-record>
      <data-record>
        <data-cell>2</data-cell><data-cell><em>name 2</em></data-cell><data-cell>🙂</data-cell><data-cell>false</data-cell>
      </data-record>
      <data-record>
        <data-cell>3</data-cell><data-cell>name 3</data-cell><data-cell>😁</data-cell><data-cell>true</data-cell>
      </data-record>
      <data-record>
        <data-cell>4</data-cell><data-cell>name 4</data-cell><data-cell>😃</data-cell><data-cell>false</data-cell>
      </data-record>
      <data-record>
        <data-cell>5</data-cell><data-cell>name 5</data-cell><data-cell>😄</data-cell><data-cell>true</data-cell>
      </data-record>
      <data-record>
        <data-cell>6</data-cell><data-cell>name 6</data-cell><data-cell>🙃</data-cell><data-cell>false</data-cell>
      </data-record>
    </template>
  </FrontboardDatagrid>
</template>
```
<!--- section --->
# Injected contents advance

```html
<template>
  <FrontboardDatagrid
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
    <template #data>
      <data-record>
        <data-cell>1</data-cell><data-cell><strong>name 1</strong></data-cell><data-cell>😀</data-cell><data-cell>true</data-cell><data-cell>...</data-cell>
      </data-record>
      <data-record>
        <data-cell>2</data-cell><data-cell><em>name 2</em></data-cell><data-cell>🙂</data-cell><data-cell>false</data-cell><data-cell>...</data-cell>
      </data-record>
      <data-record>
        <data-cell>3</data-cell><data-cell>name 3</data-cell><data-cell>😁</data-cell><data-cell>true</data-cell><data-cell>...</data-cell>
      </data-record>
      <data-record>
        <data-cell>4</data-cell><data-cell>name 4</data-cell><data-cell>😃</data-cell><data-cell>false</data-cell><data-cell>...</data-cell>
      </data-record>
      <data-record>
        <data-cell>5</data-cell><data-cell>name 5</data-cell><data-cell>😄</data-cell><data-cell>true</data-cell><data-cell>...</data-cell>
      </data-record>
      <data-record>
        <data-cell>6</data-cell><data-cell>name 6</data-cell><data-cell>🙃</data-cell><data-cell>false</data-cell><data-cell>...</data-cell>
      </data-record>
      <data-record>
        <data-cell>1</data-cell><data-cell><strong>name 1</strong></data-cell><data-cell>😀</data-cell><data-cell>true</data-cell><data-cell>...</data-cell>
      </data-record>
      <data-record>
        <data-cell>2</data-cell><data-cell><em>name 2</em></data-cell><data-cell>🙂</data-cell><data-cell>false</data-cell><data-cell>...</data-cell>
      </data-record>
      <data-record>
        <data-cell>3</data-cell><data-cell>name 3</data-cell><data-cell>😁</data-cell><data-cell>true</data-cell><data-cell>...</data-cell>
      </data-record>
      <data-record>
        <data-cell>4</data-cell><data-cell>name 4</data-cell><data-cell>😃</data-cell><data-cell>false</data-cell><data-cell>...</data-cell>
      </data-record>
      <data-record>
        <data-cell>5</data-cell><data-cell>name 5</data-cell><data-cell>😄</data-cell><data-cell>true</data-cell><data-cell>...</data-cell>
      </data-record>
      <data-record>
        <data-cell>6</data-cell><data-cell>name 6</data-cell><data-cell>🙃</data-cell><data-cell>false</data-cell><data-cell>...</data-cell>
      </data-record>
      <data-record>
        <data-cell>1</data-cell><data-cell><strong>name 1</strong></data-cell><data-cell>😀</data-cell><data-cell>true</data-cell><data-cell>...</data-cell>
      </data-record>
      <data-record>
        <data-cell>2</data-cell><data-cell><em>name 2</em></data-cell><data-cell>🙂</data-cell><data-cell>false</data-cell><data-cell>...</data-cell>
      </data-record>
      <data-record>
        <data-cell>3</data-cell><data-cell>name 3</data-cell><data-cell>😁</data-cell><data-cell>true</data-cell><data-cell>...</data-cell>
      </data-record>
      <data-record>
        <data-cell>4</data-cell><data-cell>name 4</data-cell><data-cell>😃</data-cell><data-cell>false</data-cell><data-cell>...</data-cell>
      </data-record>
      <data-record>
        <data-cell>5</data-cell><data-cell>name 5</data-cell><data-cell>😄</data-cell><data-cell>true</data-cell><data-cell>...</data-cell>
      </data-record>
      <data-record>
        <data-cell>6</data-cell><data-cell>name 6</data-cell><data-cell>🙃</data-cell><data-cell>false</data-cell><data-cell>...</data-cell>
      </data-record>
    </template>
  </FrontboardDatagrid>
  {{ window.selection?.map(record => record.dataHTML) }}
</template>
```
<!--- section --->
# Injected grouped contents

```html
<template>
  <FrontboardDatagrid
    grouped
    :cols="[
      {key: 'id', col: true, size: 80, sticky: 'left', label: 'Id'},
      {key: 'name', col: true, size: 200, sticky: false, label: 'Name'},
      {key: 'data', col: true, size: 150, sticky: false, label: 'Data'},
      {key: 'value', col: true, size: 300, sticky: 'right', label: 'Value'}
    ]"
  >
    <template #data>
      <data-group>
        <data-group-header><data-cell></data-cell><data-cell><h3>Group 1</h3></data-cell><data-cell></data-cell><data-cell></data-cell></data-group-header>
        <data-record>
          <data-cell>123</data-cell><data-cell><strong>name 1</strong></data-cell><data-cell>😀</data-cell><data-cell>true</data-cell>
        </data-record>
        <data-record>
          <data-cell>2</data-cell><data-cell><em>name 2</em></data-cell><data-cell>🙂</data-cell><data-cell>false</data-cell>
        </data-record>
        <data-record>
          <data-cell>3</data-cell><data-cell>name 3</data-cell><data-cell>😁</data-cell><data-cell>true</data-cell>
        </data-record>
        <data-record>
          <data-cell>4</data-cell><data-cell>name 4</data-cell><data-cell>😃</data-cell><data-cell>false</data-cell>
        </data-record>
        <data-record>
          <data-cell>5</data-cell><data-cell>name 5</data-cell><data-cell>😄</data-cell><data-cell>true</data-cell>
        </data-record>
        <data-record>
          <data-cell>6</data-cell><data-cell>name 6</data-cell><data-cell>🙃</data-cell><data-cell>false</data-cell>
        </data-record>
      </data-group>
      <data-group>
        <data-group-header><data-cell></data-cell><data-cell><h3>Group 2</h3></data-cell><data-cell></data-cell><data-cell></data-cell></data-group-header>
        <data-record>
          <data-cell>123</data-cell><data-cell><strong>name 1</strong></data-cell><data-cell>😀</data-cell><data-cell>true</data-cell>
        </data-record>
        <data-record>
          <data-cell>2</data-cell><data-cell><em>name 2</em></data-cell><data-cell>🙂</data-cell><data-cell>false</data-cell>
        </data-record>
        <data-record>
          <data-cell>3</data-cell><data-cell>name 3</data-cell><data-cell>😁</data-cell><data-cell>true</data-cell>
        </data-record>
        <data-record>
          <data-cell>4</data-cell><data-cell>name 4</data-cell><data-cell>😃</data-cell><data-cell>false</data-cell>
        </data-record>
        <data-record>
          <data-cell>5</data-cell><data-cell>name 5</data-cell><data-cell>😄</data-cell><data-cell>true</data-cell>
        </data-record>
        <data-record>
          <data-cell>6</data-cell><data-cell>name 6</data-cell><data-cell>🙃</data-cell><data-cell>false</data-cell>
        </data-record>
      </data-group>
    </template>
  </FrontboardDatagrid>
</template>
```