import { spawn } from 'node:child_process'
import { mkdtemp, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { expect, test } from '@playwright/test'

/** Actual production runner; native page error arrives during awaited diagnostics. */
async function run(output: string, browser: string) {
  const runner = new URL('../../scripts/runner.mjs', import.meta.url).href
  const options = { profile: 'quick', browser, workload: 'issue-inbox', counts: [30], trials: 1, seed: 2026, headed: false, output, modes: ['virtual'] }
  const code = `
    const {writeFile}=await import('node:fs/promises');
    const completed=[];
    const {runSuite}=await import(${JSON.stringify(runner)});
    const report=await runSuite({...${JSON.stringify(options)},async observeTrial(page,base){
      if(base.warmup)return;
      const failure=page.waitForEvent('pageerror',{timeout:5000});
      await page.evaluate(()=>{
        const original=window.benchmark.run;
        window.benchmark.run=async()=>{
          const result=await original();
          setTimeout(()=>{throw new Error('Late diagnostic page error')},50);
          return result;
        };
      });
      return async()=>{await failure};
    },onTrialComplete(trial){completed.push(structuredClone(trial))}});
    await writeFile(${JSON.stringify(join(output, 'finalized.json'))},JSON.stringify(completed));
    process.exitCode=report.status==='complete'?0:1;
  `
  return new Promise<number | null>((resolve, reject) => {
    const child = spawn(process.execPath, ['--input-type=module', '-e', code], { stdio: 'ignore' })
    const timeout = setTimeout(() => {
      child.kill('SIGTERM')
      reject(new Error('Runner did not close owned resources'))
    }, 60_000)
    child.once('error', (error) => {
      clearTimeout(timeout)
      reject(error)
    })
    child.once('exit', (status) => {
      clearTimeout(timeout)
      resolve(status)
    })
  })
}

// Preflight: one real late failure must invalidate measured trial while preserving
// successful warmup and raw phases. Natural process exit proves owned cleanup.
test('page errors during diagnostic collection invalidate final report', async ({ browserName }) => {
  const output = await mkdtemp(join(tmpdir(), 'vvs-late-error-'))
  expect(await run(output, browserName)).toBe(1)
  const report = JSON.parse(await readFile(join(output, 'report.json'), 'utf8'))
  expect(report.status).toBe('partial')
  expect(report.trials).toHaveLength(2)
  expect(report.trials[0]).toMatchObject({ warmup: true, valid: true })
  const measured = report.trials[1]
  expect(measured).toMatchObject({ warmup: false, valid: false, workload: 'issue-inbox' })
  expect(measured.error).toContain('Late diagnostic page error')
  expect(measured.failure.pageErrors[0].message).toBe('Late diagnostic page error')
  expect(measured.phases.select).toBeGreaterThan(0)
  const finalized = JSON.parse(await readFile(join(output, 'finalized.json'), 'utf8'))
  expect(finalized).toHaveLength(2)
  expect(finalized[0].valid).toBe(true)
  expect(finalized[1].valid).toBe(false)
  expect(finalized[1].error).toContain('Late diagnostic page error')
})
