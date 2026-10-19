import type { Ref } from 'vue'
import type { Report } from '../reports/types'
import type { CaseConfig, Mode } from '../workloads/registry'
import { ref, shallowRef } from 'vue'
import { markdown, validateReport } from '../reports/summary.mjs'
import { validateConfig } from '../workloads/registry'

/** Interactive owner: one iframe, cancellation tokens, and the same controller as CLI. */
export function useHarness(iframe: Ref<HTMLIFrameElement | undefined>) {
  const busy = ref(false)
  const status = ref('Ready')
  const error = ref('')
  const report = shallowRef<Report>()
  let epoch = 0
  /** Wait for a prepared case rather than assuming iframe load means Vue is ready. */
  async function load(config: CaseConfig, token: number) {
    validateConfig(config)
    const target = iframe.value!
    await new Promise<void>((resolve, reject) => {
      let timeout: ReturnType<typeof setTimeout>
      const loaded = () => {
        clearTimeout(timeout)
        resolve()
      }
      timeout = setTimeout(() => {
        target.removeEventListener('load', loaded)
        reject(new Error('Iframe load timed out'))
      }, 15000)
      target.addEventListener('load', loaded, { once: true })
      target.src = `/case.html?${new URLSearchParams({ ...config, count: String(config.count), seed: String(config.seed) })}`
    })
    const start = performance.now()
    while (performance.now() - start < 15_000) {
      if (token !== epoch)
        throw new Error('Benchmark cancelled')
      const child = target.contentWindow
      if (child?.benchmarkError)
        throw new Error(child.benchmarkError)
      if (child?.location.pathname === '/case.html' && child.benchmark)
        return child.benchmark
      await new Promise(resolve => setTimeout(resolve, 20))
    }
    throw new Error('Benchmark case failed to initialise')
  }
  /** Guard publication by owner token so cancelled loads cannot overwrite a new session. */
  async function owned(work: (token: number) => Promise<void>) {
    const token = ++epoch
    busy.value = true
    error.value = ''
    status.value = 'Working'
    try {
      await work(token)
    }
    catch (reason) {
      if (token === epoch)
        error.value = String(reason)
    }
    finally {
      if (token === epoch) {
        busy.value = false
        if (status.value === 'Working' || status.value.startsWith('Pair') || status.value.startsWith('Warm-up'))
          status.value = 'Ready'
      }
    }
  }
  /** Mount selected workload for normal manual use. */
  function preview(config: CaseConfig) {
    return owned(async (token) => {
      const controller = await load(config, token)
      await controller.mount()
      controller.verify()
    })
  }
  /** Run action from identical original state. Manual controls stay outside measured document. */
  function action(config: CaseConfig, name: Parameters<NonNullable<Window['benchmark']>['execute']>[0]) {
    return owned(async (token) => {
      const controller = await load(config, token)
      await controller.mount()
      const duration = await controller.execute(name)
      controller.verify(name)
      status.value = `${name}: ${duration.toFixed(2)} ms`
    })
  }
  /** Paired trials use fresh documents; UI runs are labelled separately from isolated CLI contexts. */
  function compare(config: CaseConfig, trials: number) {
    return owned(async (token) => {
      if (!Number.isSafeInteger(trials) || trials < 1 || trials > 100)
        throw new Error('Paired trials must be an integer from 1 to 100')
      const result: Report = { schemaVersion: 1, status: 'partial', metadata: {
        timestamp: new Date().toISOString(),
        browser: navigator.userAgent,
        execution: 'interactive production iframe',
        profile: 'custom',
        seed: config.seed,
        viewport: [innerWidth, innerHeight],
        caseViewport: [960, 640],
        warmup: 'one excluded pair',
        metrics: 'time to settled render; scripted frame cadence; DOM checkpoints',
      }, trials: [] }
      report.value = result
      for (let pair = -1; pair < trials; pair++) {
        const order: Mode[] = pair % 2 === 0 ? ['virtual', 'plain'] : ['plain', 'virtual']
        for (const mode of order) {
          const controller = await load({ ...config, mode }, token)
          status.value = `${pair < 0 ? 'Warm-up' : `Pair ${pair + 1}/${trials}`} · ${mode}`
          const trial = await controller.run()
          if (token !== epoch)
            return
          result.trials.push({ ...trial, browser: navigator.userAgent.includes('Firefox') ? 'firefox' : 'chromium/other', pair, warmup: pair < 0 })
          report.value = { ...result }
          controller.dispose()
        }
      }
      result.status = result.trials.every(trial => trial.valid) ? 'complete' : 'partial'
      status.value = result.status === 'complete' ? 'Complete' : 'Partial'
      report.value = { ...result }
    })
  }
  /** Cancellation destroys measured document and suppresses every stale completion. */
  function cancel() {
    epoch++
    iframe.value?.contentWindow?.benchmark?.dispose()
    if (iframe.value)
      iframe.value.src = 'about:blank'
    if (report.value?.status === 'partial')
      report.value = { ...report.value, status: 'cancelled' }
    busy.value = false
    status.value = 'Cancelled'
  }
  /** Download current artifact without inserting imported content as HTML. */
  function download(format: 'json' | 'md') {
    if (!report.value)
      return
    const blob = new Blob([format === 'json' ? JSON.stringify(report.value, null, 2) : markdown(report.value)], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `report.${format}`
    anchor.click()
    URL.revokeObjectURL(url)
  }
  /** Validate imported report contract before publishing it. */
  async function importReport(event: Event) {
    try {
      const file = (event.target as HTMLInputElement).files?.[0]
      if (file) {
        report.value = validateReport(JSON.parse(await file.text()))
        error.value = ''
      }
    }
    catch (reason) { error.value = String(reason) }
  }
  return { busy, status, error, report, preview, action, compare, cancel, download, importReport }
}
