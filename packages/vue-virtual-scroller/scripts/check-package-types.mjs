import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

/**
 * Compile real package consumers, including existing generic API assertions.
 * Missing declarations, broken relative imports, and lost inference must fail.
 */
export function checkPackageTypes(tempRoot, packageDir) {
  const manifest = JSON.parse(readFileSync(path.join(packageDir, 'package.json'), 'utf-8'))
  const genericAssertions = readFileSync(
    path.join(packageDir, 'src/typecheck/generic-composables.typecheck.ts'),
    'utf-8',
  )
    .replaceAll('\'../index\'', '\'vue-virtual-scroller\'')
    .replaceAll('\'../composables/', '\'vue-virtual-scroller/composables/')
  const subpathImports = Object.keys(manifest.exports)
    .filter(entry => entry !== '.' && !entry.endsWith('.css'))
    .map((entry, index) => `import * as subpath${index} from 'vue-virtual-scroller${entry.slice(1)}'\nvoid subpath${index}`)
    .join('\n')
  const entryPath = path.join(tempRoot, 'consumer.mts')

  writeFileSync(entryPath, `${genericAssertions}
${subpathImports}
import styles from 'vue-virtual-scroller/index.css'
import distStyles from 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
const css: string[] = [styles, distStyles]
// @ts-expect-error CSS declarations must retain their string type.
const invalidCss: number = styles
void css
`)

  for (const [name, module, moduleResolution] of [
    ['Node16', ts.ModuleKind.Node16, ts.ModuleResolutionKind.Node16],
    ['NodeNext', ts.ModuleKind.NodeNext, ts.ModuleResolutionKind.NodeNext],
    ['Bundler', ts.ModuleKind.ESNext, ts.ModuleResolutionKind.Bundler],
  ]) {
    const options = {
      module,
      moduleResolution,
      target: ts.ScriptTarget.ES2022,
      strict: true,
      noEmit: true,
      skipLibCheck: false,
      noUncheckedSideEffectImports: true,
      allowArbitraryExtensions: true,
      types: [],
    }
    const host = ts.createCompilerHost(options)
    const program = ts.createProgram([entryPath], options, host)
    const diagnostics = ts.getPreEmitDiagnostics(program)

    if (diagnostics.length) {
      throw new Error(`Package declarations failed under ${name}:\n${ts.formatDiagnostics(diagnostics, host)}`)
    }
  }
}
