import type { Page } from '@playwright/test'
import type { CaseConfig } from '../../workloads/registry'
import { expect } from '@playwright/test'

/** Open real production case and wait for prepared controller, not an arbitrary delay. */
export async function openCase(page: Page, config: Partial<CaseConfig> = {}) {
  const input = { workload: 'issue-inbox', mode: 'virtual', count: 1000, seed: 2026, ...config }
  await page.goto(`/case.html?${new URLSearchParams({ ...input, count: String(input.count), seed: String(input.seed) })}`)
  await page.waitForFunction(() => window.benchmark || window.benchmarkError)
  expect(await page.evaluate(() => window.benchmarkError)).toBeUndefined()
  await page.evaluate(() => window.benchmark!.mount())
}
