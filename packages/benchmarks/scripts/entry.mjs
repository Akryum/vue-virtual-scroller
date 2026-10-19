import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { build } from './build.mjs'
import { parseOptions } from './options.mjs'
import { runSuite } from './runner.mjs'

try {
  const options = parseOptions(process.argv.slice(2), fileURLToPath(new URL('../../../', import.meta.url)))
  await build()
  const report = await runSuite(options)
  process.exitCode = report.status === 'complete' ? 0 : report.status === 'cancelled' ? 130 : 1
}
catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
