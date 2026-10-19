import process from 'node:process'
import { parseOptions } from './options.mjs'
import { runSuite } from './runner.mjs'

try {
  const report = await runSuite(parseOptions(process.argv.slice(2)))
  process.exitCode = report.status === 'complete' ? 0 : report.status === 'cancelled' ? 130 : 1
}
catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
