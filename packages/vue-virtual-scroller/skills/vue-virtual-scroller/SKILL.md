---
name: vue-virtual-scroller
description: Use this skill for Vue 3 virtual scrolling with vue-virtual-scroller, including RecycleScroller, DynamicScroller, DynamicScrollerItem, and the useRecycleScroller headless composable for fixed-size lists, unknown-size rows, grids, chat feeds, and horizontal layouts.
---

# Vue Virtual Scroller

Use this skill when a task involves large Vue lists, DOM reuse, windowed rendering, or choosing between `RecycleScroller`, `DynamicScroller`, and headless virtualization with `useRecycleScroller`.

## Quick choice

| Surface | Use it when | Avoid it when |
|---|---|---|
| `RecycleScroller` | Item size is fixed or precomputed, or items expose a numeric size field for variable-size mode. | You need automatic measurement of unknown item sizes. |
| `DynamicScroller` | Item sizes are not known ahead of time and should be discovered during rendering. | You can provide a stable fixed size and want the lightest path. |
| `DynamicScrollerItem` | You are rendering children inside `DynamicScroller` and need size measurement updates. | You are not inside `DynamicScroller`. |
| `useRecycleScroller` | You need the virtualization engine but want custom markup, styling, or rendering control. | The slot-based component APIs already fit the UI. |

## Setup

`vue-virtual-scroller` targets Vue 3 and ships ESM only. Use it with an ESM-aware toolchain such as Vite, Nuxt, Rollup, or webpack 5.

```sh
pnpm add vue-virtual-scroller@next
```

Always import the package CSS:

```js
import 'vue-virtual-scroller/index.css'
```

Install all bundled components:

```js
import { createApp } from 'vue'
import VueVirtualScroller from 'vue-virtual-scroller'

const app = createApp(App)
app.use(VueVirtualScroller)
```

Or register/import only what you need:

```js
import { RecycleScroller } from 'vue-virtual-scroller'

app.component('RecycleScroller', RecycleScroller)
```

## Workflow

1. Decide whether sizes are known.
2. If sizes are fixed or already available on each item, start with `RecycleScroller`.
3. If sizes are unknown and discovered after render, use `DynamicScroller` with `DynamicScrollerItem`.
4. If the component slot structure is too limiting, switch to `useRecycleScroller`.
5. Set explicit scroll-container sizing and item sizing before debugging performance.

## Sizing rules

- The scroller element itself must have a real scrollable size such as a fixed `height` or `width` plus overflow.
- In `RecycleScroller`, all items should have the same size unless you intentionally use variable-size mode with `itemSize: null` and a numeric item field such as `size`.
- In `DynamicScroller`, `minItemSize` is required for initial layout.
- Horizontal lists use the same primitives, but sizing constraints apply on width instead of height.
- Grid mode is only supported with `RecycleScroller` and fixed item sizing.

## Practical guidance

### Fixed-size vs unknown-size

- Prefer `RecycleScroller` for tables, simple rows, and card lists where row height or card extent is stable.
- Use `RecycleScroller` variable-size mode only when the item already knows its size and can expose it through `sizeField`.
- Prefer `DynamicScroller` when the DOM must measure content, such as chat messages or cards whose rendered content changes height.

### Rendering pitfalls

- Reused views mean child components must react correctly when `item` changes; do not assume a fresh component instance per row.
- Functional components inside `RecycleScroller` are discouraged because reuse makes them slower, not faster.
- Do not add unnecessary `key` values to the immediate list content, but do key nested images to avoid load glitches.
- Use the provided `hover` class for hover styling instead of relying on `:hover` against recycled DOM nodes.

### Performance guardrails

- Variable-size mode in `RecycleScroller` can be expensive on very large lists.
- `watchData` on `DynamicScrollerItem` is documented as not recommended because deep watching can hurt performance.
- `emitUpdate` on `RecycleScroller` and `emitResize` on `DynamicScrollerItem` add extra work; keep them off unless the UI needs those events.
- Browsers still impose large-element size limits, so extremely large lists can hit practical limits around hundreds of thousands of items.

### Common patterns

- Chat feeds and append-heavy timelines map well to `DynamicScroller` plus `DynamicScrollerItem`.
- Multi-column card galleries map to `RecycleScroller` grid mode with `gridItems` and `itemSecondarySize`.
- Horizontal virtualized cards map to `DynamicScroller` with `direction="horizontal"` when widths are content-driven.
- Design-system integrations or nonstandard DOM trees map to `useRecycleScroller`.

## Scope limits

This skill intentionally focuses on the documented public surfaces:

- setup and installation
- `RecycleScroller`
- `DynamicScroller`
- `DynamicScrollerItem`
- `useRecycleScroller`

Do not infer undocumented behavior for these exported surfaces without updating docs first:

- `useDynamicScroller`
- `useDynamicScrollerItem`
- `useIdState`
- plugin install options beyond the documented setup path

## References

| Topic | Description | Reference |
|---|---|---|
| Installation and setup | Vue 3 setup, ESM-only constraint, CSS import, and component registration paths. | [references/installation-and-setup.md](./references/installation-and-setup.md) |
| RecycleScroller | Fixed-size lists, variable-size mode with explicit size fields, grid mode, page mode, and core events. | [references/recycle-scroller.md](./references/recycle-scroller.md) |
| DynamicScroller | Unknown-size rendering strategy and when to move off the fixed-size path. | [references/dynamic-scroller.md](./references/dynamic-scroller.md) |
| DynamicScrollerItem | Size measurement wrapper behavior, dependencies, and resize events. | [references/dynamic-scroller-item.md](./references/dynamic-scroller-item.md) |
| useRecycleScroller | Headless virtualization API for custom DOM structures. | [references/use-recycle-scroller.md](./references/use-recycle-scroller.md) |
| Reference index | Overview of all shipped references. | [references/index.md](./references/index.md) |

## Further reading

- [references/installation-and-setup.md](./references/installation-and-setup.md)
- [references/recycle-scroller.md](./references/recycle-scroller.md)
- [references/dynamic-scroller.md](./references/dynamic-scroller.md)
- [references/dynamic-scroller-item.md](./references/dynamic-scroller-item.md)
- [references/use-recycle-scroller.md](./references/use-recycle-scroller.md)
