import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

/** Hash captured artifact bytes recursively with stable relative paths. */
export async function artifactHashes(root, prefix = '') {
  const result = {}
  for (const entry of await readdir(join(root, prefix), { withFileTypes: true })) {
    const path = join(prefix, entry.name)
    if (entry.isDirectory())
      Object.assign(result, await artifactHashes(root, path))
    else
      result[path] = createHash('sha256').update(await readFile(join(root, path))).digest('hex')
  }
  return result
}

/** Fingerprint tracked diff and sorted untracked source bytes for specific package roots. */
async function patchFingerprint(root, git, paths) {
  const patch = git(['diff', 'HEAD', '--', ...paths])
  const hash = createHash('sha256').update(patch)
  const files = git(['ls-files', '--others', '--exclude-standard', ...paths]).split('\n').filter(Boolean).sort()
  for (const path of files)
    hash.update(path).update(await readFile(join(root, path)))
  return hash.digest('hex')
}

/** Separate library/harness patch hashes from runner checkout and built-artifact provenance. */
export async function sourceProvenance(root) {
  const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()
  const library = ['packages/vue-virtual-scroller']
  const harness = ['packages/benchmarks', 'packages/shared']
  return {
    sha: git(['rev-parse', 'HEAD']),
    dirtyPaths: git(['status', '--porcelain']),
    dirtyPatchHash: await patchFingerprint(root, git, [...library, ...harness]),
    libraryDirtyPatchHash: await patchFingerprint(root, git, library),
    harnessDirtyPatchHash: await patchFingerprint(root, git, harness),
  }
}
