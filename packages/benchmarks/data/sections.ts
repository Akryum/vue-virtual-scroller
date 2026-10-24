import type { BenchRecord } from './types'
import { createRng } from '../../shared/random'

const PEOPLE = ['Avery Chen', 'Morgan Patel', 'Riley Garcia', 'Jordan Reed', 'Quinn Okafor', 'Sage Martin']
const PROJECTS = ['Northstar', 'Harbor', 'Lattice', 'Summit', 'Cinder', 'Juniper']
const BRANCHES = ['checkout-retry', 'invoice-export', 'search-focus', 'upload-resume', 'deploy-history', 'account-filters']
const COMMITS = ['Keep draft replies when switching projects', 'Restore keyboard focus after closing search', 'Export invoices with regional tax details', 'Retry interrupted uploads without duplicates', 'Show deployment history across environments', 'Preserve account filters after navigation']
const FILES = ['billing/invoice-export', 'search/focus-trap', 'uploads/resume-queue', 'deploy/history-panel', 'accounts/filter-state', 'checkout/retry-policy']
const FUNCTIONS = ['exportInvoices', 'restoreFocus', 'resumeUpload', 'loadHistory', 'persistFilters', 'retryCheckout']
const CODE = [
  'const total = items.reduce((sum, item) => sum + item.amount, 0)',
  'if (!session.active) return retryLater(request, 250)',
  'await queue.flush({ reason: \'navigation\', keepDrafts: true })',
  'const region = account.region ?? \'Europe\'',
  'export function formatTax(value: number) { return value.toFixed(2) }',
  'for (const upload of pending) upload.resume()',
  'logger.info(\'Restored focus\', { target: element.id })',
  'return history.filter(entry => entry.environment === target)',
]
/** Record kinds rendered by the explorer tree, captions first. */
export const EXPLORER_KINDS = ['project', 'group', 'branch', 'commit'] as const
/** Record kinds rendered by the continuous diff. */
export const REVIEW_KINDS = ['file', 'hunk', 'line'] as const

/** Fill the shared record contract; section rows only use a few business fields. */
function base(id: number, rng: () => number, fields: Pick<BenchRecord, 'name' | 'title' | 'group' | 'kind'> & Partial<BenchRecord>): BenchRecord {
  return {
    id,
    body: '',
    owner: PEOPLE[Math.floor(rng() * PEOPLE.length)],
    status: 'Active',
    priority: 0,
    comments: Math.floor(rng() * 28),
    amount: 0,
    stock: 0,
    reserved: 0,
    progress: 0,
    steps: [],
    updated: `2026-10-${String(1 + id % 18).padStart(2, '0')}`,
    asset: '',
    width: 0,
    height: 0,
    row: 0,
    column: 0,
    version: 0,
    ...fields,
  }
}

/**
 * Flattened, fully expanded project tree: a project caption, a branch group,
 * and a commit group per project, like a source-control explorer.
 */
export function generateExplorerRecords(count: number, seed: number, firstId = 1): BenchRecord[] {
  const rng = createRng(seed)
  const records: BenchRecord[] = []
  const push = (fields: Parameters<typeof base>[2]) => records.length < count && records.push(base(firstId + records.length, rng, fields))
  for (let project = 0; records.length < count; project++) {
    const name = `${PROJECTS[project % 6]} ${['Studio', 'Cloud', 'Labs'][project % 3]} ${project + 1}`
    push({ name, title: name, group: name, kind: 'project', comments: 3 + project % 5, body: `${3 + project % 4} branches, ${12 + project % 7} recent commits` })
    push({ name, title: `Branches in ${name}`, group: name, kind: 'group' })
    for (let index = 0; index < 3 + project % 4; index++) {
      const branch = `feature/${BRANCHES[(project + index) % 6]}-${project + 1}`
      push({ name, title: branch, group: name, kind: 'branch', priority: index % 3, progress: Math.floor(rng() * 9), body: `Tracks origin/${branch}` })
    }
    push({ name, title: `Recent commits in ${name}`, group: name, kind: 'group' })
    for (let index = 0; index < 12 + project % 7; index++) {
      const sha = Math.floor(rng() * 0xFFFFFFF).toString(16).padStart(7, '0')
      push({ name: sha, title: `${COMMITS[(project + index) % 6]} (${sha})`, group: name, kind: 'commit', status: ['Passing', 'Failing', 'Pending'][Math.floor(rng() * 3)], body: 'Reviewed with the regional account owners before the rollout window.' })
    }
  }
  return records
}

/** Unified diff of many files, each split into hunks of context, removed, and added lines. */
export function generateReviewRecords(count: number, seed: number, firstId = 1): BenchRecord[] {
  const rng = createRng(seed)
  const records: BenchRecord[] = []
  const push = (fields: Parameters<typeof base>[2]) => records.length < count && records.push(base(firstId + records.length, rng, fields))
  for (let file = 0; records.length < count; file++) {
    const path = `src/${FILES[file % 6]}-${file + 1}.ts`
    push({ name: path, title: path, group: path, kind: 'file', comments: 2 + file % 9, progress: 1 + file % 4 })
    let oldLine = 1 + file * 7 % 40
    let newLine = oldLine
    for (let hunk = 0; hunk < 3 && records.length < count; hunk++) {
      const lines = 8 + (file + hunk) % 6
      push({ name: path, title: `@@ -${oldLine},${lines} +${newLine},${lines} @@ ${FUNCTIONS[(file + hunk) % 6]}`, group: path, kind: 'hunk' })
      for (let index = 0; index < lines; index++) {
        // Mostly context, with a removed line followed by its replacement.
        const status = index % 5 === 2 ? 'Removed' : index % 5 === 3 ? 'Added' : 'Context'
        const code = `${CODE[Math.floor(rng() * CODE.length)]} // ${file + 1}.${hunk + 1}.${index + 1}`
        push({ name: path, title: code, group: path, kind: 'line', status, oldLine: status === 'Added' ? null : oldLine++, newLine: status === 'Removed' ? null : newLine++ })
      }
      oldLine += 20
      newLine += 20
    }
  }
  return records
}
