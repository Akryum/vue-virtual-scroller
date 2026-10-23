# Plan 04: one recycler owner for DynamicScroller component

## Status: conditional experiment

Source inspection found a distinct duplication:

- `useDynamicScroller.ts:834` constructs `useRecycleScroller` for headless pool/geometry/helpers.
- `DynamicScroller.vue:150` renders `RecycleScroller`, which constructs its own engine in setup.
- Activity-feed and horizontal component workloads follow both paths. Customer table uses headless composable directly and does not have this particular duplicate.

Traces show hot recycler computations but do not distinguish exact instance contribution. Do not claim two times cost or guaranteed improvement. First measure whether redundant ownership remains material after plans 02/03. This plan is deferred if its gate fails.

## Diagnostic gate

1. Use private diagnostic-only owner labels around engine setup, structural reconciliation and size publication. Unique labels and workload scope, no live counters or per-frame DOM scan. Build instrumentation in separate ignored output; do not put unguarded marks/counters into shipped hot paths.
2. Capture activity-feed/horizontal component and headless-table control under same settings. Confirm active engine lifetimes and which instances perform size/key work, scroll listeners and pooled state updates.
3. Separate source fact (two calls) from useful work (rendering owner versus unrendered headless owner). Measure incremental stack/event cost, not only constructor count.
4. Continue only if duplicate work is material in remaining CPU time or blocks a correctness simplification. Explain target and comparison before refactor. If not material, retain evidence and stop this plan.

## Chosen implementation if gate passes

Keep one headless recycler as authoritative geometry/pool owner, with a private shared viewport renderer. Do not disable one engine while leaving exposed methods tied to it, or implement a second hand-written DOM renderer in DynamicScroller.

Files, responsibilities and contracts:

- New internal `src/components/ScrollerViewport.vue`: presentational root/list/flow spacers/pooled items/slots, hover state, existing resize/visibility directives. Receives existing rendering context; never calls `useRecycleScroller` or `useDynamicScroller`.
- New `src/components/scrollerViewportContext.ts`: private generic render contract with refs to element/before/after, pool/visible pool, size/readiness, style helper, resize/visibility callbacks and required presentation options. JSDoc fields; no package export.
- `src/components/RecycleScroller.vue`: public props/events/exposed API retained; builds one engine then passes context to private renderer. Preserve root element exposure and attribute forwarding.
- Extract dynamic internal factory from `useDynamicScroller.ts` into focused private modules as required by size limit. It returns `{ publicState, renderState }` within setup. Existing public `useDynamicScroller` wrapper returns only current public state. `DynamicScroller.vue` imports private factory and uses its renderState, avoiding public return-type expansion.
- `src/components/DynamicScroller.vue`: use same private renderer and original `ItemWithSize` slot adapter. Preserve props, `$attrs`, slots, `forceUpdate`, cache and scroll helpers; dynamic exposed helpers operate on the single authoritative engine.
- Shared scroller styles remain same public CSS; template changes must not break scoped IDs/directive attachment. No decorative UI edits.

Factory and renderer must share one set of refs from start of setup. Do not find root by querying arbitrary descendant DOM. Mount root into same ref used by engine/listener/measurement owner. Before/after slots must use corresponding engine refs, not renderer-local unconnected copies.

## Migration sequence

1. Characterize public wrapper behavior in real browsers before extraction. Reuse existing component E2E, append-state retention and headless tests; add only missing wrapper-specific contracts.
2. Extract `ScrollerViewport` with direct `RecycleScroller` first; keep exactly one owner and compare actual roots/row content/flow layout. Public entry continues to produce same element and events.
3. Extract dynamic factory preserving current headless behavior. Test component and composable package subpath consumption; internal factory stays unexported.
4. Switch DynamicScroller to shared viewport renderer with its own authoritative raw engine context. Map slots to original underlying item/index/active, retaining wrapper identity for measurement.
5. Audit all forwarded `$attrs` previously consumed by nested `RecycleScroller`: buffer, item/type fields, update interval, prerender, emit update, custom tags/classes, page/scroll parent and event callbacks. Resolve precedence exactly as current nested binding order; unsupported/silent-drop behavior is not acceptable.
6. Verify component helpers and rendered pool use identical cache/total/range state. No shadow engine retained just for scroll helpers.
7. Teardown one listener/observer/measurement lifetime exactly once; KeepAlive activation/deactivation, disabled-to-enabled and unmount during pending measurement remain correct.
8. Remove obsolete nested component ref/adapter only after tests show equivalent behavior. Avoid a large unrelated style or props refactor.

## Acceptance scenarios

Entry is real public `DynamicScroller` or `RecycleScroller`, including public subpath exports; browser geometry and framework lifecycle remain real.

- `scrollToItem` via exposed component ref reveals exact ID; cache snapshot describes actual visible dataset, not a second unrendered owner. Wrong-owner helper fault must fail this assertion.
- Select a row and retain a stateful child input; append then long wheel traversal and return; content/selection/local child state remain attached to intended key, distinct neighboring record unchanged.
- Prepend and delayed measurements preserve ID+pixel anchor; both vertical and horizontal dynamic content expand/collapse without missing visible entries or overlap.
- Before/after/empty slots, custom tags/classes/attrs, page-mode nested parent and Window cases retain actual content and correct scroll owner. Assert behavior, not class strings unless class forwarding itself is public contract.
- Events occur with expected payload/order through real user scrolling and resize; do not accept duplicate resize/update deliveries caused by leftover ownership.
- Mount two/nested scrollers, unmount one with pending measurement, resize/scroll remaining one; surviving consumer stays correct, stale work cannot revive disposed owner. Repeat after disabled toggle and fresh mount.
- Direct fixed-size list/grid, flow table and sparse 160×160 matrix retain DOM bounds and default guard. Headless table remains unchanged functionally.

Fault probes: route exposed jump to unused engine, disconnect renderer/engine element ref, or drop leading-slot ref. Require wrong target/offset/scroll-owner assertion. Construction call-count tests alone are not acceptance proof. Reuse isolated probe protocol from plan 05.

## Performance and exit

Compare component workloads before/after extraction with plans 02/03 held constant. Verify CPU attribution formerly belonging to duplicate owner is absent and measured scroll/action timings improve or remain acceptable. Headless-table control should not mysteriously improve from a component-only change; investigate inconsistent environment if it does.

No public API/return-type change, no hidden buffer/DOM expansion, and no regression masked by test updates. If complexity outweighs measured benefit, defer renderer extraction; plans 01–03 remain independently useful.
