# Repeatable Chromium tracing

Use Node >=24 and installed Playwright Chromium. Normal benchmark supports both engines; CDP tracing explicitly rejects Firefox. Root command validates arguments, then builds production public package and benchmark with source maps:

```sh
pnpm benchmark:trace --workload activity-feed --count 10000 --trials 1 --source-sha <actual-library-and-harness-sha> --column-policy explicit-revision --stage candidate --output benchmark-results/candidate-trace
```

Low-level `node scripts/tracing/capture.mjs` consumes an existing production build; browser tests manage build separately. Root command skips builds when explicit immutable roots are supplied together. It snapshots exact app/library bytes before serving, preserving source maps and output hashes. `--app-root` and `--library-root` select immutable baseline build directories. All common benchmark arguments use existing validation; Chromium default. Use separate `--library-sha`/`--harness-sha` and `--library-patch-hash`/`--harness-patch-hash` for mixed-source builds. `--source-sha` explicitly declares both match. Source SHA is explicitly supplied; omit when build/source correspondence is unknown. Manifest separately retains actual runner checkout SHA, dirty paths and patch hash. Never relabel preserved assets as current source.

Existing benchmark runner owns server, browser/context, alternating pairs, excluded warmup, fresh contexts, real controller, verification, watchdog and signal handling. Diagnostic hook attaches only for measured trials; no separate workload logic or timer. Default commands have no observer. Exact private phase observer marks existing start/end clocks after measured end, excluding action setup and correctness checks. Frozen bundles without hook use returned-duration/checkpoint wrappers, explicitly labelled in phase evidence; prepend end can include its untimed anchor assertion. Do not compare those boundary methods as if identical.

Artifacts: `report.json`/Markdown, versioned `manifest.json`, captured `app/` and `library/`, each measured trial's Chrome `.trace.json`, `.cpuprofile`, verified `.result.json`, source-attributed `.analysis.json`, and offline `flamecharts.html`. Raw evidence remains on cancellation/failure, status partial/cancelled, resources close in runner `finally`. Completed captures retain raw evidence even when subsequent trial fails.

Finalization failures invalidate the trial and every writable result/analysis artifact. Manifest entries list `unreconciledArtifacts` with filename and IO error when old evidence cannot be updated; those files must not be consumed as valid even if their old `valid` field remains true. Viewer includes only captures whose final manifest outcome is valid.

Sample normalization reconstructs absolute timestamps from signed deltas, sorts, and assigns non-overlapping midpoint intervals clipped to phase bounds. Source-map chaining uses only captured app and published-library maps. Missing maps stay unmapped; token names are not inferred function declarations. Renderer ownership comes from unique marked pid/tid. Engine events retain clipped phase intersection and whole-task duration separately. Inclusive stack/event rows overlap; never sum them as exclusive CPU cost.

Viewer merges contiguous stack prefixes, exposes top-self sources and separate task/layout/style/paint tracks. Wheel zooms, arrow keys pan, Home resets. Instrumentation perturbs performance. Use separate **uninstrumented** same-machine paired reports for speed comparisons, retain ranges and invalid counts, distinguish baseline/candidate versus within-run plain/virtual ratios. Sampling makes no memory, input-latency or compositor-FPS claim.

Focused algorithm tests use tiny authored CDP/map inputs, not fake renderers. Browser tracing test executes actual production CLI, validates content/actions/nonempty samples/phase windows, signals SIGINT/SIGTERM, then completes another capture. Run tracing and timing commands serially without overlapping builds/tests.

Private callers may select `runSuite({ ...options, modes: ['virtual'] })` for diagnostic gates. Runner validates nonempty unique subset before resources, labels single-mode order/warmup explicitly and produces no paired ratios. Public CLI mode selection remains unchanged.
