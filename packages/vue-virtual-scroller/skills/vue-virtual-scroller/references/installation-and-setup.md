# Installation And Setup

Scope: install the package correctly in a Vue 3 app and avoid the common setup mistakes that make examples appear broken.

## Provenance

Generated from the package's public setup documentation at skill generation time.

## When to use

- You are adding `vue-virtual-scroller` to a Vue 3 application.
- You need to decide between global plugin install and direct component import.
- A demo or example is not rendering because the package CSS or ESM requirement was missed.

## Required inputs

- Vue 3 application context.
- ESM-aware build tool such as Vite, Nuxt, Rollup, or webpack 5.
- The package stylesheet import: `vue-virtual-scroller/index.css`.

## Core props/options

- Global plugin install:
  - `app.use(VueVirtualScroller)`
- Direct component import:
  - import and register `RecycleScroller`, `DynamicScroller`, or `DynamicScrollerItem` explicitly

The current guide documents the setup path, but does not fully document plugin option behavior. Keep setup guidance to the documented install patterns unless the docs are expanded first.

## Events/returns

- None at setup time.

## Pitfalls

- The package is ESM only in the current Vue 3 line.
- Missing the CSS import will make layout and virtualization behavior appear incorrect.
- Vue 2 references still exist in historical material, but they are out of scope for this package line.

## Example patterns

Global registration:

```js
import { createApp } from 'vue'
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/index.css'

const app = createApp(App)
app.use(VueVirtualScroller)
```

Direct import:

```js
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/index.css'

app.component('RecycleScroller', RecycleScroller)
```
