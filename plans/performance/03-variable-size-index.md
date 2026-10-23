# Plan 03: incremental variable-size geometry

## Decision and prerequisite

Implement after plan 02 only if new traces still show full variable-size prefix rebuilds as material scroll/update cost. Original trace shows ~896ms sampled inclusive in that computation over one 10,000-item feed scroll; this establishes motivation, not guaranteed benefit after other changes.

Use an internal segment tree for the certified owned-dynamic sequence. A node stores sum and minimum effective size. This provides prefix sums, minimum size and offset search without rebuilding all accumulators. Generic `RecycleScroller` with arbitrary `itemSize` resolver/size-field dependencies retains existing implementation first; fixed-size/grid path stays arithmetic.

Why this design: recomputing an array suffix from first changed row remains O(N) when scrolling near the start. Fenwick tree would solve sums but require separate minimum-size bookkeeping. One sum/min tree avoids two independent structures. Do not introduce an external data-structure dependency.

## Complexity contract

Let N be logical records and K distinct changed positions in a measurement commit:

- Initial build / arbitrary sort / prepend / full filter replacement: O(N), using bottom-up build.
- Size-only update batch: O(K log N); no full item/key walk or eagerly materialized accumulator list.
- Prefix offset / index lookup: O(log N), total size / minimum size: O(1).
- Append: extend existing capacity; capacity grows geometrically and may rebuild O(N). Keep existing rendered view identities. Do not implement a risky rope/chunked collection in this slice.
- Public legacy `sizes` snapshot: O(N) only when consumed, using one linear pass over leaf sizes, not N prefix queries. Internal hot paths must not request this adapter.
- Storage O(N), bounded by capacity and existing cached records; cleanup releases owner subscriptions. No memory performance claims without a separate measurement plan.

## Files

New internal modules, each below 300 lines, with JSDoc for methods, bounds and zero-size semantics:

- `src/engine/sizeIndex.ts`: pure sum/min segment tree, update batch, prefix and boundary search.
- `src/engine/sizeIndex.spec.ts`: known examples and deterministic stateful operations against independent slow prefix model; reuse shared RNG if needed.
- `src/composables/useDynamicSizeIndex.ts`: Vue revision subscription, structural resets, effective-size resolution, lazy legacy `Sizes` view. Uses plan 02 bridge, no second registry or per-row watchers.
- `src/composables/dynamicScrollerSequence.ts`: extend existing sequence consumer contract for coherent structural/size batches if needed.
- `src/composables/useRecycleScroller.ts`: route private dynamic queries through index, retain generic fallback. Extract variable window search to a small `src/engine/variableWindow.ts` if needed to avoid spreading duplicated boundary math; test observable ranges, not helper call counts.
- Existing `src/engine/cache.ts`, `utils/itemSize.ts`, `types.ts`: reuse established key/cache/size resolution. Public `Sizes`, `SizeEntry` and composable return signatures stay unchanged.
- New `packages/benchmarks/tests/browser/dynamic-offsets.spec.ts`: real scrolling/expansion/anchoring/cache consumer scenarios absent from current suite. Reuse plan 02 fixture rather than another copy.

## Pure algorithm contract

Proposed internal methods (not public API):

```ts
/** Prefix geometry with nonnegative finite effective sizes. */
interface SizeIndex {
  /** Logical count, excluding capacity padding. */
  readonly length: number
  /** Sum of logical sizes. */
  readonly total: number
  /** Exact minimum effective size; handle empty collection explicitly. */
  readonly minimum: number
  /** Replace a complete structural snapshot, preserving no stale leaves. */
  rebuild: (sizes: readonly number[]) => void
  /** Apply latest value for each changed logical position. */
  updateMany: (changes: ReadonlyMap<number, number>) => void
  /** Sum of sizes before index, clamped to [0, length]. */
  offsetBefore: (index: number) => number
  /** Greatest logical start index with start offset <= offset, clamped. */
  indexAtOffset: (offset: number) => number
  /** Read logical effective size without generating prefix snapshot. */
  sizeAt: (index: number) => number | undefined
}
```

Use `Float64Array` numeric nodes or ordinary numbers; do not truncate sums to 32-bit values. Existing measurement rounds item dimensions, but long-list totals can exceed 32-bit limits. Capacity padding contributes zero sum and +Infinity minimum; exclude it from returned indices. Deduplicate K updates before walking ancestor paths. Avoid rebuilding tree to read `minimum`.

Examples fixed before implementation:

- Sizes `[80,120,40,160]`: starts `[0,80,200,240]`, total 400. `indexAtOffset`: 0→0, 79→0, 80→1, 199→1, 200→2, 240→3, 400→3; negative offset clamps to first logical index.
- Change index 1 to 180: starts `[0,80,260,300]`, total 460; index 0/2/3 sizes unchanged.
- Sizes `[0,80,0,120]`: equal starts are allowed; offset 0 selects index 1, offset 80 selects index 3 for this method's rightmost-start contract. Render-end search has its own strict/inclusive contract and must not blindly reuse this method.
- Empty collection: total 0, no valid leaf; preserve public `findItemIndex` empty result 0 via adapter. Minimum empty sentinel handled explicitly in caller.

For negative/nonfinite effective sizes or unsupported configurations, use correct legacy fallback. Do not silently clamp input and change public behavior in a performance patch. Dynamic measured positive dimensions/minimum estimates are primary fast path.

## Integration steps

1. Add pure tests and an independently specified window-boundary test set first. Preserve exact existing inclusivity at item edges, buffer edges and zero-height runs; `findItemIndex` and render-range search are not interchangeable.
2. Build index using exact current effective-size precedence from `resolveVariableItemSize`, including cache restore, min size and unknown measured entries. Do not prefer live measurement over restored cache if existing contract does otherwise. Preserve legacy `_computedMinItemSize` cap (currently initialized to 10,000) in adapter rather than silently changing scroll-threshold policy to the uncapped exact tree minimum.
3. Subscribe to plan 02 coherent size batches. Apply all K index changes before publishing geometry revision. A consumer encountering an unread structural revision must rebuild first; never apply old index deltas to reordered items.
4. Preserve generic fallback for arbitrary item-size functions and raw consumer mutations. Do not use `toRaw` to suppress dependencies of generic size/key resolvers.
5. Audit every internal `sizes.value` and `_computedMinItemSize` read in `useRecycleScroller.ts`. Replace owned-path reads in `getItemSize`, `getItemOffset`, `findItemIndex`, flow hysteresis, render/visible range search, total size, scroll-to alignment and snapshot building. An unnoticed eager `sizes.value` read defeats this optimization.
6. Readiness remains structural: before matching structural snapshot is installed, retain/clamp last good range as current sparse-cache recovery does. Do not interpret stale last leaf as current validity. Publish count, leaf sizes and total atomically.
7. Build a lazy compatibility `sizes` computed for external consumers. Preserve index -1 base sentinel, `.size` and `.accumulator`, public types and reactivity when sizes change. Preserve effective size fallback distinctions exposed by existing API. Materialize linear prefix only when requested; avoid Proxy objects masquerading as arrays.
8. Keep snapshots portable: `cacheSnapshot` reads ordered keys and effective sizes without layout or legacy accumulator materialization. Restoring mismatched keys/reordered data uses existing cache mapping. No private tree nodes serialized in cache.
9. Capture anchor on old geometry before applying batch, then compute new offset from indexed prefix after batch. Keep prepend anchor correction and public jump alignment (`start/center/end/nearest`, optional offset) unchanged. Preserve before/after slot offsets and page/window owner.
10. Treat direction, key-field change, whole-size-record reset, disable/re-enable and cache replacement as explicit invalidations. Dispose bridge subscriptions on lifecycle teardown, and synchronously flush pending metadata for public geometry calls.
11. Remove obsolete full-prefix work only on private owned path. Keep old generic computation isolated and tested; do not pay for both on each update. Do not alter fixed-size/grid branch or rendered-view limit.

## Verification and failure probes

Pure real-algorithm tests:

- Exact examples above; update two nonadjacent indices, repeated same-value update, minimum increases/decreases, empty/rebuild/shrink/append across capacity boundary.
- Deterministic operation sequence mixes size changes with full reorder/remove/prepend rebuilds. Compare each prefix/total/selected boundary to a tiny independent linear-sum model with literal boundary examples. Model must not call production tree/resolver to calculate expected values.
- Large totals above 2^31; fractional sizes; long zero runs; all sizes above legacy 10,000 threshold cap; no padded leaf returned. Assert unaffected values explicitly.

Real-browser consumer tests in both engines:

- Deep jump to a known stable ID at index far beyond first viewport; actual content visible, preceding/following row geometry correct.
- Expand two different visible rows and a measured row above viewport; assert new heights, no overlaps/gaps and stable anchor ID/offset, unaffected content preserved.
- Append/prepend/sort/filter/update100 in sequence, with anchor corrections and selected record retained; current per-action reset benchmark is insufficient alone to cover mutation sequence corruption.
- Cache snapshot and restore on fresh same-data consumer; reordered/missing keys safely remapped, no stale offsets. Public `sizes` consumer sees expected sentinel/accumulators after update.
- Narrow viewport and horizontal measured widths; both correct scroll owner and target content. Retain window offset, flow-table idle stability and sparse 160×160 matrix tests.

Probe one wrong ancestor sum, off-by-one boundary search, and stale structural-revision application in isolated sources. Require wrong visible target/offset or precise algorithm assertion; syntax/setup failures do not count. No timing threshold in correctness tests.

## Exit gate

Reprofile activity-feed and headless table at 10,000 with exactly original scripted path. Full-prefix attribution should disappear on measured-size updates without reappearing under lazy `sizes` adapter. Performance target from index README applies to combined plans 02/03; inspect phase medians and RAF distributions separately. Rebuild once per structural mutation is expected and not hidden.

Run focused tests, public type/export checks and final suite from plan 05. If fast path does not beat a simpler implementation consistently, keep proven correctness work and defer tree integration; do not claim asymptotic improvement without actual hot-path adoption.
