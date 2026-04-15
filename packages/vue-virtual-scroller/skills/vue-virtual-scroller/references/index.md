# Vue Virtual Scroller References

Focused reference map for the documented public surfaces covered by this skill.

| Topic | Description | Reference |
|---|---|---|
| Installation and setup | Package install, Vue 3.3+ and ESM-only notes, CSS import, and registration paths. | [installation-and-setup.md](./installation-and-setup.md) |
| RecycleScroller | Core component for fixed-size and pre-sized virtualization, including grid mode and cache restore. | [recycle-scroller.md](./recycle-scroller.md) |
| DynamicScroller | Component path for unknown-size items measured after render. | [dynamic-scroller.md](./dynamic-scroller.md) |
| DynamicScrollerItem | Per-item measurement wrapper used inside `DynamicScroller`. | [dynamic-scroller-item.md](./dynamic-scroller-item.md) |
| WindowScroller | Component path for lists driven by browser window scrolling. | [window-scroller.md](./window-scroller.md) |
| useRecycleScroller | Headless virtualization for custom markup with known or pre-sized items. | [use-recycle-scroller.md](./use-recycle-scroller.md) |
| useDynamicScroller | Headless dynamic measurement path with `vDynamicScrollerItem`. | [use-dynamic-scroller.md](./use-dynamic-scroller.md) |
| useWindowScroller | Headless window-scrolling virtualization. | [use-window-scroller.md](./use-window-scroller.md) |

## Coverage notes

- `useIdState` is still intentionally omitted because the docs and exported name are not reconciled yet.
- `useDynamicScrollerItem` is exported, but it does not have a dedicated public guide page yet, so it is not shipped as a standalone reference.
- Plugin install options beyond the documented setup path are still intentionally out of scope.
