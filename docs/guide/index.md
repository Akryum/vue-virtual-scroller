# Getting Started

<div class="badges">

[![npm](https://img.shields.io/npm/v/vue-virtual-scroller.svg)](https://npmx.dev/package/vue-virtual-scroller)
[![npm](https://img.shields.io/npm/dm/vue-virtual-scroller.svg)](https://npmx.dev/package/vue-virtual-scroller)
[![vue3](https://img.shields.io/badge/vue-3.x-brightgreen.svg)](https://vuejs.org/)

</div>

`vue-virtual-scroller` helps you render large lists in Vue without paying the cost of mounting every item at once.

If you are new to the package, start here, then explore the [demos](../demos/index.md) or the [video demo](https://www.youtube.com/watch?v=Uzq1KQV8f4k) when you want to see the behavior in motion.

If you need Vue 2 support, use the [v1 branch](https://github.com/Akryum/vue-virtual-scroller/tree/v1/packages/vue-virtual-scroller).

## Installation

```sh
npm install vue-virtual-scroller
```

```sh
yarn add vue-virtual-scroller
```

```sh
pnpm add vue-virtual-scroller
```

## Setup

`vue-virtual-scroller` ships ESM only and requires Vue 3.3+ for the generic component typing surface. Use it from an ESM-aware toolchain such as Vite, Nuxt, Rollup, or webpack 5.

## TypeScript generics

With Vue 3.3+, the component APIs infer the item type from the `items` prop, so scoped slot props such as `item` stay typed without extra annotations.

The headless composables also expose explicit generics when you want stronger type checking for returned state and helpers:

```ts
const recycleScroller = useRecycleScroller<User>(options, scrollerEl)
const dynamicScroller = useDynamicScroller<Message>(options)
const windowScroller = useWindowScroller<Row>(options, rootEl)
```

For object items, the composables also validate fields such as `keyField` and variable-size `sizeField` against the declared item type.

### Plugin import

Install all components:

```js
import VueVirtualScroller from 'vue-virtual-scroller'

app.use(VueVirtualScroller)
```

Or register only the components you need:

```js
import { RecycleScroller } from 'vue-virtual-scroller'

app.component('RecycleScroller', RecycleScroller)
```

::: warning
Make sure to import the package CSS:

```js
import 'vue-virtual-scroller/index.css'
```
:::

## Components

`vue-virtual-scroller` includes the following components:

- [**RecycleScroller**](./recycle-scroller) — the main component for lists with known item sizes or sizes already stored in your data.

- [**DynamicScroller**](./dynamic-scroller) — builds on `RecycleScroller` and measures items as they render when size is not known in advance.

- [**DynamicScrollerItem**](./dynamic-scroller-item) — the measurement wrapper used inside `DynamicScroller`.

- [**WindowScroller**](./window-scroller) — a window-based version of the API for lists that should follow page scrolling instead of an inner container.

## Headless APIs

Use the headless APIs when you want the virtualization engine without the bundled component markup. This is ideal for `<table>` elements or highly custom layouts.

- Start with [**useRecycleScroller**](./use-recycle-scroller) when item size is fixed or already known.
- Move to [**useDynamicScroller**](./use-dynamic-scroller) when the DOM needs to measure size after render.
- Use [**useWindowScroller**](./use-window-scroller) when the page should still drive scrolling, but you need custom wrappers or semantics.

<style scoped>
.badges p {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
</style>
