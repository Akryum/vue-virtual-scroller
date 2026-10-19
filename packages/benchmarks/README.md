# Realistic browser benchmarks

Compare built `vue-virtual-scroller` public exports against ordinary keyed Vue rendering. Both strategies share content components, data, assets, dimensions, and actions. Performance results are informational; failed correctness checks invalidate trials and fail the command.

## Run

Requires Node 24+ and pnpm. From repository root:

```sh
pnpm install
pnpm exec playwright install chromium firefox
pnpm benchmark:preview
```

Open printed preview URL. Select workload and rendering mode, then Preview. Action buttons reset the workload before measuring their operation. Run comparison measures one excluded warm-up pair followed by configured paired trials in current browser. Cancel removes measured iframe document and prevents stale results. Import CLI JSON reports to inspect or export them.

```sh
pnpm benchmark                       # 1,000 items, 5 paired trials, both engines
pnpm benchmark:full                  # 1,000 and 10,000 items, 10 paired trials
pnpm benchmark:stress                # 50,000 items, 10 paired trials
pnpm benchmark --browser firefox --workload activity-feed --count 10000 --trials 5
pnpm benchmark --seed 42 --output /tmp/scroller-report --headed
pnpm benchmark:test                  # production build and browser correctness checks
pnpm benchmark:dev                   # content development; comparison timings disabled
```

Supported options: `--profile quick|full|stress`, `--browser chromium|firefox|all`, `--workload <id>|all`, `--count 30..100000`, `--trials 1..100`, `--seed 0..4294967295`, `--output <directory>`, `--headed`. Explicit count/trial options override profile defaults. Validate options before builds or server allocation. Automation owns a production preview server on an available loopback port and closes it after completion or interruption.

## Workloads

- `issue-inbox`: fixed 112px issue rows; status filter, stable priority sort, 100-record update, selection.
- `activity-feed`: naturally sized comments, deployment notices, incidents, checklists, code, attachments; expansion, append/prepend 20 records, updates, narrow viewport. Prepend retains visible anchor.
- `product-grid`: 240×320px product cards with local illustrations; filter, price sort, stock updates, selection, four-to-three-column resize.
- `customer-table`: semantic customer/account table using headless dynamic measurement and column-width locking; filter, revenue sort, updates, selection, resize.
- `window-feed`: editorial previews with known 112/144/176px heights; document scrolling, distant jump, filter, expansion of preceding intro block.
- `horizontal-cards`: measured project cards with content-driven width changes; jump, owner filter, milestones, progress updates.
- `inventory-matrix`: 140×88px inventory cells, product/warehouse labels, both scroll axes; jump, row-total sort, updates, details. Matrix counts round up to squares: quick 32×32 = 1,024; full adds 100×100 = 10,000; stress 224×224 = 50,176. Raw report retains requested and actual counts.

Fixtures use shared deterministic RNG, stable IDs, authored domain templates, fixed dates, explicit English currency formatting, and bundled SVG illustrations. No remote images, APIs, fonts, Faker requests, or wall-clock-derived data. Plain mode renders every matching record; no pagination or hidden virtualization.

## Measurement contract

CLI runs Chromium and Firefox serially. Every trial has fresh browser context at 1440×1000, device scale 1, English locale, UTC; workload scrollport is 960×640. Window workload uses document viewport. Interactive iframe runs are labelled separately and should not be compared directly against CLI runs.

One excluded warm-up pair runs per engine/workload/size. Subsequent pair order alternates virtual-first/plain-first. Modules, deterministic data, and decoded image assets are ready before timed mount. Each action starts from reset original state. Prepend starts at a deeper visible anchor.

**Time to settled render** starts immediately before reactive change, ends after Vue update and two consecutive stable animation-frame transitions. Lightweight point samples compare visible record IDs, bounding boxes, and scroll geometry without walking full plain DOM every frame. This includes browser scheduling/frame waits; it is not isolated JavaScript CPU time or proof of physical display paint. Settling timeout is 10 seconds. Trial timeout is 120 seconds, with an independent CLI watchdog for blocked main threads.

**Scripted scroll** follows a three-second forward/back path of at most 12,000px per supported axis. Reports retain raw frame intervals, p50/p95, maximum interval, count above 50ms, requested path, actual displacement, elapsed time, and sample count. These describe animation-frame cadence, not input latency or compositor FPS. Browser tests also exercise real wheel input.

**DOM checkpoints** run outside measured operations. Mounted record counts include inactive pooled views; element counts include all descendants of workload root. Correctness checks inspect visible content, stable identity, state transitions, and expected action outcomes. Backgrounded pages, exceptions, crashes, timeouts, and failed checks invalidate trials. No memory profiling or forced garbage collection.

Use a quiet machine for comparisons. Browser/OS versions, thermal limits, display refresh, background work, and headless mode affect measurements. Five or ten trials do not establish statistical significance.

## Reports and CI

CLI saves `benchmark-results/<timestamp>/report.json` and `report.md`; files are ignored by Git. JSON includes raw samples, failed trials, excluded warm-ups, ordered pairs, frame distributions, DOM checkpoints, and environment/build metadata. Markdown groups timings by engine, workload, size, mode, and operation. Plain/virtual ratios require valid, nonzero samples from same pair. There is no cross-browser combined score.

Status is `complete`, `partial`, or `cancelled`. Reports are saved after each trial and again during shutdown, including failed runs. SIGINT/SIGTERM close active context and retain completed evidence. Normal CI runs correctness checks in both engines. Manual **Benchmarks** workflow runs chosen profile and uploads artifacts even when checks fail; timing variability never fails CI.

## Adding a workload

Add seeded domain data, shared content component, renderer, registry entry, controller action, and independent correctness assertions. Keep runtime files below 300 lines. Do not add artificial nested markup to inflate virtual/plain differences. Browser tests must consume production bundle and public library exports. Use failure probes in isolated source copies, never edit shared production code to inject defects.
