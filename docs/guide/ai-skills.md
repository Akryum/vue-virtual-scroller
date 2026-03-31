# AI & Skills

If you use AI coding agents, `vue-virtual-scroller` ships a package skill that discovery tools can pick up from the installed npm package.

## One-off usage with `npx skills-npm`

After installing `vue-virtual-scroller` in your project:

```bash
pnpm add vue-virtual-scroller
npx skills-npm
```

This is the quickest way to expose the bundled skill to supported agents.

## Repeatable setup

If you want the skill links to stay up to date after installs, add `skills-npm` to your project:

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

- `--source <source>` chooses between `package.json` and `node_modules`
- `--cwd <cwd>` points the command at a specific workspace root
- `--recursive` scans a monorepo
- `--dry-run` previews the generated links
- `--yes` skips prompts

For more control, create a `skills-npm.config.ts` file in your consumer project.

You can learn more about `skills-npm` [in its documentation](https://github.com/antfu/skills-npm#skills-npm).

## Notes

- Run `skills-npm` from the consumer project root, not from this package repository.
- Generated links are typically local setup artifacts. Add `skills/npm-*` to `.gitignore` if you do not want them committed.
- The published `vue-virtual-scroller` package includes its `skills/` directory so discovery tools can find the bundled skill.
