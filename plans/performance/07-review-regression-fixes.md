# Review-driven regression fixes

## Scope

Follow-up to the inbox/matrix investigation. Fix confirmed review findings, repeat independent subagent review, and retain failure-sensitive proof. Preserve existing dirty work and immutable benchmark reports. No commits or pushes.

Current evidence lives under ignored `benchmark-results/review-fixes-2026-10-23/`. Previous inbox/matrix timing reports remain frozen and describe their captured builds; these fixes do not silently update those measurements or establish a new performance result.

## Public reactive size compatibility

The external-record watcher previously inspected own properties only. A reactive record inheriting reactive sizes could report new values through `getItemSize()` while offsets/cache stayed stale: 110 instead of 170 after two inherited changes.

The first correction scanned prototype properties. Independent review demonstrated a new regression: it evaluated unrelated lazy getters and could throw during an otherwise valid size-record assignment. That approach was removed before final validation.

The final watcher reads cached logical item keys through the original record. This preserves inherited and non-enumerable entries, getter receivers, shadowing, missing-key additions, and changing membership without reading unrelated properties. The key callback is lazy; sequence ownership exists before the external watcher can call it. Normal library-owned records retain their keyed Proxy path.

Real Vue tests cover inherited changes, immediate offsets/cache, hidden properties, shadows/deletion, getter receivers, unused own/inherited getters, appended missing IDs, replacement, membership removal, readonly/ref aliases, and disposal. An independent adversarial public API probe confirms unused getter reads stay zero.

Production browser coverage reuses the existing two-owner fixture. It moves changed rows offscreen before adopting inherited sizes, changes two values, then checks immediate offset 490, sizes `[80, 90, 40]`, native anchor preservation, snapshots, unaffected second owner, and reset. Replacing only the copied production app's watcher with the old own-only logic makes both engines fail at offset 400 versus 490 while public sizes remain correct. The shared sources are never fault-injected.

## Trace CLI argument boundaries

The metadata extractor previously interpreted every token through a plain-object lookup. Valid `--output mystage` and `--output myapp-root` failed; inherited names such as `--constructor` bypassed validation. Prefix and own-property checks fix both paths.

A subsequent independent review found that extracting metadata could repair malformed common arguments: `--count --stage candidate 30` became valid count 30. Common flag/value pairs now remain atomic, with validation delegated to the existing shared parser. Existing separator, headed switch, negative values, and single-dash paths retain their behavior.

Tests exercise valid mixed metadata/common options, invalid inherited/positional names, missing operands, and a real invalid CLI subprocess that must fail before builds or output allocation. Independent probes checked 56 valid ordering combinations and six missing-operand cases.

## Identity-sensitive matrix details test

Record 99 and record 291 share their title. The original details assertion accepted an isolated wrong-target event: clicked record had 296 units, but details showed 29 units, and all four tests passed.

The assertion now checks exact expected stock `296 available units` and retains the title check. It also checks neighboring record 100 still displays 159 units. The correct production app passes all four browser/mode cases; the copied wrong-target app fails all four at the intended expected-stock assertion.

## Independent review boundaries

Fresh reviews examined the revised external-size watcher, wider dynamic/recycler pipeline, CLI grammar, matrix oracle, and public key/value compatibility. A prototype-name/value probe compared 14 public API scenarios against preserved baseline with no differences. Direct mutation of derived wrapper sizes was excluded as a regression claim because baseline itself resets that unsupported override.

Review findings were either fixed and rechecked or excluded with concrete baseline evidence. This establishes bounded coverage, not an assertion that every possible user workflow is regression-free. Earlier Firefox plain-operation timing shifts remain unresolved; no new cadence or speedup claim follows from these correctness fixes.

## Validation

- `pnpm lint` and `pnpm typecheck` passed.
- `pnpm test:unit` passed: 183 library tests and 45 benchmark tests.
- Production library and benchmark builds passed; final app/library bytes and source hashes are retained in the evidence directory.
- Focused browser green/fault proofs passed their intended outcomes in Chromium and Firefox.
- Full production benchmark browser suite passed: 76 tests, four existing skips, Chromium and Firefox.
- Existing E2E passed with one worker: 44 tests, 18 existing skips. This does not establish parallel-worker behavior.
- Package export checks, docs build, and package dry run passed through `pnpm test:ci`.
- Final identity check covered 178 source files with no changes and unchanged frozen app/library bytes. Logs and identity evidence are retained in `validation/` and the evidence index.

Actual broad commands: `pnpm --filter @vue-virtual-scroller/benchmarks test:browser`, `pnpm exec playwright test --workers=1 --trace retain-on-failure`, and `pnpm test:ci`. Performance timings are not collected concurrently with any validation work.
