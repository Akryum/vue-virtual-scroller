# Implementation status

Implementation is uncommitted. No public library API, default item limit, plain rendering strategy or measured workload content changed.

## Delivered slices

- **01 — table invalidation:** explicit width/filter/sort/content tokens in both modes; update-owned revision; real table fixture, state test, native-auto geometry oracle. Eight production browser cases passed against preserved baseline library in Chromium/Firefox. Missing-revision fault produced stale column error (8px versus allowed 1px). See ignored `benchmark-results/table-width-policy-proof/`.
- **02 — dynamic pipeline:** observed size-record writes/replacements, dirty-key publication, separate structural snapshots, exact-array private certification and generic fallback. Cached old-array ownership invalidates on replace/dispose; numeric/string identity remains distinct for anchors. Queued measurement callbacks reject ended/rebound lifetimes. Public geometry queries flush coherent pending metadata.
- **05 — repeatable profiling:** `pnpm benchmark:trace`, production source maps, shared runner lifecycle and private phase observer, signed sample normalization, captured source-map chaining, provenance, offline viewer and CLI cancellation proof. Normal benchmark browser support unchanged.

Implementation and validation complete. Four matched 10,000-record blocks: 96/96 valid. Reverse-order Firefox controls: 24/24 valid. Final complete quick profile: 168/168 valid across all seven workloads, both browsers and both modes. Each browser/workload block uses five measured pairs plus one excluded warmup pair. Original partial run remains preserved separately. No commits or pushes made.

## 2026-10-22 re-audit fixes

Five-lane re-audit found three additional P2 edge cases. All three now have failing-before/passing-after regression proof; this follow-up makes no new performance claim.

- A stale queued measurement still rejects its old generation, then schedules a new read for the current active binding. Without ResizeObserver, same-tick ID/active round-trips now measure real 73px content automatically. Public owner/item lifecycle tests use native geometry in both engines; no manual recovery call hides a dropped measurement.
- External reactive size maps observe all own string properties, including non-enumerable keys. Public geometry and cache snapshots update together. Original audit's six consumer cases now pass, including shallow-reactive and readonly controls.
- Artifact and manifest finalization share one failure boundary. Any publication failure rejects every writable peer while preserving raw phases and diagnostic fields. Manifest entries explicitly list `unreconciledArtifacts` when immutable or malformed evidence cannot be updated. A manifest-write failure also invalidates otherwise writable result and analysis files.
- Canonical tests reproduced the failures before source changes: four native binding cases failed across both engines while two unchanged controls passed; hidden size key retained offset 110 instead of 140; finalization retained successful flags. Real readonly-analysis Chromium fault probe now rejects report, manifest and writable result consistently, retaining all seven raw phases and naming immutable analysis. Fault injection stays in ignored private entry copies.
- Detailed final validation and raw evidence: [re-audit fix proof](../../benchmark-results/reaudit-fixes-2026-10-22/README.md). Historical paired performance results below remain attached to their preserved artifacts.

### Deferred activation and empty viewer follow-up

- Dropped queued reads retain a pending request while inactive. Fallback activation handles pending work, explicit inactive requests and missing initial sizes; known old sizes cannot suppress a requested fresh measurement. Native tests require automatic convergence after inactive frames for both unknown and previously measured rows.
- Offline viewer guards wheel/keyboard handlers without a phase, clears empty chart state, disables unavailable controls and labels absent data. Generated empty HTML is exercised with native input in both engines; existing valid-capture zoom/pan checks remain.
- All six added browser regression cases failed before these fixes. Four follow-up subagent lanes found no new confirmed issue in deferred ownership, metadata, viewer/finalizer or harness integration. Final validation and conditional benchmark rerun are recorded in [follow-up evidence](../../benchmark-results/final-followup-2026-10-22/README.md).
- Final production suite: 72 passed/four intended skips. Full serial E2E: 44 passed/18 existing skips; earlier Firefox scroll and separate demo startup failures remain preserved and unexplained. Lint, units, typechecks, builds, package checks and docs build passed. Tests/expectations were not weakened.
- Complete quick rerun: **168/168 valid**, 140 measured and 28 warmups, all seven workloads and both engines. Independent order/sample/DOM/source-hash checks passed; exact production bytes retained. Feed/table virtual p95 medians at 1,000 records: Chromium 16.8/16.7ms, Firefox 17.12/17.12ms. [Full results and ranges](../../benchmark-results/final-followup-2026-10-22/quick/summary.md).
- Slower inbox/matrix quick samples remain intact. OS kernel differs from October 19, while shared recycler source is byte-identical. Bounded frozen/current controls: 32/32 valid, three measured virtual-only trials per group plus warmup. Inbox and Chromium matrix slowdowns did not repeat; Firefox matrix was also slow with old build. No newly introduced source regression or causal explanation established; sequential controls are not a matched statistical acceptance campaign. [Controls](../../benchmark-results/final-followup-2026-10-22/control-comparison.md).

## 2026-10-22 regression follow-up

Audit found two concrete gaps; both now fixed. The paired results below describe preserved pre-follow-up artifacts, not a new complete paired campaign.

- Public reactive size maps retain caller aliases and ref write-through. External Vue records use compatibility tracking, stopped on replacement/disposal; library-owned initial/reset/cache maps retain keyed publication. Readonly proxy identity is preserved.
- Explicit `scrollToItem` and `scrollToPosition` cancel a pending automatic anchor. Native tests exposed this related ordering issue when replacing sizes and jumping immediately; both browser engines now preserve the requested navigation and subsequent visible anchor.
- Page errors reconcile again after diagnostic collection and context closure. A final completion hook synchronizes capture manifest, raw result and analysis validity before publishing viewer/report outcomes, retaining raw timings and earlier diagnostic evidence.
- Final production browser suite: 60 passed, four intended skips. Existing E2E: 44 passed, 18 existing skips. Lint, library/benchmark typechecks, recursive units, package export checks and docs build passed. Original audit consumer probe: nine passed against baseline, fixed source and rebuilt public entry.
- Private late-error capture probe invalidated report, both measured capture entries, results and analyses while retaining raw phases. Fault scripts alter only ignored copies; shipped assets contain no injected error. Missing-finalization sensitivity and 10,000-record scrolling sanity evidence are retained under `benchmark-results/regression-fixes-2026-10-22/`.
- Omitting finalization in isolated copy failed both artifact-consistency assertions. Uninstrumented virtual-only sanity check: 16/16 valid (12 measured, four warmups), three samples per browser/workload. Median per-trial p95: feed 16.8ms Chromium / 17.12ms Firefox; table 16.7ms / 17.12ms. One Chromium table trial contained one interval over 50ms; other measured trials had zero. This confirms normal keyed path remains effective, without claiming a new full paired campaign or statistical significance.

## Matched performance results

Five measured pairs per browser/workload, fresh contexts, alternating order. Values below are medians of the five valid virtual trials. Frame metric is per-trial scripted-scroll p95 interval, not FPS or input latency.

| Comparison | Chromium before / after | Firefox before / after |
| --- | ---: | ---: |
| Feed p95 interval, old library versus candidate | 266.8 / 16.7ms | 583.2 / 17.08ms |
| Table p95 interval, explicit policy/old library versus candidate | 50.0 / 16.8ms | 149.74 / 17.10ms |
| Table resize, old versus explicit policy, same old library | 333.2 / 99.9ms | 382 / 178ms |
| Table resize, explicit policy/old library versus candidate | 99.9 / 99.8ms | 178 / 99ms |

All twenty measured candidate virtual scrolls across these two workloads had zero intervals over 50ms. Actual travel remained 11,995–12,000px and returned to zero, versus requested 12,000px. Feed p95 samples were 16.7ms Chromium and 17.08ms Firefox. Table samples ranged 16.7–16.8ms Chromium and 17.08–17.52ms Firefox. Table control ranges were 33.4–100ms Chromium and 100.46–166.70ms Firefox; historical feed ranges were 50.1–333.4ms and 466.92–899.22ms.

Both scroll improvement targets and the table policy resize target were observed. These are sequential same-machine observations, not statistical significance claims. Table policy improvement belongs to benchmark/example usage; the explicit-policy old-library control isolates the subsequent core comparison. Historical feed baseline had brief parser/source-edit overlap and wide ranges, so precise mount/action speedup attribution is weaker. Plain-mode controls and every phase/range remain in raw reports; no combined score.

Reports: `benchmark-results/performance-matched-acceptance/{baseline-old-policy-table,baseline-new-policy-table,candidate-feed,candidate-table}/report.{json,md}`. Historical feed control: `benchmark-results/performance-baseline-a61d864/matched-activity-feed-10000/`. Artifact hashes, separate library/harness source identities and run conditions are retained alongside reports.

### Reverse-order control and attribution limits

Additional Firefox blocks ran candidate first, then explicit-policy old library: 24/24 valid, five measured pairs per block. Virtual median p95 remained 17.10ms versus 149.66ms; candidate stalls remained zero versus 28–33 per trial in control. This repeats the main scroll result.

Initial Firefox plain-table phase medians increased 11–47%. Reverse order retained slower candidate plain mount (3,564 versus 2,961ms, +20.4%) and filter (959 versus 861ms, +11.4%). Other large plain slowdowns did not repeat; sort/update/resize differed about 5–6%, while selection improved. Seven shared source files are byte-identical to control; plain mode never calls changed dynamic composable, and column-measurement source is unchanged. These persistent control shifts remain unexplained. They limit mount/action attribution; they are not presented as proven core regressions or dismissed as established noise.

Historical feed plain phases also improved substantially despite unchanged plain behavior. Precise feed mount/action speedup attribution is therefore weak. No measured virtual phase median regressed more than 10% in these comparisons. Raw ranges and all control samples remain in [comparison](../../benchmark-results/performance-matched-acceptance/comparison.md); no samples pooled or removed to hide shifts.

### Complete quick profile and startup evidence

Final report: [quick retry](../../benchmark-results/performance-matched-acceptance/complete-quick-retry/report.md), with 140 measured trials and 28 excluded warmups. Independent integrity checks verified group/order membership, positive finite timings, frame sample counts, scroll return position, complete plain DOM counts and actual matrix count of 1,024. All 168 trials valid; owned servers and browsers closed. Full/stress profiles were not run for this optimization.

Earlier complete attempt remains [partial](../../benchmark-results/performance-matched-acceptance/complete-quick/report.md): 167 valid, one Chromium window-feed startup timeout before any measured phase. Original cause could not be recovered; old catch path discarded collected page errors. Thirty fresh-context startup checks passed against unchanged app. Final full retry also passed unchanged startup deadline of 15 seconds.

Runner now preserves page errors/name/stack and bounded one-second best-effort page state on failure only. Valid path and measured app/library bytes remain unchanged. Real isolated broken-module test retained decisive browser error plus timeout, exited after cleanup, then successfully ran repaired case. [Startup proof](../../benchmark-results/performance-matched-acceptance/startup-proof/README.md) retains fault/recovery reports, exact sources, hashes and thirty repetitions. This improves future diagnosis; it does not claim to fix unexplained original timeout.

## Integrated correctness validation

- Frozen dependency install, lint, library/benchmark typechecks, recursive unit suites, library production build, public-package checks and docs build passed. Package dry run contains no deferred SizeIndex module or declarations.
- Existing E2E suite: 44 passed, 18 existing skips.
- Production benchmark browser suite: 54 passed, three skips, one table-test polling race. The callback dereferenced a transient empty visible-record array immediately after scrolling. It now keeps polling for the same required ID; all content, membership, geometry and native-width assertions remain. Focused final table rerun: eight passed across both engines/modes. Together these runs cover all 55 active checks; the initial broad command is not reported as wholly green.
- Final dynamic scenarios passed in Chromium and Firefox: independent owners/consumers, two-key synchronous geometry, same-key content replacement, stale binding rejection, disable/re-enable, reset and independent cache restore. Table native-auto geometry and missing-revision fault remain independent of implementation tokens.
- Isolated dropped-dirty-key, stale observer, stale certification, missing table revision, signed CDP timestamp and source-map-chain faults failed their intended assertions. Raw proof manifests/logs remain under ignored `benchmark-results/`.
- Final failure-only runner changes passed real startup failure/recovery test, full lint, benchmark typecheck and recursive library/benchmark unit suites. New source/test files remain below 300 lines; final diff check passed.
- No public API or default guard change; no staging, commit or push during this implementation.

## Conditional slices deferred by actual gate

**03 — indexed geometry:** no production integration. New trace leaves only ~10.2ms feed / 28.4ms table inclusive prefix work over three-second scroll. Chromium feed/table p95 is ~16.8ms in three diagnostic uninstrumented runs, without >50ms intervals. A segment tree no longer targets a material remaining bottleneck. Pure prototype, seven passing tests and two failed deliberate defects retained under ignored `benchmark-results/size-index-prototype/`; unused source/declarations removed from library tree.

**04 — single recycler:** duplicate ownership confirmed, but post-pipeline instrumented exclusive operation totals are only ~25–82ms per owner over three-second scroll. Maximum individual update ~1.5ms feed / 0.6ms horizontal, size publication ~1.0/0.6ms. Required initialization cannot all be removed; no ablation establishes renderer-refactor speedup. Private diagnostic retained under ignored `benchmark-results/single-owner-diagnostic/`. No high-risk viewport renderer extraction.

## Evidence boundaries

Candidate gate: `benchmark-results/performance-candidate-gate-02/`. Sixteen virtual-only uninstrumented runs valid (four excluded warmups, twelve measured), plus two exact Chromium CPU captures valid. Firefox per-trial p95: feed 17.5–33.5ms, table 17.1–33.3ms; zero or one interval over 50ms. Requested/actual path and return verified. This diagnostic gate is not five-pair performance acceptance.

Fresh baseline feed: five paired trials per engine, all 24 trials valid including four warmups. Its wide variability and brief parser-check overlap are retained in provenance; no individual trials discarded. Original table-policy and new-policy/old-library controls remain distinct to avoid attributing harness improvement to core library.

Existing restore-first cache precedence remains compatible. Post-restore live remeasurement limitation was identified as preexisting and not silently changed in this optimization; restored geometry and reset/lifecycle behavior are separately tested. No heap/FPS/input-latency claims.
