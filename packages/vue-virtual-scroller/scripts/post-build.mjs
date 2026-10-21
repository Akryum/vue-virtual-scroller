import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const dist = resolve(fileURLToPath(import.meta.url), '../../dist')

for (const file of ['types']) {
  rmSync(resolve(dist, `${file}.js`), { force: true })
  rmSync(resolve(dist, `${file}.js.map`), { force: true })
}

const cssContent = `declare const css: string;\nexport default css;`
for (const ext of ['d.css', 'css.d']) {
  writeFileSync(resolve(dist, `vue-virtual-scroller.${ext}.ts`), cssContent, 'utf-8')
}

const indexDts = resolve(dist, 'index.d.ts')
const indexDtsContent = readFileSync(indexDts, 'utf-8')
writeFileSync(
  indexDts,
  indexDtsContent
    .replace(/from (["'])(\.\/components\/DynamicScroller)(["'])/, 'from $1$2.js$3')
    .replace(/from (["'])(\.\/components\/DynamicScrollerItem)(["'])/, 'from $1$2.js$3')
    .replace(/from (["'])(\.\/components\/RecycleScroller)(["'])/, 'from $1$2.js$3')
    .replace(/from (["'])(\.\/components\/WindowScroller)(["'])/, 'from $1$2.js$3'),
  'utf-8',
)
