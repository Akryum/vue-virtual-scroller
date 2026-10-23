# Plan 05: reproducible validation and attribution

## Stage A: preserve evidence before implementation

1. Record current HEAD, dirty paths and versions; preserve unrelated work. Baseline captured SHA is `a61d864fd5d9bc67fa338db6a8d3d4e5f5c051a2`, but do not assume current checkout is unchanged.
2. Preserve existing ignored raw artifacts from [evidence](./evidence.md), including exact production JS/maps. Do not rebuild into old capture directories or relabel old report metadata.
3. If local artifacts are absent, retain this plan's historical observations, then generate a fresh matched baseline. Do not reconstruct purported raw samples from medians in documentation.
4. Use isolated source/build directories for baseline and candidate when switching library versions. Install workspace dependencies separately; never symlink mutable `dist`, Vite caches or test reports between them. Existing read-only dependency package contents may be reused if build resolution remains correct.
5. Prove actual package being measured by report source SHA, built library version/content hash and loaded bundle/map hashes. A clean source checkout does not establish that `dist` corresponds to it.
6. Keep benchmark harness/content identical when measuring library improvements. For plan 01, compare old versus new width policy explicitly; afterward, run baseline library and candidate library against the same new-policy harness. Otherwise a harness improvement would be misattributed to library.

Provenance for every run, in report metadata or a sidecar `provenance.json`:

- Library source SHA + dirty patch hash; harness source SHA + dirty patch hash; build output hashes; column policy version; optimization stage.
- Node, pnpm, Vue/library/browser versions, OS/CPU, headless/headed, viewport/scale, seed, count, actual count and dimensions.
- Instrumentation categories, requested sampling interval, source maps and exact phase-marker method for traces; note that uninstrumented runs have no profiler attached.
- Trial/warmup/order policy, run start/end, cancellation/partial status and all invalid-trial reasons.

No commits needed merely to label a candidate: record real SHA plus dirty state and reproducible patch hash instead of inventing a final SHA.

## Repeatable tracing tooling

Promote local scripts only as needed to reproduce comparisons. Reuse existing controller, runner options, production server, environment discovery and report math; do not create another workload runner with divergent action/reset logic.

Proposed private files, each below 300 lines:

- `packages/benchmarks/scripts/tracing/capture.mjs`: resource owner, one browser/context at a time; CDP trace/profile around real `window.benchmark.run()`.
- `phase-markers.mjs`: wrap controller-reported timed durations and mark scroll window, outside workload UI; no every-frame DOM scans. Prefer explicit private phase-observer hook if wrapper boundary cannot reliably exclude preparation/assertions; no public library API change.
- `profile-samples.mjs`: reconstruct absolute timestamps from signed CDP deltas, sort, assign non-overlapping midpoint intervals, intersect measured spans and produce weighted stacks.
- `source-maps.mjs`: benchmark→published library map chaining with captured assets/maps; source location is authoritative, inferred names labelled.
- `timeline-events.mjs`: exact renderer-thread identification, clipped event durations and task intersections. Include whole-task duration separately if it crosses phase bounds.
- `summarize.mjs`: phase/group metadata, self versus inclusive sampled times, layout/style/paint separately. Reuse existing median/percentile helpers.
- `viewer.mjs` and small viewer HTML/JS modules: standalone interactive CPU flamechart plus top-self table, engine tracks, raw links. Preserve merged contiguous stack prefixes and keyboard zoom/reset.
- Focused unit tests for real profile normalization and map chaining; actual tiny Chromium capture integration test. No scroller or timing mocks. If decoding needs `source-map-js`, add explicit pinned dev dependency rather than rely on transitive filesystem path.

Keep default benchmark commands unchanged. Optional `benchmark:trace` may be added as private root convenience; validate arguments before builds/server. It defaults to Chromium and explicitly rejects unsupported Firefox CDP tracing. This restriction does not change normal benchmark support for Firefox.

Resource contract: owned browser/context/session/server closed in `finally`; cancellation writes partial manifest and raw completed evidence, never complete status. Timeout/crash/page error/background invalidates capture. Diagnostic marks/counters must not ship unguarded in library production hot paths.

## Tests for tracing correctness

Real parser inputs can be tiny authored profile/trace fixtures; parser is the algorithm under test, not a fake browser renderer. Keep fixture literals minimal and independent of parser output.

- Signed deltas reconstruct a known non-monotonic timestamp order. After sorting and midpoint weighting, no negative/overlapping intervals; idle+non-idle weights equal covered phase duration within numeric tolerance. Probe dropping negative deltas: weights/timestamps must fail.
- Phase boundaries exclude setup/reset/assertions. Known events spanning phase edges are clipped; inclusive nested CPU/event times are not added as exclusive work. Distinguish an entire 500ms task from 5ms intersecting the selected phase.
- Source-map chaining maps two distinct minified sites through published library output to known original source locations; missing map remains explicitly unmapped. Probe map-chain omission, require wrong-source assertion failure.
- Known samples test median, percentile and invalid/warmup exclusion through existing report utilities. Do not copy new median implementation into tracing.
- Actual tiny production capture generates parseable `.trace.json`, `.cpuprofile`, manifest and phase evidence, consumes built public library, includes expected real records/actions and passes controller verification. An empty capture that parses is insufficient.
- SIGINT/SIGTERM/failure leave partial report, close resources and permit another run; reuse current CLI lifecycle tests/helpers where suitable. Do not replace real process signals with manually invoked cleanup.

## Baseline/candidate performance protocol

Run on quiet machine; no simultaneous build/test/profile activity. Keep browser engine versions and execution mode fixed. Chromium and Firefox run separately and serially; record environmental changes rather than assume equivalence to historical machine state.

For each relevant workload and size:

1. Use current CLI's excluded warmup pair, alternating virtual/plain order and fresh trial contexts. Same deterministic data, decoded assets, 1440×1000 viewport, scale 1 and 960×640 case viewport.
2. Collect five measured pairs initially for matched baseline and candidate at 1,000 and 10,000. If a performance decision depends on a noisy result, repeat complete blocks in alternating baseline/candidate order; do not select favorable trials or repeatedly test until desired result appears.
3. Use new output directory per block. Invalid measurements retained but excluded. Failed correctness halts acceptance; perf variability alone never fails CI.
4. Compare per-engine/workload/size/phase medians and observed ranges. For scroll, compare per-trial p50/p95/max, intervals >50ms, raw intervals, elapsed time, sample count and actual displacement. Same requested path must actually advance both required axes.
5. Existing plain/virtual ratios pair modes within same run; they are not baseline/candidate ratios. A before/after ratio must identify matching engine, harness policy, workload, count, phase and valid samples; never pair arbitrary array positions across reports.
6. For each library slice, profile representative virtual feed/table mount, scroll, prepend, update, sort and resize. Keep identical profiler configuration baseline/candidate. Do not time several browsers concurrently.
7. Evaluate effects near scheduling floor cautiously. Settled duration includes frame waits and forced rendering; compare CPU source attribution separately. No heap, input-latency or compositor-FPS claims.

Example existing commands for each baseline/candidate output prefix (choose distinct prefix per block):

```sh
pnpm benchmark --browser chromium --workload activity-feed --count 10000 --trials 5 --seed 2026 --output benchmark-results/candidate-feed-chromium-10k
pnpm benchmark --browser chromium --workload customer-table --count 10000 --trials 5 --seed 2026 --output benchmark-results/candidate-table-chromium-10k
pnpm benchmark --browser firefox --workload activity-feed --count 10000 --trials 5 --seed 2026 --output benchmark-results/candidate-feed-firefox-10k
pnpm benchmark --browser firefox --workload customer-table --count 10000 --trials 5 --seed 2026 --output benchmark-results/candidate-table-firefox-10k
```

Run analogous 1,000-item cases and horizontal component cases when affected. Baseline runs use isolated baseline library build with identical harness policy. Do not run the four commands in parallel.

Target ≥40% lower median per-trial p95 for feed/table at 10,000 after plans 02/03, reduced stalls and no material repeatable regressions elsewhere. Table plan 01 target ≥30% resize median reduction. These are review targets, not claims of significance or CI budgets. Record targets unmet if evidence does not meet them.

## Correctness boundary and test reuse

New browser tests consume real Vue and production public library exports/CSS. Tests of geometry use actual browser layout, real wheel input and public actions/refs. Existing jsdom tests with mocked measurements do not establish browser geometry and should not be used as a substitute.

Reuse current seeded domain generator, `openCase`, controller operations and existing E2E support. Do not build a second RNG, fake scroller, duplicate settle helper or full copied workload. Current trial resets each action; add focused sequences for cross-action identity/index corruption rather than assume action-isolated cases cover it.

Extend missing tests in small focused files; retain these existing behaviors:

- `src/composables/useDynamicScroller.spec.ts`: wrapper reuse, measured offsets, anchors, function keys, directives, flow-mode stability, cache/enabled/lifecycle.
- `src/composables/useRecycleScroller.spec.ts`: append retention, keys/types, variable/fixed/grid offsets, sparse/transient-cache recovery and options.
- `src/composables/useTableColumnWidths.spec.ts`: lock/measure policy, nested dependencies, hidden/spacer rows and lifecycle. Existing geometric stubs remain supplemental legacy coverage.
- `tests/e2e/{dynamic-scroller,shift,chat,test-chat,horizontal,headless-table,page-mode-div-parent,window-scroller,grid,recycle-scroller}.spec.ts`.
- Benchmark browser `workloads.spec.ts`, `ui.spec.ts`, `cli.spec.ts`: seven workload parity, DOM bounds, selection/recycling, 160×160 sparse matrix, real wheel/scroll owner, cancellation and import/report integrity.

Before each high-risk new regression, record compact preflight: real entry, contract, plausible defect, distinguishing two-record input, independent expected result, completion signal and cleanup. Tests must verify both changed target and unaffected record. No presentation snapshots as correctness oracle.

Fault probes run only in isolated source copies with private mutable caches/builds/reports. Probe dropped dirty update, stale binding write, off-by-one prefix boundary, wrong-owner helper, and missing table invalidation where corresponding slice is implemented. Baseline must pass first; defect must fail decisive content/geometry/anchor assertion. Import errors, stale built package, unrelated timeout and current-source tests against old faulty snapshot are invalid proof.

## Stage B: final validation

For each slice, run its focused tests first, then required broad validation when integrating:

```sh
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm benchmark:test
pnpm test:e2e --workers 2
pnpm build
pnpm --filter vue-virtual-scroller test:package
pnpm docs:build
pnpm --filter vue-virtual-scroller exec npm pack --dry-run
```

`--workers 2` matches previously stable local E2E verification; keep CI's configured browser projects. Distinguish environment/baseline failures from patch regressions, never silently skip tests. Node >=24 and Playwright Chromium/Firefox are required; use writable temporary npm cache if host default cache is read-only, without changing package behavior.

Then run complete quick benchmark in both browsers and targeted 10,000 comparisons. Run 50,000 stress only after 10,000 correctness/performance is credible, report actual matrix cell count, and label any timeouts invalid rather than raising guard. Complete full/stress is not prerequisite for every tiny slice; claim only sizes actually tested.

Final review: no accidental public exports, declaration changes, raised item limit, changed plain rendering or measurement definition; no new source/test file >300 lines; remove redundant helpers/tests. Show representative production screenshots and keyboard/wheel proof where renderer ownership changed.

## Final handoff

Write per-slice summary with source diff, correctness/fault-probe outcomes, exact provenance, uninstrumented timing changes/ranges, raw trace links, remaining hot paths and unmet targets. Mark cancellation/partial/failure explicitly. Keep raw reports and trace assets under ignored `benchmark-results/<run-id>/`; track only compact evidence documentation and reproducible tooling/tests.

Do not declare improvement from lower DOM count alone; pool is already bounded. Do not attribute benchmark-policy gains to core library. Do not generalize Chromium sampled stacks to Firefox. Close every owned server/browser/context and preserve working changes. Commit/push only if separately requested.
