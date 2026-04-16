# Installation And Setup

Scope: install the package correctly in a Vue 3 app and avoid the common setup mistakes that make examples appear broken.

## Provenance

Generated from the package's public setup and getting-started documentation at skill generation time.

## When to use

- You are adding `vue-virtual-scroller` to a Vue 3 application.
- You need to decide between plugin install and direct imports.
- A demo or integration looks broken because CSS, ESM, or Vue version requirements were missed.

## Required inputs

- Vue 3.3+ application context.
- ESM-aware build tool such as Vite, Nuxt, Rollup, or webpack 5.
- The package stylesheet import: `vue-virtual-scroller/index.css`.

## Core props/options

Documented install paths:

- `app.use(VueVirtualScroller)` for bundled components
- direct imports for `RecycleScroller`, `DynamicScroller`, `DynamicScrollerItem`, and `WindowScroller`
- direct imports for headless helpers such as `useRecycleScroller`, `useDynamicScroller`, `useWindowScroller`, and `useTableColumnWidths`

Keep setup guidance to the documented install patterns. Plugin option details are still not fully documented.

## Events/returns

- None at setup time.

## Pitfalls

- The package is ESM only in the current Vue 3 line.
- Vue 3.3+ is required for the generic component typing surface described in the docs.
- Missing the CSS import makes layout and virtualization behavior appear incorrect.
- Vue 2 setup advice is out of scope for this package line.

## Example patterns

Global registration:

```js
import { createApp } from 'vue'
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/index.css'

const app = createApp(App)
app.use(VueVirtualScroller)
```

Direct component imports:

```js
import { RecycleScroller, WindowScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/index.css'

app.component('RecycleScroller', RecycleScroller)
app.component('WindowScroller', WindowScroller)
```

Headless import:

```ts
import { useDynamicScroller, useTableColumnWidths } from 'vue-virtual-scroller'
```
