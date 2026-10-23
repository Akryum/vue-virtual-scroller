# Trace evidence and confidence

## Recorded environment

- Source SHA: `a61d864fd5d9bc67fa338db6a8d3d4e5f5c051a2`; working tree clean at capture.
- Chromium `145.0.7632.6`, headless; AMD Ryzen 9 9950X; Linux `7.2.9-200.fc44.x86_64`.
- Browser 1440×1000, scale factor 1; fixed benchmark scrollport 960×640; seed 2026. Window workload uses document viewport.
- Production minification retained, source maps added; built public library and CSS consumed.
- Twenty diagnostic captures: all seven workloads × two modes at 1,000 requested records, then inbox/activity-feed/table × two modes at 10,000. Matrix actual count 1,024 at quick size.
- All 20 captures valid, no page errors. Analysis integrity checks passed across 154 phase windows.
- One excluded warmup per workload/mode at 1,000; no independent excluded 10,000 warmup for diagnostic captures. Do not treat these captures as paired benchmark statistics.

## Uninstrumented 10,000-item confirmation

Virtual mode only. One excluded warmup plus three measured fresh contexts for each workload. All eight runs valid; no trace/CPU profiler attached.

| Workload / measurement | Median | Observed range |
| --- | ---: | ---: |
| Activity-feed mount | 230ms | 170–231ms |
| Activity-feed scripted-scroll p95 | 83ms | 67–83ms |
| Activity-feed prepend | 417ms | 283–427ms |
| Table mount | 532ms | 405–545ms |
| Table scripted-scroll p95 | 133ms | 100–150ms |
| Table sort | 635ms | 550–883ms |
| Table resize | 250ms | 217–300ms |

Activity-feed mounted 9 record roots, table 12. Scroll intervals above 50ms: feed 13/17/15; table 26/27/15. These samples establish observable stalls on this environment; they do not establish significance, confidence intervals, or Firefox CPU causes.

## Trace attribution

| Capture / phase | Observation | Supported conclusion |
| --- | --- | --- |
| Feed 10,000 virtual / scripted scroll | About 896ms sampled inclusive under `useRecycleScroller.ts:364`; 880ms under `useDynamicScroller.ts:665`; Layout 32ms | Full-list size synchronization/prefix calculations are major hot paths; layout alone does not explain stalls |
| Feed 10,000 virtual / prepend | 686ms settled; ~200ms inclusive dynamic synchronization; ~166ms variable sizes; Layout 10ms | Prioritize collection processing before anchor micro-optimization |
| Table 10,000 virtual / resize | 400ms settled; ~155ms sampled inclusive Vue `traverse`; Layout 2ms | Deep dependency traversal is expensive even for a viewport-width change |
| Table 10,000 virtual / mount | 1,026ms settled; ~173ms traverse; ~276ms dynamic synchronization | Table has both dependency-policy and dynamic-engine costs |
| Inbox 10,000 plain / mount | 3,051ms; Layout 1,127ms; style 350ms; 10,000 roots | Large plain DOM imposes real render cost; virtual pool is already bounded |
| Inbox 10,000 virtual / mount | 33ms; 8 roots | Fixed-size virtualization avoids most initial full-DOM cost |

Inclusive sampled times can overlap. Never add these figures as exclusive CPU costs. Instrumented scroll p95 was 333ms for feed and 183ms for table; use separate uninstrumented values above for performance discussion.

## Source paths verified during planning

Paths relative to repository root; line locations refer to baseline SHA:

- `packages/vue-virtual-scroller/src/composables/useDynamicScroller.ts:665`: `watchEffect` loops every item, reads measured size, maintains wrappers, then replaces array for identity changes or calls `triggerRef` for size changes.
- `packages/vue-virtual-scroller/src/composables/useRecycleScroller.ts:264`: shallow-slot dependency walk; `:364`: variable-size prefix computation; `:1865`: `.slice()` plus key/type sequence comparisons.
- `packages/vue-virtual-scroller/src/composables/dynamicScrollerMeasurement.ts:201`: central `applySize` writes measured record size; other writes/resets exist and must be audited before introducing a dirty-key channel.
- `packages/vue-virtual-scroller/src/composables/dynamicScrollerMeasureQueue.ts`: already batches reads before writes, six tasks per flush through dynamic owner. Do not claim batching is absent or add a second scheduler blindly.
- `packages/benchmarks/workloads/CustomerTable.vue:23`: full row objects passed to width `dependencies`.
- `packages/vue-virtual-scroller/src/composables/useTableColumnWidths.ts:274`: deep watcher; width locking is intentionally stable across row churn until explicit remeasurement.
- `packages/vue-virtual-scroller/src/composables/useDynamicScroller.ts:834` creates a recycler. `components/DynamicScroller.vue:150` also renders `RecycleScroller`, whose setup creates another recycler. This establishes duplicate ownership in source, not its exact runtime share. Headless table does not use that nested component.

## Measurement safeguards

The settlement sampler reads geometry and hit-tests 15 fixed points. This can force pending browser work. Native `getBoundingClientRect`/`elementFromPoint` stacks include that work; do not label their entire time avoidable harness overhead. Full DOM checkpoints and assertions remain outside timed phases.

CDP profiles contain negative deltas from out-of-order samples. Existing analysis reconstructs absolute timestamps, sorts them, and uses non-overlapping midpoint weights. Preserve raw profiles and this normalization. Small phase durations include two stable frame transitions and therefore have a scheduling floor around 33–50ms on this setup.

No heap metrics; no evidence that GC, network, avatar images, or compositor FPS is primary cause. Firefox performance is measured by existing quick report but not source-attributed by these Chromium profiles.

## Local raw artifacts

All paths below are ignored local evidence, not tracked dependencies of these plans:

- `benchmark-results/tracing-a61d864/analysis.md`, `summary.json`, `analysis.json`, `manifest.json`, `analysis-validation.json`.
- `benchmark-results/tracing-a61d864/flamecharts.html`; matching `<workload>-<count>-<mode>.trace.json`, `.cpuprofile`, `.result.json`.
- `benchmark-results/tracing-a61d864/uninstrumented-confirmation.json`.
- `benchmark-results/tracing-a61d864/{capture,confirm,analyze,build-viewer,verify-viewer}.mjs`; preserved bundle/maps in `assets/` and `library-maps/`.
- `benchmark-results/quick-validation/report.{json,md}`: original five-pair quick run in both browsers. Its metadata predates benchmark commit and correctly records earlier SHA plus dirty state.

If artifacts are absent, use retained figures only as historical motivation. Reproduce a fresh matched baseline before claiming candidate improvement. See plan 05 for preservation and comparison protocol.
