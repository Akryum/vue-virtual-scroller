/** Install optional exact-span observer; frozen older bundles use explicitly labelled wrappers. */
export async function installMarkers(page) {
  return page.evaluate(() => {
    const controller = window.benchmark
    let active
    let mounted = false
    let checks = 0
    let checkpoints = 0
    let exact = false
    window.profileSpans = []
    const mark = (span) => {
      if ((!active && span.phase !== 'scroll') || (span.phase === 'unmount' && !mounted))
        return
      const index = window.profileSpans.length
      for (const edge of ['start', 'end'])
        performance.mark(`benchmark:${index}:${span.phase}:${edge}`, { startTime: span[edge] })
      window.profileSpans.push(span)
    }
    window.benchmarkPhaseObserver = (span) => {
      exact = true
      mark(span)
    }
    for (const name of ['mount', 'execute', 'unmount']) {
      const original = controller[name]
      controller[name] = async (...args) => {
        active = name === 'execute' ? args[0] : name
        const duration = await original(...args)
        if (!exact) {
          const end = performance.now()
          mark({ phase: active, start: end - duration, end, boundary: 'returned-duration fallback; end follows method correctness work' })
        }
        if (name === 'mount')
          mounted = true
        active = undefined
        return duration
      }
    }
    const verify = controller.verify
    controller.verify = (...args) => {
      if (++checks === 2 && !exact) {
        const start = window.profileScrollStart
        mark({ phase: 'scroll', start, end: performance.now(), boundary: 'checkpoint-to-verify fallback; includes tiny untimed glue' })
      }
      return verify(...args)
    }
    const inspect = controller.inspect
    controller.inspect = (...args) => {
      const result = inspect(...args)
      if (++checkpoints === 1)
        window.profileScrollStart = performance.now()
      return result
    }
  })
}
