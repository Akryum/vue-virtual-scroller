# Plan 02: separate structural reconciliation from size updates

## Outcome

After a measured row changes size, update that row's metadata and notify layout once per coherent batch. Do not re-read every item/key/type or clone the full wrapper array solely because a known row was measured. Retain O(N) structural reconciliation for actual collection changes where necessary.

Evidence: feed scroll at 10,000 mounts 9 roots but has 67–83ms uninstrumented p95 intervals. Traces attribute ~880ms inclusive to dynamic synchronization and ~896ms to variable-size prefixes over one scripted scroll. Vue tracking/cleanup dominates. Existing queue already reads before writes and limits six tasks per flush; another generic batching queue is not the missing feature.

This slice removes wrapper/identity amplification. Plan 03 removes remaining full prefix rebuilds. Do not claim O(log N) total updates after this slice alone.

## Files and private contracts

Modify only integration points in existing large modules; extract new responsibilities into small internal files:

- `src/composables/useDynamicScroller.ts`: structural effect, dirty-size publication, anchor integration and reset/disposal.
- `src/composables/dynamicScrollerMeasurement.ts`: central measured-size write path; retain stale-ID checks and public resize callbacks.
- `src/composables/dynamicScrollerMeasureQueue.ts`: reuse existing queue. Add flush ownership hook only if profiling and design require it; preserve standalone callers.
- New `src/composables/dynamicScrollerSizeStore.ts`: instrumented size-record writes and replacement, dirty keys, batch revision. No DOM work or second scheduling policy.
- New `src/composables/dynamicScrollerSequence.ts`: exact-array private registry, structural snapshot, key→indices lookup, owned size publication and cleanup. This is shared with plan 03, not a package export.
- `src/composables/useRecycleScroller.ts`: select certified-owned dynamic fast path or existing generic reactive path. Generic direct `RecycleScroller` retains shallow mutation tracking.
- New focused pure specs alongside new modules, each below 300 lines; production browser regression specs under benchmark tests, using existing helpers/data.

Suggested internal division (not public options):

```ts
/** Private metadata for a wrapper array owned by DynamicScroller. */
interface DynamicSequence {
  /** Changes only when membership, keys, types, order or item references change. */
  structureRevision: number
  /** Advances after one coherent set of effective-size changes. */
  sizeRevision: number
  /** Exact positions touched by measurements since last publication. */
  changedIndices: ReadonlySet<number>
  /** Structural cache, built by existing key resolver semantics. */
  indicesByKey: ReadonlyMap<string | number, readonly number[]>
}
```

Keep mutations/subscriptions encapsulated; interface above expresses responsibilities, not permission to mutate revision fields from several owners. Use one producer and per-consumer revision cursors; two recycler consumers currently exist in component mode, so the first consumer must not destructively drain updates needed by the second.

## Implementation sequence

### A. Characterize writes and preservation before changing reactivity

1. Audit every write to `vscrollData.sizes`, every whole-record replacement, `forceUpdate(true)`, direction/key changes, restoreCache, and simple-array reset. Include legacy item-controller paths and external access through public returned `vscrollData`.
2. Record which callbacks are immediate and which run after Vue/RAF. Preserve their observable order; layout can batch without silently delaying per-item `emitResize` notifications.
3. Add browser sequences below before replacing broad effects. Existing jsdom tests around wrapper identity/anchors/cache remain useful; do not remove them as duplicates of a smoke test.

### B. Structural snapshot

4. Split current `watchEffect` into structural work and size publication. Structural dependencies still cover shallow array mutations, reference replacement, keys and type buckets affecting ownership. Detect in-place `push/splice/reverse`, same-key object replacement, changed function-key dependencies, and simple-array index identity.
5. For real structural changes, rebuild snapshot/index map in one pass, reuse unchanged `ItemWithSize` wrappers by current contract, seed their sizes, preserve append retention, and replace wrapper array when child prop update requires it. Update key/type caches once for that revision.
6. Do not remove generic `trackArrayShallowMutations()` or `.slice()` watchers globally: arbitrary public getter/ref arrays do not have an explicit mutation channel. Only certified owner arrays may bypass size-only identity work.

### C. Size channel and commit

7. Route measured writes through one size store. Prefer a raw record Proxy under Vue's reactive wrapper that observes set/delete and reports changed keys while preserving record reads/enumeration and existing property-key semantics. Same-value writes do not publish. A shallow watcher on the `sizes` record reference adopts replacements/resets. Do not create one watcher/effect per logical record.
8. Preserve writes observable through returned public `vscrollData.sizes`; do not optimize only `applySize` and leave other supported write/reset paths stale. Cache restore/record replacement is a structural-size reset and can be O(N). Keep current string/number key behavior; do not silently change coercion or duplicate-key policy.
9. Gather changed keys during existing synchronous write batch; capture viewport anchor before first effective size mutation. Resolve keys via structural index, update only affected wrapper sizes, and publish one coherent size revision using existing Vue batch boundary. Do not add a mandatory extra animation frame.
10. Keep stale measurement safety: queued work belongs to captured ID, binding generation and source lifetime. Rebinding or unmount invalidates old writes. A measurement for a removed row must not mutate the new row at its old index.
11. Keep `itemsWithSize` exposed shape/reactivity and size-entry wrapper reuse. Notify public observers as needed, but certified recycler consumes size revision without treating it as membership change. No full `.slice()`, `getItemKeys`, `getItemTypes`, or shallow-slot walk for a size-only commit.
12. For getters such as offset/cache snapshot invoked before scheduled publication, synchronously flush pending metadata without a DOM read. Public methods must see coherent current state rather than half-applied updates.
13. Reuse stable key→index lookup for anchor restoration instead of repeated `findIndex`. Capture old anchor offset before tree/size changes; restore after publication. Prepend uses existing stable-ID + pixel-offset contract, including correction while new entries are measured. Native user scroll retains existing cancellation rules.

### D. Private registry and lifecycle

14. Register exact owned wrapper arrays in a module-local WeakMap; normalize Vue proxies consistently at register/lookup using existing Vue facilities. Registration carries an owner token and explicit teardown of subscribers. Do not identify an array by item shape or a global "current scroller".
15. For array replacement, register new sequence before exposing it; keep old consumer cleanup safe until child update has switched. Missing registration uses correct generic fallback. Fast-path eligibility also checks consumer semantics: expected wrapper key/size fields, variable measured sizing and supported linear configuration. A consumer overriding key/size resolver, grid options or other incompatible settings through `$attrs` must keep generic path; array certification alone is insufficient.
16. Scope delivery to active owner generation. Disable/unmount cancels pending work; re-enable reconciles any missed structural/size changes before layout. Two scrollers and nested scrollers remain independent. Never leak old updates into new mount.
17. Inspect generated package chunks and public declaration exports to confirm private bridge is shared by library entry/subpath consumers, without new public option or required dependency.

## Tests: boundary, defect and decisive outcome

Use actual production Vue/library/browser for geometry and lifecycle; pure tests only for new bookkeeping algorithms. Observe public results, not number of internal watcher invocations.

| Scenario | Distinguishing input / oracle | Fault to probe |
| --- | --- | --- |
| Measured rows above viewport | Two distinct rows grow differently; anchor ID and pixel offset stay within 3px, later offsets change correctly | Drop one dirty key / apply only first measurement |
| Recycled binding | Queue measurement then reuse view for another ID with different text/size; correct new content/geometry, old ID cannot overwrite | Remove generation/ID guard |
| Same-key object replacement | Replace title/body of selected visible row, preserve key; content updates, another row unchanged, checkbox remains attached | Skip identity/reference reconciliation |
| Append retention | Append 20; existing interactive child state and view ownership retained, new rows reachable | Recycle all preexisting views |
| Prepend + sort | Deep anchor then prepend 20; verify ID/offset; sort and return target; no duplicates/overlaps | Apply delta to index instead of stable key |
| Public size record/reset/cache | Write existing supported size record; reset/direction flip/restore cache; public offsets/snapshot and actual rows agree | Ignore alternate write or reset path |
| Two owners / consumers | Two scrollers mounted; update/dispose one, other remains correct; both component and headless APIs | Destructively consume shared dirty set |
| Disable/re-enable and disposal | Queue resize, unmount/disable, then new mount and real resize; no stale mutation, new work still succeeds | Publish stale queued revision |

Reuse existing selection/matrix/wheel tests rather than copy them into a new all-purpose fixture. Extend focused real consumer cases only for missing contracts. Pure size-store tests use independent literal keys/expected sets and replacement sequences; do not assert implementation-private Map layout.

For high-risk faults, use isolated source copies/private caches and actual built dependency resolution. Failure must be wrong content/offset/anchor assertion, not import error or unrelated timeout. No scroller/timing mocks.

## Exit and profiling gate

- Production correctness in both browsers; public package/type tests unchanged; DOM bounds unchanged.
- At 10,000 activity-feed and headless table, traces should show structural snapshot work only for real structural changes, not each measured-size batch during scroll. Explain remaining full prefix work rather than hide it.
- Measure mount, scripted scroll, prepend/append, update, resize and sort independently. Preserve plain baseline semantics.
- If scan attribution remains under the same source because a generic watcher is still reached, trace exact consumer before proceeding. Do not bypass correctness checks or change scroll distance/buffer.
- Proceed to plan 03 with new profile showing remaining prefix cost. If plan 02 alone meets all goals, plan 03 is optional and must justify its complexity with remaining evidence.
