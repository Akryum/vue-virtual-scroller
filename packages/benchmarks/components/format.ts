import type { BenchRecord } from '../data/types'
/** Fixed English currency formatting; independent of host locale. */
export function money(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100)
}
/** Stable semantic attributes used to inspect both rendering strategies. */
export function recordAttributes(row: BenchRecord, selected = false, expanded = false) {
  return { 'data-record': '', 'data-id': row.id, 'data-title': row.title, 'data-version': row.version, 'data-group': row.group, 'data-selected': String(selected), 'data-expanded': String(expanded) }
}

/** Actual card width shared by horizontal measurement wrapper and plain content. */
export function projectWidth(row: BenchRecord, expanded: boolean) {
  return row.width + (expanded ? 160 : 0)
}
