import type { WorkloadId } from '../workloads/registry'
import type { BenchRecord } from './types'
import { createRng } from '../../shared/random'
import { matrixSide } from '../workloads/registry'
import { generateExplorerRecords, generateReviewRecords } from './sections'

const PEOPLE = ['Avery Chen', 'Morgan Patel', 'Riley Garcia', 'Jordan Reed', 'Quinn Okafor', 'Sage Martin']
const ISSUES = ['Keep draft replies when switching projects', 'Restore keyboard focus after closing search', 'Export invoices with regional tax details', 'Retry interrupted uploads without duplicate files', 'Show deployment history across environments', 'Preserve account filters after navigation']
const PRODUCTS = ['Studio mechanical keyboard', 'Portable USB-C display', 'Adjustable desk lamp', 'Wireless conference headset', 'Compact docking station', 'Ergonomic desk chair']
const FEED = ['comment', 'deployment', 'incident', 'checklist', 'code', 'attachment']
const BODY = [
  'Customer support reproduced this during the morning handover. Keep the existing draft and show a clear recovery action when the connection returns.',
  'The release is ready for review. Accessibility checks passed, and the operations team confirmed the rollout window with regional account owners.',
  'Weekly account review identified a change in usage. Compare the previous billing period and contact the owner before changing the subscription.',
]
/** Build real-shaped, stable business records; no remote services or wall-clock values. */
export function generateRecords(workload: WorkloadId, count: number, seed: number, firstId = 1): BenchRecord[] {
  if (workload === 'project-explorer')
    return generateExplorerRecords(count, seed, firstId)
  if (workload === 'code-review')
    return generateReviewRecords(count, seed, firstId)
  const rng = createRng(seed)
  const side = matrixSide(count)
  const total = workload === 'inventory-matrix' ? side * side : count
  return Array.from({ length: total }, (_, index) => {
    const id = firstId + index
    const variant = workload === 'inventory-matrix' ? Math.floor(index / side) % 6 : index % 6
    const owner = PEOPLE[Math.floor(rng() * PEOPLE.length)]
    const amount = 1500 + Math.floor(rng() * 90000)
    const name = workload === 'product-grid' || workload === 'inventory-matrix'
      ? PRODUCTS[variant]
      : `${['Northstar', 'Harbor', 'Lattice', 'Summit', 'Cinder', 'Juniper'][variant]} ${['Studio', 'Cloud', 'Labs'][index % 3]}`
    const title = workload === 'issue-inbox'
      ? ISSUES[variant]
      : workload === 'product-grid'
        ? PRODUCTS[variant]
        : workload === 'customer-table'
          ? `${name} account review`
          : workload === 'window-feed'
            ? ['Regional teams launch shared support programme', 'Product release improves offline collaboration', 'Infrastructure review reduces deployment delays'][index % 3]
            : workload === 'horizontal-cards'
              ? ['Customer portal refresh', 'Warehouse capacity planning', 'Quarterly billing migration'][index % 3]
              : workload === 'inventory-matrix'
                ? `${name} · Warehouse ${index % side + 1}`
                : ['Review the onboarding handover', 'Production release completed', 'Elevated queue latency resolved', 'Release readiness checklist', 'Updated connection retry policy', 'Account migration field notes'][variant]
    const group = workload === 'issue-inbox'
      ? ['Open', 'Review', 'Closed'][index % 3]
      : workload === 'product-grid'
        ? ['Accessories', 'Displays', 'Furniture', 'Accessories', 'Accessories', 'Furniture'][variant]
        : workload === 'customer-table'
          ? ['Europe', 'North America', 'Asia Pacific'][index % 3]
          : workload === 'horizontal-cards' ? owner : ['Product', 'Engineering', 'Operations'][index % 3]
    return {
      id,
      name,
      title,
      body: BODY[index % 3],
      owner,
      group,
      status: ['Active', 'Review', 'Paused'][index % 3],
      priority: index % 4 + 1,
      comments: Math.floor(rng() * 28),
      amount,
      stock: 20 + Math.floor(rng() * 400),
      reserved: Math.floor(rng() * 20),
      progress: Math.floor(rng() * 101),
      kind: FEED[variant],
      steps: ['Review regional account requirements', 'Verify migration on staging', 'Publish support handover notes'].slice(0, index % 3 + 1),
      updated: `2026-10-${String(1 + index % 18).padStart(2, '0')}`,
      asset: `/assets/product-${variant}.svg`,
      width: 260 + (index % 4) * 40,
      height: [112, 144, 176][index % 3],
      row: Math.floor(index / side),
      column: index % side,
      version: 0,
    }
  })
}
