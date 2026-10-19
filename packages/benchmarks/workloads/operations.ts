import type { BenchRecord } from '../data/types'
/** Exact facet filter used by actual application actions. */
export function filterRecords(records: BenchRecord[], group: string) {
  return records.filter(record => record.group === group)
}
/** Highest business value first, stable IDs break ties. */
export function sortRecords(records: BenchRecord[]) {
  return records.toSorted((left, right) => right.amount - left.amount || left.id - right.id)
}
/** Immutable targeted update; untouched records retain identity. */
export function updateRecords(records: BenchRecord[], count = 100) {
  return records.map((record, index) => index < count
    ? { ...record, version: record.version + 1, stock: record.stock + 7, progress: Math.min(100, record.progress + 5), amount: record.amount + 100, title: `${record.title} · reviewed`, body: `${record.body} Review completed by the account owner.` }
    : record)
}
