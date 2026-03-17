# AI & Skills

If you use AI coding agents, `vue-virtual-scroller` ships a package skill that can be discovered from the installed npm package.

## One-off usage with `npx skills-npm`

After installing `vue-virtual-scroller` in your project:

```bash
pnpm add vue-virtual-scroller@next
npx skills-npm
```

This lets supported coding agents discover the skill that ships inside the package.

## Repeatable setup

If you want skill links to refresh automatically after installs:

```bash
npm i -D skills-npm
```

Add a `prepare` script in your project:

```json
{
  "scripts": {
    "prepare": "skills-npm"
  }
}
```

## Useful options

- `--source <source>` chooses `package.json` or `node_modules`
- `--cwd <cwd>` targets a specific workspace root
- `--recursive` scans monorepos
- `--dry-run` previews the generated links
- `--yes` skips prompts

For more control, create a `skills-npm.config.ts` file in your consumer project.

Learn more about `skills-npm` [here](https://github.com/antfu/skills-npm#skills-npm).

## Notes

- Run `skills-npm` from the consumer project root, not from this package repository.
- Generated links are typically local setup artifacts. Add `skills/npm-*` to `.gitignore` if you do not want them committed.
- The published `vue-virtual-scroller` package includes its `skills/` directory so discovery tools can find the shipped skill.
