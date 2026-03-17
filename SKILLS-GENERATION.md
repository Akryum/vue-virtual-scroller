# Skills Generation (vue-virtual-scroller)

This file is the canonical process for generating and updating package skills in this repository.

## Scope

This process currently covers one package skill:

- `packages/vue-virtual-scroller/skills/vue-virtual-scroller`

This process does not cover:

- `packages/demo` as a standalone skill target
- internal implementation-only helpers that are not documented as public APIs

## Sources of truth

Always generate skill content from public documentation first, not from memory.

If implementation behavior appears to differ from docs, fix docs first, then regenerate the skill from the updated docs.

### Primary docs

- `docs/index.md`
- `docs/guide/index.md`
- `docs/guide/recycle-scroller.md`
- `docs/guide/dynamic-scroller.md`
- `docs/guide/dynamic-scroller-item.md`
- `docs/guide/id-state.md`
- `docs/guide/use-recycle-scroller.md`

### Supporting examples

Use these to sharpen examples and workflow guidance, not to invent undocumented API behavior:

- `docs/demos/index.md`
- `docs/demos/recycle-scroller.md`
- `docs/demos/dynamic-scroller.md`
- `docs/demos/chat.md`
- `docs/demos/simple-list.md`
- `docs/demos/horizontal.md`
- `docs/demos/grid.md`
- `docs/demos/test-chat.md`
- `packages/demo/src/**`

### Public-export verification

Use these only to verify package exports, option names, and known docs gaps:

- `packages/vue-virtual-scroller/src/index.ts`
- `packages/vue-virtual-scroller/src/types.ts`
- `packages/vue-virtual-scroller/README.md`

If an exported surface is not documented enough to support skill content, update docs first or explicitly leave that surface out of the generated skill.

Current areas that require extra care:

- `docs/guide/id-state.md` describes `IdState`, while the current package exports `useIdState`
- `useDynamicScroller` and `useDynamicScrollerItem` are exported but do not currently have guide pages
- plugin install options such as `installComponents` and `componentsPrefix` are exported but not fully documented in the guide

Do not silently fill those gaps from source code into the skill. Either document them first or keep them out of the generated skill.

## Output files

Generate one skill folder for the published package:

1. `packages/vue-virtual-scroller/skills/vue-virtual-scroller/SKILL.md`
2. `packages/vue-virtual-scroller/skills/vue-virtual-scroller/references/index.md`
3. One reference file per documented public surface or recurring workflow

Expected initial reference set for this repo:

- `packages/vue-virtual-scroller/skills/vue-virtual-scroller/references/installation-and-setup.md`
- `packages/vue-virtual-scroller/skills/vue-virtual-scroller/references/recycle-scroller.md`
- `packages/vue-virtual-scroller/skills/vue-virtual-scroller/references/dynamic-scroller.md`
- `packages/vue-virtual-scroller/skills/vue-virtual-scroller/references/dynamic-scroller-item.md`
- `packages/vue-virtual-scroller/skills/vue-virtual-scroller/references/use-recycle-scroller.md`

Optional reference files:

- `packages/vue-virtual-scroller/skills/vue-virtual-scroller/references/id-state.md` only after docs and exports are reconciled
- `packages/vue-virtual-scroller/skills/vue-virtual-scroller/references/patterns-and-guardrails.md` if the core skill becomes too dense

Do not force an `api-*.md` naming pattern here. This repo is better represented by one file per component, composable, or usage decision.

## Required `SKILL.md` structure

Each generated `SKILL.md` should include:

1. YAML frontmatter:
   - `name`
   - `description` as a single line that clearly mentions Vue virtual scrolling, `RecycleScroller`, `DynamicScroller`, and headless usage so the skill triggers correctly
2. Title and one-line summary
3. A quick decision table for when to use:
   - `RecycleScroller`
   - `DynamicScroller`
   - `DynamicScrollerItem`
   - `useRecycleScroller`
4. Setup snippet that includes:
   - package install
   - ESM-only note
   - CSS import (`vue-virtual-scroller/index.css`)
   - plugin install or direct component import
5. Practical guidance sections for:
   - choosing fixed-size vs variable-size rendering
   - when to switch from `RecycleScroller` to `DynamicScroller`
   - required sizing/CSS constraints
   - performance guardrails and reuse pitfalls
   - common layouts such as chat feeds, grids, and horizontal scrollers
6. References section containing a table with `Topic`, `Description`, and `Reference`
7. Further reading section linking only to shipped reference files and, if needed, stable package-level external URLs

## Required references structure

Each skill should include a `references/` folder with surface-focused reference files. Keep references one level deep from `SKILL.md`.

Mandatory layout:

- `references/index.md`: maps each documented surface and workflow topic to exactly one reference file
- `references/<surface>.md`: one file per documented public surface or focused workflow

Each reference file should:

- start with a short title and one-line scope
- include a short provenance section without referencing repository-local file paths outside the published package
- include sections in this order when possible:
  - `When to use`
  - `Required inputs`
  - `Core props/options`
  - `Events/returns`
  - `Pitfalls`
  - `Example patterns`
- stay grounded in current docs
- focus on user-facing behavior, not internal implementation detail
- avoid chaining into nested references
- avoid bundling unrelated surfaces into one file

## Writing constraints

- Keep guidance practical and tied to current public behavior.
- Prefer decisions and guardrails over generic marketing language.
- Always mention that the package is Vue 3 and ESM-only when setup is discussed.
- Always mention the required CSS import when installation/setup is discussed.
- Do not invent APIs, props, events, or helper functions that are not documented.
- Do not describe Vue 2 usage in the generated skill for this repo.
- Use demo pages to illustrate patterns such as chat streams, grids, horizontal scrolling, and stress-tested append flows.
- Never reference repository-local files outside the published package from `SKILL.md` or `references/*.md`.
- In shipped skill files, only link to other shipped skill files or stable external package URLs.
- If the repo documents AI-agent consumption with `skills-npm`, keep that guidance in the VitePress docs, not in the shipped skill files.
- Do not generate or update `agents/openai.yaml` for this workflow.

## Generation workflow

### 1. Gather context

```bash
rg --files docs packages/vue-virtual-scroller
rg -n "RecycleScroller|DynamicScroller|DynamicScrollerItem|useRecycleScroller|useDynamicScroller|useDynamicScrollerItem|useIdState|installComponents|componentsPrefix|ESM" \
  docs \
  packages/vue-virtual-scroller/src/index.ts \
  packages/vue-virtual-scroller/src/types.ts \
  packages/vue-virtual-scroller/README.md
```

Read the primary docs files first.

Use demos and package exports to check scope and examples.

If docs are missing, outdated, or contradictory, update docs first and use the updated docs as the generation input.

### 2. Decide skill coverage

Start from documented public surfaces only.

For the current repo baseline, the minimum covered surfaces should be:

- installation/setup
- `RecycleScroller`
- `DynamicScroller`
- `DynamicScrollerItem`
- `useRecycleScroller`

Only add `id-state`, `useDynamicScroller`, `useDynamicScrollerItem`, or plugin option references after the docs clearly support them.

### 3. Generate or update the skill

- Regenerate `SKILL.md` using the required structure above.
- Regenerate `references/index.md`.
- Regenerate one reference file per documented surface or workflow topic.
- Ensure `SKILL.md` links to `references/index.md`.
- Keep the top-level skill concise and move detail into `references/*.md`.

### 4. Validate generated skill files

```bash
sed -n '1,260p' packages/vue-virtual-scroller/skills/vue-virtual-scroller/SKILL.md
sed -n '1,260p' packages/vue-virtual-scroller/skills/vue-virtual-scroller/references/index.md
rg --files packages/vue-virtual-scroller/skills/vue-virtual-scroller/references
```

Checklist:

- [ ] Frontmatter is valid and the description is specific enough to trigger on virtual scrolling tasks.
- [ ] Setup guidance includes the ESM-only note and the CSS import.
- [ ] The choose-the-right-surface guidance distinguishes `RecycleScroller`, `DynamicScroller`, and headless usage correctly.
- [ ] Fixed-size, variable-size, page mode, and common performance pitfalls are grounded in current docs.
- [ ] `references/index.md` exists and links to every reference file.
- [ ] Each reference file covers one surface or one focused workflow only.
- [ ] No shipped skill file links to repository-local paths outside the package.
- [ ] Any API not fully documented in the guide has been omitted or documented first.

### 5. Record generation metadata

After regeneration, update this document with:

- generation date
- docs/package baseline commit SHA
- version notes if the public package surface changed
- generated artifacts

## Incremental update process

When docs or public exports change, update only impacted skill sections.

```bash
git diff <last_skill_sha>..HEAD -- docs packages/vue-virtual-scroller/src/index.ts packages/vue-virtual-scroller/src/types.ts packages/vue-virtual-scroller/README.md
git diff --name-only <last_skill_sha>..HEAD -- docs packages/vue-virtual-scroller/src/index.ts packages/vue-virtual-scroller/src/types.ts packages/vue-virtual-scroller/README.md
```

Then:

1. Map changed docs or export files to affected skill sections.
2. If exports changed without docs updates, fix docs first unless the skill already omits that surface.
3. Update only the affected `SKILL.md` sections and reference files.
4. Re-run the validation checklist.
5. Refresh metadata below.

## Current generation metadata

- Last generation date: `2026-03-10T14:40:32+01:00`
- Baseline commit SHA: `4ffe378192353c24e474d7541c649613458cf1eb`
- Baseline short SHA: `4ffe378`
- Baseline commit date: `2026-03-10T14:25:42+01:00`
- Baseline commit message: `refactor: esm only`
- Generated artifacts:
  - `packages/vue-virtual-scroller/skills/vue-virtual-scroller/SKILL.md`
  - `packages/vue-virtual-scroller/skills/vue-virtual-scroller/references/index.md`
  - `packages/vue-virtual-scroller/skills/vue-virtual-scroller/references/installation-and-setup.md`
  - `packages/vue-virtual-scroller/skills/vue-virtual-scroller/references/recycle-scroller.md`
  - `packages/vue-virtual-scroller/skills/vue-virtual-scroller/references/dynamic-scroller.md`
  - `packages/vue-virtual-scroller/skills/vue-virtual-scroller/references/dynamic-scroller-item.md`
  - `packages/vue-virtual-scroller/skills/vue-virtual-scroller/references/use-recycle-scroller.md`

## Notes

- There is no dedicated generation script in this repository yet.
- Generation is currently a documented manual process with reproducible inspection commands.
- `packages/demo` exists as an example application and validation aid, not as a primary skill output target.
- To make shipped skills consumable through `skills-npm`, the published `vue-virtual-scroller` package must include the `skills/` directory in its packaged files.
