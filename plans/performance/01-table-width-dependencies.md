# Plan 01: explicit table width invalidation

## Outcome and scope

Remove deep traversal of the benchmark's entire customer dataset when viewport width changes. Both renderers retain the same explicit native-measure-and-lock column policy. Existing `useTableColumnWidths` defaults and arbitrary nested dependency behavior stay compatible.

Existing `docs/.vitepress/components/demos/HeadlessTableDocDemo.vue` already uses scalar dependencies (`count`, `filter`, `buffer`); reuse that pattern without changing its behavior. This slice improves benchmark/example usage of an existing API. It does not make every consumer of the composable faster. A later opt-out API would be a separate public design decision, not part of this plan.

Evidence: table 10,000 virtual resize took 400ms under tracing, including ~155ms sampled inclusive `traverse`, while Layout took ~2ms. Uninstrumented resize median 250ms (217–300ms, three runs). See [evidence](./evidence.md).

## Files

- Modify `packages/benchmarks/workloads/state.ts`: add documented `contentRevision: number`, initially zero. Increment once after `update()` publishes changed records. This state is not rendered as a counter.
- Modify `packages/benchmarks/workloads/CustomerTable.vue`: replace full-row dependency with scalar invalidations below. Keep the same call for virtual and plain branches; keep headless virtualizer absent in plain mode.
- Add `packages/benchmarks/tests/browser/table-width-policy.spec.ts`: production table actions, real geometry, both rendering modes and browsers.
- Extend `packages/benchmarks/tests/data.test.ts` only for revision semantics if its existing state tests provide the correct boundary; otherwise a small `state.test.ts`. Do not duplicate deterministic generators.
- Update benchmark README to document explicit width invalidations, same-mode policy, and baseline break.
- Do not rewrite `useTableColumnWidths.spec.ts` or change library watcher default. Existing mocked rectangles are not new browser proof.

## Implementation

1. Capture current-policy baseline using plan 05, including both table modes. Preserve traces before rebuilding.
2. Write real state tests first: `update()` changes 100 accounts, leaves an unaffected account untouched, and advances content revision once. Selection does not advance revision. Keep existing content/update expectations.
3. Replace width dependency getter with scalar values:

   ```ts
   const { columnWidths, tableStyle } = useTableColumnWidths({
     table,
     dependencies: () => [
       props.model.state.width,
       props.model.state.filtered,
       props.model.state.sorted,
       props.model.state.contentRevision,
     ],
   })
   ```

4. Increment `contentRevision` in the actual record update handler, in the same synchronous state change as record replacement. Vue batches resulting DOM update before the existing post-flush watcher schedules measurement. Do not introduce a second RAF loop.
5. Keep reset/mount semantics: new state creates revision zero, and table's existing element watcher performs initial measurement. No special initial increment.
6. Audit all table mutation entry points. Current controller changes filter, sort, width and invokes `update`; row interaction only changes selection. Future edits/import/replacement of account data must also increment content revision or use a shared state method that does. Do not add a deep row watcher to manufacture the revision.
7. Do not add pool membership or scroll position to width dependencies. Current composable intentionally retains widths across row churn until explicit invalidation. Keep this behavior; changing it would add scroll-time measurement and change policy.
8. Keep automatic table-element ResizeObserver, disabled/enabled behavior and explicit `scheduleMeasure()` untouched.

## Invalidation contract

| Trigger | Remeasure columns? | Reason |
| --- | --- | --- |
| Initial table mount/replacement | Yes | Existing element watcher |
| Viewport 960→720 | Yes | Width token; existing observer also deduplicates |
| Region filter | Yes | Matching dataset changes |
| Revenue sort | Yes | Preserve current explicit dependency behavior |
| Account text/revenue update | Yes | Content revision |
| Selection checkbox | No | Same text and checkbox dimensions |
| Pooled row scroll churn | No | Existing locked-width policy |
| Reset/new case | Yes | Fresh table mount |

Do not promise automatic arbitrary deep record mutation for this benchmark's explicit scalar contract. That behavior remains available to library consumers passing deep dependencies; no library semantics are removed.

## Useful tests and fault sensitivity

Use real production bundle and shared `openCase`; avoid fixed sleeps, DOM-class assertions, timer/ResizeObserver/scroller mocks. Geometry is functional behavior for a table: header and body cell alignment, row overlap and visibility matter.

1. **Region filter / sort / account update / resize**: both modes, record 1 and a distinct unaffected record; verify exact contents and membership/order, then header/body corresponding cell boundaries agree within 1px after settling. Assert no row overlap, width remains usable at 720px. Preserve ordinary full plain DOM and bounded virtual roots.
2. **Explicit content invalidation**: use a 101-record fixture with record 1 revenue `9_999_999_900` cents and all other revenue values small. Existing `update()` adds 100 cents, changing formatted record 1 from `$99,999,999` to `$100,000,000`; record 101 is outside the update set. This grows an unbroken value already wider than revenue header. Also verify actual title/notes update and unchanged record 101. After the action, compare locked column boundaries to a real untimed native-auto-layout reference built from identical currently mounted rows/width/CSS, without colgroup locks. Require a demonstrated revenue-column difference from pre-update native geometry before accepting fixture. This rejects omitted revision even if ordinary header/body alignment would still hold with stale locked widths. No fake rectangles or changes to workload update algorithm.
3. **Stable width during scroll churn**: capture locked column widths, wheel far enough to recycle records, assert new IDs/content and unchanged column widths. Do not equate new DOM row count with recycling proof.
4. **Selection remains local**: selecting one row changes its checkbox, leaves another unchecked, and does not force a new column policy. No watcher call-count assertion is required.
5. **Deep API compatibility**: retain existing library test contracts; add a real-browser consumer case for a nested dependency mutation if public watcher implementation is touched later. This slice should not touch it.

For test 2, add one small production-built test-only table fixture using actual `CustomerTable`, state factory, independently specified initial account values, and a button invoking existing `model.update()`; include its HTML in benchmark build inputs. Keep fixture controls outside measured document, use neither alternate row components nor fake geometry. Avoid adding testing methods to `window.benchmark`.

Preflight: public boundary is actual account table/action; defect is omitted revision increment; independent oracle is changed account content plus native measured column geometry. Probe missing content revision in isolated copy; require stale-column assertion failure. A missing width token might be harmless because real ResizeObserver also covers width changes: retain resize behavior test, but do not score a redundant fallback as a required fault failure. A profile showing no `traverse` does not prove correctness.

## Performance evaluation and exit

- Rerun both table modes at 1,000 and 10,000, both browsers, matched paired baseline/candidate protocol. Changing policy can improve plain mode too; report it separately.
- Trace virtual resize with original profiler settings. Expect width-policy traversal to disappear; other dynamic-scroller tracking can remain. Compare Layout, traversal attribution, settled resize, sort/update/mount independently.
- Target ≥30% lower median table resize at 10,000 versus newly matched old-policy baseline. Do not compare candidate directly to a single 400ms traced figure or call this a general library speedup.
- Correctness and failure-sensitive geometry proof must pass even if target unmet. If content invalidation is unreliable, fix ownership of invalidation rather than restore a full-row watch without documenting the tradeoff.
- Run focused unit/browser checks and required validation from plan 05. No source API changes, commits or pushes unless requested.
