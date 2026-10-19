import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { build, command } from './build.mjs'

try {
  await build()
  await command(['exec', 'playwright', 'test'], fileURLToPath(new URL('../', import.meta.url)))
}
catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
