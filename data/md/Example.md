# Some Frontboard text format examples

> `yarn test Component --watch --update-snapshot`

## Code-block with live running

```html
<template><Modal :error="{text: 'Hello!'}"/></template>
```

### CSS variables example

```html
<template>
  <section class="ds-section">
    <h2>Font weights</h2>
    <p>
      <span style="fontWeight: var(--font-weight--regular)">regular (default)</span>
      <span style="fontWeight: var(--font-weight--medium)">medium</span>
      <span style="fontWeight: var(--font-weightv-semibold)">semibold</span>
      <span style="fontWeight: var(--font-weight--bold)">bold</span>
    </p>
  </section>

  <section class="ds-section">
    <h2>Font sizes</h2>
    <p>
      <span style="fontSize: var(--font-size--xs)">Extra small</span>
      <span style="fontSize: var(--font-size--s)">Small</span>
      <span style="fontSize: var(--font-size--m)">Medium (default)</span>
      <span style="fontSize: var(--font-size--l)">Large</span>
      <span style="fontSize: var(--font-size--xl)">Extra large</span>
      <span style="fontSize: var(--font-size--xxl)">Extra large 2</span>
    </p>
  </section>

  <section class="ds-section">
    <h2>Headings</h2>
    <p>
      <h1>h1</h1>
      <h2>h2</h2>
      <h3>h3</h3>
      <h4>h4</h4>
      <h5>h5</h5>
    </p>
  </section>

  <section class="ds-section">
    <h2>Alert</h2>
    <div class="v-flex-col">
      <div class="--alert t-info">alert</div>
      <div class="--alert t-error">alert</div>
      <div class="--alert t-warning">alert</div>
      <div class="--alert t-success">alert</div>
    </div>
  </section>

  <section class="ds-section">
    <h2>Text formats</h2>
    <p>
      <strong>strong</strong>
      <em>em</em>
      <mark>mark</mark>
      <a href="#">link</a>
      <strike>strike</strike>
    </p>
  </section>

  <section class="ds-section">
    <h2>Lists</h2>
    <ul>
      <li>li</li>
      <li>li</li>
    </ul>
    <ol>
      <li>li</li>
      <li>li</li>
    </ol>
    <menu class="c-action --link">
      <li>li</li>
      <li>li</li>
    </menu>
  </section>

  <section class="ds-section">
    <h2>Tables</h2>
    <table>
      <thead>
        <tr><th>th</th><th>th</th><th>th</th></tr>
      </thead>
      <tbody>
        <tr><th>th</th><td>th</td><td>th</td></tr>
        <tr><th>th</th><td>th</td><td>th</td></tr>
      </tbody>
      <tfoot>
        <tr><th>th</th><th>th</th><th>th</th></tr>
      </tfoot>
    </table>
  </section>
</template>
```

```html
<template>
  <div>
    <p><strong>A test of auto render example in docs:</strong></p>
    <br/>
    <p>Text: <input v-model="selectionText"/></p>
    <br/>
    <div>
      <Selector :options="options" v-model="selection" />
      <div id="example-selection"> {{ selectionText }} {{ selection }}</div>
    </div>
  </div>
</template>

<script>
({
  selectionText: 'The selection is:',
  options: ['js','ruby','vue','css'],
  selection: 'js'
})
</script>

<style>
#example-selection {
  display: inline-block;
  font-size: 20px;
  line-height: 1em;
  color: var(--color-primary-base);
  border: 1px solid var(--color-primary-base);
  margin: 12px;
  padding: 6px 12px;
  border-radius: 3px;
}

</style>
```

## Introduction 🌈

Example paragraph for the new **_documentation editor_**

Some format examples: **bold**, _italic_, ~~strike~~ , ··underline··, !!!mark!!!, and **_~~··!!!all together!!!··~~_**

Code inline: `var 1`, `.style`, `a != b` or `function(){…}`

### Heading styling: `var 1`, `.style`, `a != b` or `function(){…}`

#### Unordered list:

* Something 1
* Something 2
* Something 3
* Something 4

#### Ordered list:

1. Something 1
2. Something 2
3. Something 3
4. Something 4

#### Task list:

* [ ] Something 1
* [x] Something 2
* [x] Something 3
* [ ] Something 4

**_Horizontal rule:_**

---

Paragraph with blockquote:

> It is a quote…
> 
> * Can contain lists
> 
> Paragraps… and a bunch of text Paragraps… and a bunch of text Paragraps… and a bunch of text Paragraps… and a bunch of text Paragraps… and a bunch of text Paragraps… and a bunch of text Paragraps… and a bunch of text Paragraps… and a bunch of text Paragraps… and a bunch of text Paragraps… and a bunch of text Paragraps… and a bunch of text Paragraps… and a bunch of text Paragraps… and a bunch of text Paragraps… and a **bunch of text**

…