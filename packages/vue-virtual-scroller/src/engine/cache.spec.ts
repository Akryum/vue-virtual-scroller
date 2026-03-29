import { describe, expect, it } from 'vitest'
import {
  buildCacheSnapshot,
  findPrependOffset,
  getAlignedScrollOffset,
  getItemKey,
  getItemKeys,
  isCacheSnapshotCompatible,
  restoreCacheMap,
} from './cache'

describe('cache helpers', () => {
  it('reads keys from the configured field or falls back to the index', () => {
    expect(getItemKey({ id: 'a' }, 2, 'id')).toBe('a')
    expect(getItemKey({ label: 'row' }, 2, null)).toBe(2)
    expect(getItemKeys([{ id: 'a' }, { id: 'b' }], 'id')).toEqual(['a', 'b'])
  })

  it('throws when the key field is missing', () => {
    expect(() => getItemKey({ label: 'row' }, 0, 'id')).toThrow('Key is undefined on item (keyField is \'id\')')
  })

  it('builds snapshots and restores only compatible positive sizes', () => {
    const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    const snapshot = buildCacheSnapshot(items, 'id', (_item, index) => [24, 0, -5][index])

    expect(snapshot).toEqual({
      keys: ['a', 'b', 'c'],
      sizes: [24, null, null],
    })
    expect(restoreCacheMap(snapshot, items, 'id')).toEqual({ a: 24 })
  })

  it('rejects incompatible snapshots', () => {
    const snapshot = {
      keys: ['a', 'b'],
      sizes: [24, 32],
    }

    expect(isCacheSnapshotCompatible(snapshot, [{ id: 'a' }, { id: 'b' }], 'id')).toBe(true)
    expect(isCacheSnapshotCompatible(snapshot, [{ id: 'b' }, { id: 'a' }], 'id')).toBe(false)
    expect(isCacheSnapshotCompatible(snapshot, [{ id: 'a' }], 'id')).toBe(false)
    expect(restoreCacheMap(snapshot, [{ id: 'a' }, { id: 'c' }], 'id')).toEqual({})
  })

  it('detects prepend offsets only for contiguous preserved tails', () => {
    expect(findPrependOffset(['c', 'd'], ['a', 'b', 'c', 'd'])).toBe(2)
    expect(findPrependOffset(['b', 'd'], ['a', 'b', 'c', 'd'])).toBe(0)
    expect(findPrependOffset(['c', 'd'], ['c', 'd'])).toBe(0)
    expect(findPrependOffset([], ['a', 'b'])).toBe(0)
    expect(findPrependOffset(['c', 'd'], ['a', 'c', 'd', 'e'])).toBe(1)
  })

  it('computes aligned scroll offsets', () => {
    expect(getAlignedScrollOffset(200, 40, 0, 100, undefined, 5)).toBe(205)
    expect(getAlignedScrollOffset(200, 40, 0, 100, 'center')).toBe(170)
    expect(getAlignedScrollOffset(200, 40, 0, 100, 'end', 5)).toBe(145)
    expect(getAlignedScrollOffset(40, 20, 30, 100, 'nearest')).toBeNull()
    expect(getAlignedScrollOffset(20, 30, 40, 100, 'nearest', 3)).toBe(23)
    expect(getAlignedScrollOffset(150, 30, 40, 100, 'nearest', 3)).toBe(83)
  })
})
