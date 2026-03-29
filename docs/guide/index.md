# Getting Started

<div class="badges">

[![npm](https://img.shields.io/npm/v/vue-virtual-scroller.svg)](https://npmx.dev/package/vue-virtual-scroller)
[![npm](https://img.shields.io/npm/dm/vue-virtual-scroller.svg)](https://npmx.dev/package/vue-virtual-scroller)
[![vue3](https://img.shields.io/badge/vue-3.x-brightgreen.svg)](https://vuejs.org/)

</div>

Blazing fast scrolling of any amount of data | [Demos](../demos/index.md) | [Video demo](https://www.youtube.com/watch?v=Uzq1KQV8f4k)

For Vue 2 support, see [here](https://github.com/Akryum/vue-virtual-scroller/tree/v1/packages/vue-virtual-scroller).

## Installation

```sh
npm install vue-virtual-scroller@next
```

```sh
yarn add vue-virtual-scroller@next
```

```sh
pnpm add vue-virtual-scroller@next
```

## Setup

`vue-virtual-scroller` ships ESM only. Use it from an ESM-aware toolchain such as Vite, Nuxt, Rollup, or webpack 5.

### Plugin import

Install all the components:

```js
import VueVirtualScroller from 'vue-virtual-scroller'

app.use(VueVirtualScroller)
```

Use specific components:

```js
import { RecycleScroller } from 'vue-virtual-scroller'

app.component('RecycleScroller', RecycleScroller)
```

::: warning
The CSS file must be imported when using the package:

```js
import 'vue-virtual-scroller/index.css'
```
:::

## Components

There are several components provided by `vue-virtual-scroller`:

- [**RecycleScroller**](./recycle-scroller) — only renders the visible items in your list. It also re-uses components and DOM elements to be as efficient and performant as possible.

- [**DynamicScroller**](./dynamic-scroller) — wraps RecycleScroller and extends its features to include dynamic size management. The main use case is when you **do not know the size of the items** in advance. It automatically "discovers" item dimensions as it renders new items during scrolling.

- [**DynamicScrollerItem**](./dynamic-scroller-item) — must wrap each item in a DynamicScroller to handle size computations.

- [**WindowScroller**](./window-scroller) — dedicated window-viewport version of the virtual scroller API. Prefer this over `pageMode` when the browser window is the real scroll container.

- [**IdState**](./id-state) — a mixin that eases local state management in reused components inside a RecycleScroller.

- [**useRecycleScroller (headless)**](./use-recycle-scroller) — low-level composable API to build your own virtual scroller UI without using bundled components.

- [**useDynamicScroller (headless dynamic items)**](./use-dynamic-scroller) — headless composable API for unknown-size lists, including wrapper-free measurement and automatic recycled-view styles through `vDynamicScrollerItem`.

- `useWindowScroller` — headless window-scrolling composable used by `WindowScroller`.

## Headless APIs

Use the headless APIs when you want the virtualization engine without the bundled component markup.

- Start with [**useRecycleScroller**](./use-recycle-scroller) when item size is fixed or already known on each item.
- Move to [**useDynamicScroller**](./use-dynamic-scroller) when size must be measured from the DOM after render.
- Use [**WindowScroller**](./window-scroller) or `useWindowScroller` when the list should track the browser viewport itself.
- Prefer the bundled components when their markup already fits your UI; the headless path gives you more control, but it also makes you responsible for the outer structure and scroll-container sizing.

<style scoped>
.badges p {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
</style>
