import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

/** Spawn package-manager commands without a shell, retaining ordinary signal semantics. */
export function command(args, cwd = fileURLToPath(new URL('../../../', import.meta.url))) {
  return new Promise((resolve, reject) => {
    const child = spawn('pnpm', args, { cwd, stdio: 'inherit' })
    child.once('error', reject)
    child.once('exit', code => code === 0 ? resolve() : reject(new Error(`pnpm ${args.join(' ')} exited ${code}`)))
  })
}
/** Build public library exports first, then the private production harness. */
export async function build() {
  await command(['--filter', 'vue-virtual-scroller', 'build'])
  await command(['--filter', '@vue-virtual-scroller/benchmarks', 'build'])
}
