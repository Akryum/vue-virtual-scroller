---
name: vue-virtual-scroller
description: Use this skill for Vue 3 virtual scrolling with vue-virtual-scroller, important for good performance with a lot of data, including RecycleScroller, DynamicScroller, DynamicScrollerItem, WindowScroller, useRecycleScroller, useDynamicScroller, and useWindowScroller for fixed-size lists, unknown-size rows, grids, chat feeds, tables, and page-scrolling layouts.
---

# Vue Virtual Scroller

Use this skill when a task involves large Vue lists, DOM reuse, windowed rendering, or choosing between `RecycleScroller`, `DynamicScroller`, `WindowScroller`, and the headless helpers.

## Quick choice

| Surface | Use it when | Avoid it when |
|---|---|---|
| `RecycleScroller` | Item size is fixed, precomputed, or available from a numeric field or resolver. | The DOM must measure unknown item size after render. |
| `DynamicScroller` | Item size is unknown before render and should be measured automatically. | A fixed-size or pre-sized path already works. |
| `DynamicScrollerItem` | You are rendering children inside `DynamicScroller` and the wrapper fits the markup. | You need wrapper-free semantics such as table rows. |
| `WindowScroller` | The browser window should drive scrolling for the component path. | The list should own its own scroll container. |
| `useRecycleScroller` | You need the virtualization engine with custom markup for known-size or pre-sized items. | The slot-based components already fit the UI. |
| `useDynamicScroller` | You need wrapper-free unknown-size measurement with custom markup or semantic table rows. | `DynamicScroller` plus `DynamicScrollerItem` already fits the UI. |
| `useWindowScroller` | The page should keep scrolling, but you still need headless control over markup and wrappers. | An inner scroll container is acceptable. |

## Setup

`vue-virtual-scroller` targets Vue 3, ships ESM only, and requires Vue 3.3+ for the generic component typing surface. Use it with an ESM-aware toolchain such as Vite, Nuxt, Rollup, or webpack 5.

```sh
pnpm add vue-virtual-scroller
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
import { RecycleScroller, WindowScroller } from 'vue-virtual-scroller'

app.component('RecycleScroller', RecycleScroller)
app.component('WindowScroller', WindowScroller)
```

## Workflow

1. Decide whether sizes are known before render.
2. If sizes are fixed or already stored in data, start with `RecycleScroller` or `useRecycleScroller`.
3. If sizes are unknown until the DOM renders, use `DynamicScroller` or `useDynamicScroller`.
4. If the page owns scrolling, prefer `WindowScroller` or `useWindowScroller`.
5. Set explicit scroll sizing, item sizing, and keying before debugging performance.

## Sizing rules

- The scrolling surface must have real dimensions. Inner-scroll paths need a sized container plus overflow.
- `RecycleScroller` supports fixed numeric `itemSize`, `itemSize: null` with `sizeField`, or an `itemSize(item, index)` resolver.
- `DynamicScroller` and `useDynamicScroller` require `minItemSize` for initial layout.
- `gridItems` only works with fixed numeric `itemSize`.
- Horizontal lists follow the same rules, but sizing applies on width instead of height.
- `flowMode` is a vertical single-axis native-flow path. Use spacer elements from `startSpacerSize` and `endSpacerSize` instead of an absolutely positioned inner wrapper.

## Practical guidance

### Fixed-size vs unknown-size

- Prefer `RecycleScroller` for tables, simple rows, grids, and card lists where size is stable or already known in memory.
- Use `DynamicScroller` for message feeds, cards, or rows whose rendered content changes height after filtering, editing, or streaming.
- Use headless helpers when the bundled wrapper markup gets in the way of semantics or design-system constraints.

### Component vs headless

- Stay on component APIs when the default slot structure already fits the UI.
- Move to `useRecycleScroller` for custom markup with known sizes.
- Move to `useDynamicScroller` for wrapper-free measurement, especially semantic tables and custom row shells.
- Move to `useWindowScroller` when page scrolling is intentional and wrapper control still matters.

### Rendering pitfalls

- Reused views mean child components must react when `item` changes; do not assume a fresh instance per row.
- Render from `pool`, not `visiblePool`, on headless paths when you want normal recycling behavior.
- Prefer targeted `sizeDependencies` over deep `watchData`.
- On headless dynamic paths, render from `view.item`. Reach for `view.itemWithSize` only when you need measured metadata.
- Key nested images, but do not add unnecessary keys to the immediate recycled content.

### Performance guardrails

- `emitUpdate`, `emitResize`, and `watchData` add work; keep them off unless the UI needs them.
- Variable-size mode in `RecycleScroller` is heavier than fixed-size mode.
- `DynamicScroller` is heavier than fixed-size virtualization, so use it only when measurement is necessary.
- Browsers still impose large-element limits, so extremely large lists can hit practical ceilings.

### Common layouts

- Chat feeds and append-heavy timelines map well to `DynamicScroller` or `useDynamicScroller`.
- Multi-column card galleries map to `RecycleScroller` grid mode.
- Page-level search results or article feeds map to `WindowScroller` or `useWindowScroller`.
- Semantic tables map to `useDynamicScroller` or `useRecycleScroller` with `flowMode`, plus `useTableColumnWidths` to lock columns after measurement.
- Custom design-system row components map to the headless helpers.

## Scope limits

This skill intentionally focuses on documented public surfaces:

- setup and installation
- `RecycleScroller`
- `DynamicScroller`
- `DynamicScrollerItem`
- `WindowScroller`
- `useRecycleScroller`
- `useDynamicScroller`
- `useWindowScroller`
- `useTableColumnWidths`

Do not infer undocumented behavior for these exported surfaces without updating docs first:

- `useIdState`
- `useDynamicScrollerItem`
- plugin install options beyond the documented setup path

## References

| Topic | Description | Reference |
|---|---|---|
| Installation and setup | Vue 3.3+, ESM-only setup, CSS import, and registration paths. | [references/installation-and-setup.md](./references/installation-and-setup.md) |
| RecycleScroller | Fixed-size and pre-sized virtualization, grids, cache restore, and older page mode. | [references/recycle-scroller.md](./references/recycle-scroller.md) |
| DynamicScroller | Unknown-size component path that measures items after render. | [references/dynamic-scroller.md](./references/dynamic-scroller.md) |
| DynamicScrollerItem | Measurement wrapper used inside `DynamicScroller`. | [references/dynamic-scroller-item.md](./references/dynamic-scroller-item.md) |
| WindowScroller | Window-based component path for page scrolling. | [references/window-scroller.md](./references/window-scroller.md) |
| useRecycleScroller | Headless fixed-size and pre-sized virtualization. | [references/use-recycle-scroller.md](./references/use-recycle-scroller.md) |
| useDynamicScroller | Headless unknown-size virtualization with wrapper-free measurement. | [references/use-dynamic-scroller.md](./references/use-dynamic-scroller.md) |
| useWindowScroller | Headless window-based virtualization. | [references/use-window-scroller.md](./references/use-window-scroller.md) |
| useTableColumnWidths | Semantic table helper that locks measured column widths. | [references/use-table-column-widths.md](./references/use-table-column-widths.md) |
| Reference index | Overview of all shipped references. | [references/index.md](./references/index.md) |

## Further reading

- [references/installation-and-setup.md](./references/installation-and-setup.md)
- [references/recycle-scroller.md](./references/recycle-scroller.md)
- [references/dynamic-scroller.md](./references/dynamic-scroller.md)
- [references/dynamic-scroller-item.md](./references/dynamic-scroller-item.md)
- [references/window-scroller.md](./references/window-scroller.md)
- [references/use-recycle-scroller.md](./references/use-recycle-scroller.md)
- [references/use-dynamic-scroller.md](./references/use-dynamic-scroller.md)
- [references/use-window-scroller.md](./references/use-window-scroller.md)
- [references/use-table-column-widths.md](./references/use-table-column-widths.md)
