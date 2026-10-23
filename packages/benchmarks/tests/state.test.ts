import { describe, expect, it } from 'vitest'
import { createWorkloadState } from '../workloads/state'

describe('account content invalidation ownership', () => {
  it('publishes 100 updates and one revision without changing untouched accounts', () => {
    const model = createWorkloadState({ workload: 'customer-table', mode: 'plain', count: 101, seed: 2026 })
    const before = model.state.records.map(row => ({ ...row }))
    const untouched = model.state.records[100]
    expect(model.state.contentRevision).toBe(0)
    model.update()
    expect(model.state.contentRevision).toBe(1)
    for (let index = 0; index < 100; index++) {
      expect(model.state.records[index]).toMatchObject({
        version: 1,
        amount: before[index].amount + 100,
        title: `${before[index].title} · reviewed`,
        body: `${before[index].body} Review completed by the account owner.`,
      })
    }
    expect(model.state.records[100]).toBe(untouched)
    expect(model.state.records[100]).toEqual(before[100])
    model.select(1)
    expect([...model.state.selected]).toEqual([1])
    expect(model.state.contentRevision).toBe(1)
    expect(model.state.selected.has(101)).toBe(false)
    model.update()
    expect(model.state.contentRevision).toBe(2)
    expect(model.state.records[100]).toBe(untouched)
  })
})
