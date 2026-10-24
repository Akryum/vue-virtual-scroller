import type { BenchRecord } from '../data/types'

/** Fixed row height per kind, shared by both renderers and the scroller's size resolver. */
const ROW_SIZES: Record<string, number> = { project: 40, group: 32, branch: 28, commit: 28, file: 44, hunk: 28, line: 20 }
/** Height of the details block an expanded row reveals. */
const EXPANDED_EXTRA = 56
/** Captions that pin to the top, outermost first. */
const TOP_CAPTIONS = new Set(['project', 'file'])
const SECOND_CAPTIONS = new Set(['group'])

/** Rendered height of one row. */
export function sectionRowSize(row: BenchRecord, expanded: boolean) {
  return ROW_SIZES[row.kind] + (expanded ? EXPANDED_EXTRA : 0)
}

/** Top offset of every row, so a scroll offset maps to a row in O(log n). */
export function sectionOffsets(rows: readonly BenchRecord[], size: (row: BenchRecord) => number) {
  let offset = 0
  return rows.map((row) => {
    const top = offset
    offset += size(row)
    return top
  })
}

/**
 * Captions to pin above `scrollTop`: the closest top caption at or above it,
 * plus the second-level caption between them, as sticky explorer and diff
 * headers do.
 */
export function pinnedCaptions(rows: readonly BenchRecord[], offsets: readonly number[], scrollTop: number): BenchRecord[] {
  if (scrollTop <= 0 || !rows.length)
    return []
  // Last row starting at or above the offset.
  let low = 0
  let high = rows.length - 1
  while (low < high) {
    const middle = (low + high + 1) >> 1
    if (offsets[middle] <= scrollTop)
      low = middle
    else high = middle - 1
  }
  let second: BenchRecord | null = null
  for (let index = low; index >= 0; index--) {
    const row = rows[index]
    if (TOP_CAPTIONS.has(row.kind))
      return second ? [row, second] : [row]
    if (!second && SECOND_CAPTIONS.has(row.kind))
      second = row
  }
  return []
}
