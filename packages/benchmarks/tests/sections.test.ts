import { describe, expect, it } from 'vitest'
import { EXPLORER_KINDS, generateExplorerRecords, generateReviewRecords, REVIEW_KINDS } from '../data/sections'
import { pinnedCaptions, sectionOffsets, sectionRowSize } from '../workloads/sections'

describe('sectioned workloads', () => {
  it('explorer rows nest branches and commits under their project and group captions', () => {
    const rows = generateExplorerRecords(1000, 2026)
    expect(rows).toHaveLength(1000)
    expect(new Set(rows.map(row => row.kind))).toEqual(new Set(EXPLORER_KINDS))
    expect(rows.slice(0, 2).map(row => row.kind)).toEqual(['project', 'group'])
    let project = ''
    for (const row of rows) {
      if (row.kind === 'project')
        project = row.group
      expect(row.group).toBe(project)
    }
  })
  it('diff lines number old and new files independently', () => {
    const rows = generateReviewRecords(1000, 2026)
    expect(new Set(rows.map(row => row.kind))).toEqual(new Set(REVIEW_KINDS))
    // The first file's first hunk holds eight lines.
    const lines = rows.slice(2, 10)
    expect(lines.every(row => row.kind === 'line')).toBe(true)
    expect(lines.filter(row => row.status === 'Added').every(row => row.oldLine === null && row.newLine != null)).toBe(true)
    expect(lines.filter(row => row.status === 'Removed').every(row => row.newLine === null && row.oldLine != null)).toBe(true)
    const newNumbers = lines.map(row => row.newLine).filter(value => value != null)
    expect(newNumbers).toEqual(newNumbers.toSorted((a, b) => a! - b!))
  })
  it('pins the closest project caption and the group caption under it', () => {
    const rows = generateExplorerRecords(60, 2026)
    const offsets = sectionOffsets(rows, row => sectionRowSize(row, false))
    const firstCommits = rows.findIndex(row => row.title.startsWith('Recent commits'))
    const secondProject = rows.findIndex((row, index) => index > 0 && row.kind === 'project')

    expect(pinnedCaptions(rows, offsets, 0)).toEqual([])
    expect(pinnedCaptions(rows, offsets, 1).map(row => row.id)).toEqual([rows[0].id])
    expect(pinnedCaptions(rows, offsets, offsets[1] + 1).map(row => row.id)).toEqual([rows[0].id, rows[1].id])
    expect(pinnedCaptions(rows, offsets, offsets[firstCommits + 2]).map(row => row.id)).toEqual([rows[0].id, rows[firstCommits].id])
    expect(pinnedCaptions(rows, offsets, offsets[secondProject]).map(row => row.id)).toEqual([rows[secondProject].id])
  })
})
