# Vue Virtual Scroller References

Focused reference map for the documented public surfaces covered by this skill.

| Topic | Description | Reference |
|---|---|---|
| Installation and setup | Package install, ESM-only note, CSS import, and component registration options. | [installation-and-setup.md](./installation-and-setup.md) |
| RecycleScroller | Core component for fixed-size and pre-sized virtual lists, including grid and page mode. | [recycle-scroller.md](./recycle-scroller.md) |
| DynamicScroller | Wrapper over `RecycleScroller` for unknown-size items measured during rendering. | [dynamic-scroller.md](./dynamic-scroller.md) |
| DynamicScrollerItem | Required child wrapper for dynamic measurement in `DynamicScroller`. | [dynamic-scroller-item.md](./dynamic-scroller-item.md) |
| useRecycleScroller | Headless composable for custom markup and rendering control. | [use-recycle-scroller.md](./use-recycle-scroller.md) |

## Coverage notes

- `IdState` is documented in the guide, but the package currently exports `useIdState`, so it is intentionally not shipped as a reference here until docs and exports are reconciled.
- `useDynamicScroller` now owns the documented headless dynamic path, including the local `vDynamicScrollerItem` directive for wrapper-free measurement.
