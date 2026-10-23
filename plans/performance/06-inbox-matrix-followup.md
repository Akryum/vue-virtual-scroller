# Inbox and matrix slowdown investigation

## Scope and attribution

Investigate the slow issue-inbox and inventory-matrix samples in the October 22 quick run. Preserve those samples. Historical and current builds both produced slow matrix samples in later controls, while other sequential controls recovered without source changes. Those comparisons do not establish an introduced library regression.

Current investigation artifacts live in `benchmark-results/inbox-matrix-2026-10-23/`. They include immutable before/after production app and public-library builds, raw reports, Chromium CPU/timeline captures with source maps and offline flamecharts, native Firefox profiles, diagnostic probes, and independent report checks.

## Confirmed findings

- Fresh Chromium inbox trace: virtual and plain scripted-scroll p95 16.70 ms, maximum 16.80 ms, zero intervals above 50 ms. No fixed-row O(N) scan or long task found. No inbox source fix justified.
- Fresh Chromium matrix trace: `setStyle` sampled 118.9 ms self during virtual scroll; `updateVisibleItems` sampled 17.5 ms inclusive. These quantities describe different stack accounting and must not be added.
- A 20-pixel diagonal matrix scroll retains all 90 initial pooled record identities. A native Firefox setter probe observed 1,080 wrapper style setter calls, despite zero style-attribute mutations. MutationObserver alone therefore missed redundant same-value writes.
- Matrix header offsets lived in `FixedList.vue`. Updating them invalidated the renderer ancestor. Isolating offsets in `MatrixHeaders.vue` removes that source of cell-render work while retaining the same three header DOM roots, labels, dimensions, both rendering modes, and native scroll ownership.
- Repeating the identical native Firefox probe after isolation: zero pooled-wrapper setter calls in virtual mode (before: 1,080), zero in plain mode (before: two), unchanged record identities. Both probes' idle controls recorded zero writes.
- Chromium does not expose the same instrumentable CSS property setters in this probe. Its zero setter count is unsupported evidence, not proof of zero writes.

One Chromium diagnostic capture per mode/build found virtual matrix `setStyle` sampled self 118.9 ms before / 35.8 ms after, and renderer `RunTask` phase intersections 728.9 ms / 374.1 ms. Inbox task time increased in the corresponding traces while p95 stayed 16.7 ms; diagnostic variation prevents interpreting these single instrumented captures as a general speedup. Native setter counts provide the stronger direct evidence for removed redundant work.

Native Firefox profiles also retained exact shared phase markers and captured source maps. Matrix JavaScript leaf-category sample weights fell from 888.3 ms to 220.0 ms and Layout from 250.5 ms to 121.0 ms. Inbox JavaScript also fell from 680.0 ms to 204.7 ms and Layout from 353.8 ms to 139.4 ms. Those control shifts expose instrumentation/host variation; none of these wall-clock sample weights establish exclusive CPU totals, a general speedup, or the cause of historical stalls. Four native measured controller runs passed correctness.

This is a benchmark application rendering fix. No library API or recycler algorithm change is justified by these findings. It is not proof that header work caused the earlier large frame stalls.

## Matched measurement protocol

- Same-day immutable builds; fixed Node/browser versions and host; same runner, seed 2026, count 1,000 (matrix 32 × 32 = 1,024 cells), browser viewport 1,440 × 1,000, scale 1, case viewport 960 × 640.
- Serial ABBA blocks: before, after, after, before. Each block runs Chromium then Firefox, inbox then matrix, one excluded warmup pair and three measured pairs per group. Virtual/plain pair order alternates; every trial gets a fresh browser context.
- Six measured trials per rendering mode/browser/workload/build: 96 measured trials and 32 excluded warmups overall. Preserve raw block identity, frame samples, invalid results, actual displacement, DOM checkpoints, artifact hashes, and environment metadata.
- Compare medians and observed ranges separately by engine, workload, rendering mode, and phase. Before/after ratios use valid, nonzero, corresponding temporal pairs in blocks 1/2 and 4/3. Sequential pairing does not remove host drift or establish statistical significance.
- Tracing, profiling, builds, and tests run separately from uninstrumented timing blocks. Diagnostic timings never substitute for acceptance timings. Inbox retains the same content/list renderer and acts as a control. Its shared scroll handler now skips unused offset allocation and scroll-coordinate reads when no headers exist; this small shared-path change must not be described as a byte-identical inbox implementation.

## Validation contracts

Real production browser tests check header/product/warehouse alignment after diagonal scrolling, stable cell detail identity, changed row order after sorting, and reset/remount alignment in both modes and engines. Existing workload checks retain content/actions, full plain datasets, bounded virtual roots, and the 160 × 160 sparse-grid guard.

Detailed final observations and limitations are recorded with the preserved reports, rather than inferred from source review or a favorable trace.

## Final matched observations

All 128 trials valid: 96 measured, 32 excluded warmups. Independent checks passed for configuration/order, environment, artifact identity, raw frame percentiles, displacement, DOM counts, invalid exclusions, and temporal ratios. All 178 captured package source files remained unchanged through measurement; before/after library artifacts are identical.

Virtual median per-trial scripted-scroll p95, before / after in milliseconds:

- Chromium inbox: 16.75 / 16.70; observed ranges 16.70–16.80 in both builds.
- Firefox inbox: 17.08 / 17.09; observed ranges 17.08–17.10 in both builds.
- Chromium matrix: 16.75 / 16.75; observed ranges 16.70–16.80 in both builds.
- Firefox matrix: 17.09 / 17.10; observed ranges 17.08–17.10 in both builds.

No measured virtual interval exceeded 50 ms. Maximum mounted roots remain 11 inbox and 143 matrix; plain datasets remain complete at 1,000 / 1,024 roots. No material frame-cadence improvement demonstrated, and historical large stalls remain unexplained.

Retain observed Firefox plain operation shifts: inbox filter median 42 ms [39, 49] before / 51 ms [41, 58] after; matrix mount 95.5 ms [94, 117] / 107 ms [95, 143]. Matrix sort 46 ms / 51 ms changes direction across temporal source blocks. These are measured time-to-settled differences, not invalid samples or proven harmless noise.

Bounded follow-up used actual `controller.run()` with exact phase observer and native animation-frame clocks: 16/16 valid, including four excluded warmups. Three measured alternating source pairs per workload did not consistently reproduce those differences. Every selected phase used three frame callbacks; pure refresh-alignment explanation was not established. A queued microtask boundary increased 6/14/4 ms for the three candidate plain matrix mounts, suggesting possible extra render work but not isolating its cause or exclusive CPU cost. Diagnostic absolute times were inflated versus acceptance; preserve them separately and leave filter/mount shifts unresolved. Do not claim the new header component is universally faster.

Lint, both package typechecks and unit suites passed. Full production browser correctness suite passed 76 tests with four intended skips, including all workloads and the sparse-grid guard. Focused header tests passed in both builds and engines; isolated stale warehouse-header fault failed the intended geometry assertion. Source review found no actionable correctness regression. No commit or push performed.

Local result index: `benchmark-results/inbox-matrix-2026-10-23/README.md`; full matched phases/ranges: `matched-summary.md`; raw diagnostic interpretation: `trace-comparison.md`, `phase-followup.md`, and `diagnostics/firefox-real-lifecycle-cadence/summary.json`.
