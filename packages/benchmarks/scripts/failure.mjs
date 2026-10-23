/** Best-effort startup evidence only after failure; never delay cleanup beyond one second. */
export async function startupFailure(page) {
  if (!page || page.isClosed())
    return { closed: true }
  let timeout
  try {
    return await Promise.race([
      page.evaluate(() => ({
        url: location.href,
        readyState: document.readyState,
        visibility: document.visibilityState,
        controllerPublished: Boolean(window.benchmark),
        initializationError: window.benchmarkError,
        resources: performance.getEntriesByType('resource').slice(-50).map(entry => ({ name: entry.name, duration: entry.duration })),
      })),
      new Promise(resolve => timeout = setTimeout(resolve, 1000, { diagnosticError: 'Startup state unavailable after 1000ms' })),
    ])
  }
  catch (error) { return { diagnosticError: error.message } }
  finally { clearTimeout(timeout) }
}

/** Merge newly delivered errors without duplicating previously reconciled evidence. */
export function recordPageErrors(trial, errors, pageErrors, reported = 0) {
  if (errors.length === reported)
    return reported
  trial.valid = false
  trial.error = [...new Set([trial.error, ...errors.slice(reported)].filter(Boolean))].join('; ')
  trial.failure = { stage: 'trial', ...trial.failure, pageErrors: [...pageErrors] }
  return errors.length
}
