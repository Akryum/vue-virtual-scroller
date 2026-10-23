import { describe, expect, it } from 'vitest'
import { computed, reactive, shallowRef } from 'vue'
import { createDynamicScrollerSequence, getDynamicScrollerSequence } from './dynamicScrollerSequence'

/** Certification is exact-array and each real Vue consumer sees coherent updates. */
describe('owned dynamic sequences', () => {
  it('delivers independent size revisions and replaces membership without leaking owners', () => {
    const owner = createDynamicScrollerSequence(() => {})
    const rows = [{ id: 'a' }, { id: 2 }, { id: '2' }]
    owner.replace(rows, ['a', 2, '2'], [10, 20, 30])
    const first = computed(() => {
      void owner.sequence.sizeRevision.value
      return owner.sequence.measuredSizes.reduce<number>((sum, size) => sum + (size || 0), 0)
    })
    const second = computed(() => {
      void owner.sequence.sizeRevision.value
      return owner.sequence.measuredSizes[2]
    })
    const retainedRows = shallowRef(reactive(rows))
    const retained = computed(() => getDynamicScrollerSequence(retainedRows.value))
    expect(retained.value).toBe(owner.sequence)
    expect(getDynamicScrollerSequence(rows.slice())).toBeUndefined()
    expect(owner.indicesFor('2')).toEqual([1, 2])
    expect(owner.sequence.indexOf(2)).toBe(1)
    expect(owner.sequence.indexOf('2')).toBe(2)
    expect(first.value).toBe(60)
    expect(second.value).toBe(30)
    owner.sequence.measuredSizes[0] = 15
    owner.sequence.measuredSizes[2] = 45
    owner.publish()
    expect(second.value).toBe(45)
    expect(first.value).toBe(80)
    const next = [rows[2], rows[0]]
    owner.replace(next, ['2', 'a'], [45, 15])
    expect(owner.sequence.indexOf('a')).toBe(1)
    expect(owner.sequence.indexOf('missing')).toBe(-1)
    expect(retained.value).toBeUndefined()
    const retainedNextRows = shallowRef(next)
    const retainedNext = computed(() => getDynamicScrollerSequence(retainedNextRows.value))
    expect(retainedNext.value).toBe(owner.sequence)
    owner.dispose()
    expect(retainedNext.value).toBeUndefined()
    expect(getDynamicScrollerSequence(next)).toBeUndefined()
  })
})
