import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

/** Missing analysis is expected when collection failed before analysis began. */
async function readOptional(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'))
  }
  catch (error) {
    if (error.code !== 'ENOENT')
      throw error
  }
}

/** Merge final state into one artifact without dropping earlier raw evidence. */
async function writeArtifact(output, id, kind, trial) {
  const path = join(output, `${id}.${kind}.json`)
  const previous = await readOptional(path)
  if (kind === 'result')
    await writeFile(path, JSON.stringify({ ...previous, ...trial }, null, 2))
  else if (previous)
    await writeFile(path, JSON.stringify({ ...previous, valid: trial.valid, error: trial.error }))
}

/** Publish reconciled artifacts and manifest together; failures reject every writable artifact. */
export async function finalizeCapture(output, capture, trial, publishManifest) {
  capture.valid = trial.valid
  capture.error = trial.error
  delete capture.unreconciledArtifacts
  try {
    for (const kind of ['result', 'analysis'])
      await writeArtifact(output, capture.id, kind, trial)
    await publishManifest?.()
  }
  catch (error) {
    const failed = { ...trial, valid: false, error: [trial.error, `Diagnostic finalization failed: ${error.message}`].filter(Boolean).join('; ') }
    capture.valid = false
    capture.error = failed.error
    capture.unreconciledArtifacts = []
    // A failed file must not prevent recovery of its writable peers. Immutable
    // or malformed evidence stays intact and is explicitly rejected by manifest.
    for (const kind of ['result', 'analysis']) {
      try {
        await writeArtifact(output, capture.id, kind, failed)
      }
      catch (failure) {
        capture.unreconciledArtifacts.push({ path: `${capture.id}.${kind}.json`, error: failure.message })
      }
    }
    if (!capture.unreconciledArtifacts.length)
      delete capture.unreconciledArtifacts
    try {
      await publishManifest?.()
    }
    catch (failure) {
      capture.unreconciledArtifacts ??= []
      capture.unreconciledArtifacts.push({ path: 'manifest.json', error: failure.message })
    }
    throw error
  }
}
