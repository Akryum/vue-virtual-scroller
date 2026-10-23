import process from 'node:process'
import { command } from '../build.mjs'
import { captureSuite, traceOptions } from './capture.mjs'

try {
  const args = process.argv.slice(2)
  const options = traceOptions(args)
  if (!args.includes('--app-root')) {
    await command(['--filter', 'vue-virtual-scroller', 'build'])
    await command(['--filter', '@vue-virtual-scroller/benchmarks', 'exec', 'vite', 'build', '--sourcemap'])
  }
  const report = await captureSuite(options)
  process.exitCode = report.status === 'complete' ? 0 : report.status === 'cancelled' ? 130 : 1
}
catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
