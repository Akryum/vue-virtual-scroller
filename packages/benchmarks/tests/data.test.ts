import { describe, expect, it } from 'vitest'
import { generateRecords } from '../data/generate'
import { filterRecords, sortRecords, updateRecords } from '../workloads/operations'
import { WORKLOADS } from '../workloads/registry'

describe('reproducible business workloads', () => {
  for (const workload of WORKLOADS) {
    it(`${workload.id} has stable unique identities and meaningful content`, () => {
      const rows = generateRecords(workload.id, 100, 2026)
      expect(rows).toEqual(generateRecords(workload.id, 100, 2026))
      expect(new Set(rows.map(row => row.id)).size).toBe(rows.length)
      expect(rows[0].title.length).toBeGreaterThan(8)
      expect(rows).not.toEqual(generateRecords(workload.id, 100, 2027))
    })
  }
  it('matrix columns represent warehouses holding the same product within each row', () => {
    const rows = generateRecords('inventory-matrix', 16, 2026)
    expect(rows.slice(0, 4).map(row => row.name)).toEqual(Array.from({ length: 4 }).fill('Studio mechanical keyboard'))
    expect(rows[1].title).toBe('Studio mechanical keyboard · Warehouse 2')
    expect(rows[4].name).toBe('Portable USB-C display')
    expect(rows.slice(0, 4).map(row => row.column)).toEqual([0, 1, 2, 3])
  })
  it('feed includes every content type', () => {
    expect(new Set(generateRecords('activity-feed', 60, 2026).map(row => row.kind)))
      .toEqual(new Set(['comment', 'deployment', 'incident', 'checklist', 'code', 'attachment']))
  })
  it('filters, sorts, and updates specific records without changing others', () => {
    const rows = generateRecords('issue-inbox', 5, 2026)
    rows[0].group = 'Open'
    rows[1].group = 'Closed'
    rows[2].group = 'Open'
    rows[3].group = 'Closed'
    rows[4].group = 'Closed'
    rows[0].amount = 10
    rows[1].amount = 90
    rows[2].amount = 10
    expect(filterRecords(rows, 'Open').map(row => row.id)).toEqual([1, 3])
    expect(sortRecords(rows.slice(0, 3)).map(row => row.id)).toEqual([2, 1, 3])
    const before = structuredClone(rows)
    const updated = updateRecords(rows, 2)
    expect(updated.slice(0, 2).map(row => row.version)).toEqual([1, 1])
    expect(updated[0]).toMatchObject({ stock: before[0].stock + 7, amount: before[0].amount + 100, title: `${before[0].title} · reviewed` })
    expect(updated[2]).toEqual(before[2])
    expect(rows).toEqual(before)
  })
})
