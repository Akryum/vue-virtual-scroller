import { existsSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

const packageDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distEntryPath = path.join(packageDir, 'dist/vue-virtual-scroller.js')

const smokeCases = [
  {
    name: 'plugin-default',
    source: `import VueVirtualScroller from 'vue-virtual-scroller'
export default VueVirtualScroller
`,
  },
  {
    name: 'composable-recycle',
    source: `import { useRecycleScroller } from 'vue-virtual-scroller/composables/useRecycleScroller'
export { useRecycleScroller }
`,
  },
  {
    name: 'component-recycle',
    source: `import RecycleScroller from 'vue-virtual-scroller/components/RecycleScroller'
export default RecycleScroller
`,
  },
]

/**
 * Throw with stable message when expected package build artifacts are missing.
 */
function assertBuiltPackage() {
  if (!existsSync(distEntryPath)) {
    throw new Error(`Missing built package entry at ${distEntryPath}. Run \`pnpm build\` first.`)
  }
}

/**
 * Create isolated temp consumer root with package symlinked into node_modules.
 */
function createTempConsumerRoot() {
  const tempRoot = mkdtempSync(path.join(tmpdir(), 'vue-virtual-scroller-package-'))
  const nodeModulesDir = path.join(tempRoot, 'node_modules')

  mkdirSync(nodeModulesDir, { recursive: true })
  symlinkSync(packageDir, path.join(nodeModulesDir, 'vue-virtual-scroller'), 'dir')

  return tempRoot
}

/**
 * Bundle one consumer entry against package exports and return emitted chunks.
 */
async function buildSmokeCase(tempRoot, smokeCase) {
  const caseRoot = path.join(tempRoot, smokeCase.name)
  const entryPath = path.join(caseRoot, 'entry.ts')

  mkdirSync(caseRoot, { recursive: true })
  writeFileSync(entryPath, smokeCase.source)

  const result = await build({
    root: caseRoot,
    configFile: false,
    logLevel: 'silent',
    build: {
      write: false,
      emptyOutDir: false,
      minify: false,
      target: 'es2020',
      lib: {
        entry: entryPath,
        formats: ['es'],
        fileName: () => `${smokeCase.name}.js`,
      },
      rollupOptions: {
        external: ['vue', 'mitt'],
      },
    },
  })

  const outputs = Array.isArray(result) ? result : [result]
  const chunks = []

  for (const output of outputs) {
    for (const item of output.output) {
      if (item.type === 'chunk') {
        chunks.push(item)
      }
    }
  }

  if (!chunks.length) {
    throw new Error(`No JS chunks emitted for smoke case ${smokeCase.name}.`)
  }

  return chunks
}

/**
 * Assert no bundled chunk still depends on external mitt runtime.
 */
function assertNoMittImport(chunks) {
  const hasMittImport = chunks.some(chunk =>
    chunk.imports.includes('mitt')
    || chunk.code.includes(`from "mitt"`)
    || chunk.code.includes(`from 'mitt'`),
  )

  if (hasMittImport) {
    throw new Error('Direct useRecycleScroller package export still pulls `mitt`.')
  }
}

/**
 * Run package export smoke checks against built dist output.
 */
async function main() {
  assertBuiltPackage()

  const tempRoot = createTempConsumerRoot()

  try {
    const results = new Map()

    for (const smokeCase of smokeCases) {
      results.set(smokeCase.name, await buildSmokeCase(tempRoot, smokeCase))
    }

    assertNoMittImport(results.get('composable-recycle'))
  }
  finally {
    rmSync(tempRoot, { recursive: true, force: true })
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
