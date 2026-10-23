# Performance improvement plans

Status: slices 01, 02 and 05 implemented and validated; conditional 03/04 deferred by measured gates. See [implementation, results and limits](./implementation.md). Original plans and historical evidence retained below.

October 23 follow-up: [inbox and matrix investigation](./06-inbox-matrix-followup.md), including native Firefox setter evidence, benchmark header isolation, and same-day ABBA measurement protocol.

Subsequent review: [public-size, CLI and test-oracle fixes](./07-review-regression-fixes.md), including independent adversarial probes and final validation evidence.

Baseline: `a61d864fd5d9bc67fa338db6a8d3d4e5f5c051a2` (`feat(benchmarks): add realistic browser benchmark suite`). Recheck HEAD and working tree before implementation; preserve concurrent work. No commits or pushes unless requested.

## Goal

Reduce dynamic scrolling and update stalls at 10,000 records while retaining content identity, geometry, anchoring, public APIs, and benchmark fairness. Small mounted DOM is already working; the main remaining cost is processing the full logical collection after local measurements.

## Reading order and delivery sequence

1. [Evidence and limits](./evidence.md): retained observations, exact raw artifacts, source paths, confirmed versus inferred causes.
2. [Validation and repeatable profiling](./05-validation-and-profiling.md), stage A: preserve/reproduce baseline before changing runtime behavior.
3. [Explicit table width dependencies](./01-table-width-dependencies.md): independent, low-risk application change; preserves existing library deep-watch semantics. Report this as benchmark/example usage improvement, not general library improvement.
4. [Separate dynamic structure from measurements](./02-dynamic-measurement-pipeline.md): library change with greatest broad value. Avoid full wrapper/key reconciliation for size-only updates.
5. [Indexed variable-size geometry](./03-variable-size-index.md): after plan 02, remove remaining full prefix-size rebuilds on the private owned-dynamic path. Keep generic variable-size API fallback.
6. [Single recycler owner in component mode](./04-single-recycler-owner.md): conditional, evidence gate first. Source shows two owners today; measure their incremental cost before refactoring renderer ownership.
7. [Validation and repeatable profiling](./05-validation-and-profiling.md), stage B: complete final correctness, compatibility, and performance evaluation.

Plans 02 and 03 share the same private sequence bridge; implement them in order, without another registry, measurement queue, RNG, fixture generator, or timing definition. Plan 01 can ship independently. Complete one slice and its evidence before starting the next. Plan 04 is not prerequisite for headless-table improvements.

## Boundaries

- Preserve existing public exports, option defaults, return types, event/slot contracts, and CSS behavior. Internal modules do not become package exports. New public opt-out flags are outside these plans.
- Keep genuine plain Vue rendering, identical data/content/actions and shared column policy. No pagination, `content-visibility`, altered row complexity, larger buffers, raised rendered-item guard, or relaxed correctness checks.
- Preserve same-key object replacement, append retention, prepend anchors, simple arrays, function keys, cache restore, disable/re-enable, and both axes. Never hide regressions by measuring mount alone.
- Reuse actual Vue, shipped library exports, production browser layout, existing runner and shared deterministic data. Existing jsdom tests are supplemental, not proof of real geometry.
- New source/test files below 300 lines; split internal responsibilities. Add JSDoc contracts and comments around invalidation, scheduling, anchoring, and cleanup. No unrelated rewrite of large legacy modules.
- Traces are diagnostic, not baseline timing data. Performance remains informational in CI; correctness failures fail CI.

## Performance targets

These are engineering targets for same-machine, newly matched baselines, not claims already established by three runs:

- At 10,000 items, reduce median per-trial scripted-scroll p95 by at least 40% for both activity-feed and customer-table after plans 02/03. Prefer intervals near display cadence; do not promise 60 FPS from RAF data.
- Reduce table resize median by at least 30% after plan 01, with same column geometry contract. Profile should remove the width-policy full-row traversal.
- Reduce >50ms scroll intervals and whole-list scan attribution; retain all correctness and DOM bounds. Review mount, append/prepend, update, sort, resize and jump independently.
- Watch for repeated >10% median regressions in other phases on matched captures. Such a result requires diagnosis/retest and explicit tradeoff documentation, not a flaky CI threshold or automatic rejection based on one sample.
- If correctness passes but a slice does not improve its targeted cost, retain evidence, mark target unmet, and stop/defer that optimization rather than claim success.

## Deliverables per implemented slice

Source and useful tests; isolated fault-probe evidence for high-risk behavior; production browser proof in Chromium and Firefox; versioned raw benchmark reports and trace manifests with actual SHA/dirty state; short before/after explanation distinguishing source evidence, sampled CPU estimates and uninstrumented timings.

Large traces stay under ignored `benchmark-results/`. This directory retains enough evidence and decisions to make plans useful without those local artifacts. Baseline evidence is historical and must not be silently overwritten with candidate data.
