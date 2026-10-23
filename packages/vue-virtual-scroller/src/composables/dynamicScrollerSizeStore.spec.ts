import { describe, expect, it } from 'vitest'
import { computed, reactive, readonly, shallowRef, watch } from 'vue'
import { createDynamicScrollerSizeStore } from './dynamicScrollerSizeStore'

/** Real Vue records must retain normal reads while batching both changed IDs. */
describe('dynamic size records', () => {
  it('moves external dependencies with logical membership', () => {
    const keys = shallowRef(['a'])
    const inherited = reactive({ a: 20, b: 30 })
    const record = reactive(Object.create(inherited) as Record<string, number>)
    const store = createDynamicScrollerSizeStore(() => {}, () => keys.value)
    store.adopt(record)
    store.take()
    const initialRevision = store.revision.value
    inherited.b = 40
    expect(store.revision.value).toBe(initialRevision)
    keys.value = ['b']
    store.take()
    const changedMembershipRevision = store.revision.value
    inherited.a = 50
    expect(store.revision.value).toBe(changedMembershipRevision)
    inherited.b = 60
    expect(store.take()).toEqual({ reset: false, keys: new Set(['b']) })
    store.dispose()
  })

  it('observes non-enumerable inherited sizes, additions and shadowing', () => {
    const store = createDynamicScrollerSizeStore(() => {}, () => ['a', 'b', 'c', 'd'])
    const base = reactive(Object.defineProperty({ a: 20, c: 40 } as Record<string, number>, 'a', { enumerable: false }))
    const middle = reactive(Object.assign(Object.create(base), { b: 30 }) as Record<string, number>)
    const record = reactive(Object.assign(Object.create(middle), { c: 50 }) as Record<string, number>)
    expect(store.adopt(record)).toBe(record)
    store.take()
    base.a = 60
    middle.b = 70
    base.c = 900
    expect(record.c).toBe(50)
    expect(store.take()).toEqual({ reset: false, keys: new Set(['a', 'b']) })

    base.d = 80
    expect(record.d).toBe(80)
    expect(store.take()).toEqual({ reset: false, keys: new Set(['d']) })
    delete record.c
    expect(record.c).toBe(900)
    expect(store.take()).toEqual({ reset: false, keys: new Set(['c']) })
    delete base.d
    expect(record.d).toBeUndefined()
    expect(store.take()).toEqual({ reset: false, keys: new Set(['d']) })

    store.dispose()
    base.a = 950
    middle.b = 975
    expect(store.take()).toEqual({ reset: false, keys: new Set() })
  })

  it('collects every effective public write and deletion with Record key coercion', () => {
    let anchors = 0
    const store = createDynamicScrollerSizeStore(() => anchors++)
    const data = reactive({ sizes: store.adopt({ a: 20, b: 30, 7: 40 }) })
    store.take()
    anchors = 0
    const total = computed(() => (data.sizes.a || 0) + (data.sizes.b || 0))
    expect(total.value).toBe(50)
    data.sizes.a = 25
    data.sizes.b = 60
    data.sizes[7] = 50
    data.sizes['7'] = 50
    expect(total.value).toBe(85)
    expect(store.take()).toEqual({ reset: false, keys: new Set(['a', 'b', '7']) })
    expect(anchors).toBe(1)
    delete data.sizes.a
    expect(total.value).toBe(60)
    expect(store.take()).toEqual({ reset: false, keys: new Set(['a']) })
    expect(Object.keys(data.sizes).sort()).toEqual(['7', 'b'])
  })

  it('notifies synchronous readers only after successful target writes', () => {
    const store = createDynamicScrollerSizeStore(() => {})
    const data = reactive({ sizes: store.adopt({ a: 20 }) })
    store.take()
    const observed: number[] = []
    const stop = watch(store.revision, () => observed.push(data.sizes.a), { flush: 'sync' })
    data.sizes.a = 55
    expect(observed).toEqual([55])
    stop()
    const blocked = store.adopt(Object.defineProperty({ a: 40 }, 'a', { writable: false }))
    store.take()
    const revision = store.revision.value
    expect(Reflect.set(blocked, 'a', 90)).toBe(false)
    expect(blocked.a).toBe(40)
    expect(store.revision.value).toBe(revision)
    expect(store.take()).toEqual({ reset: false, keys: new Set() })
  })

  it('adopts resets and ignores retained obsolete records and disposed owners', () => {
    const store = createDynamicScrollerSizeStore(() => {})
    const old = reactive(store.adopt({ old: 30 }))
    store.take()
    const current = reactive(store.adopt({ fresh: 70 }))
    expect(store.take()).toEqual({ reset: true, keys: new Set() })
    old.old = 90
    current.fresh = 80
    expect(store.take()).toEqual({ reset: false, keys: new Set(['fresh']) })
    store.dispose()
    current.fresh = 100
    expect(store.take()).toEqual({ reset: false, keys: new Set() })
    expect(current.fresh).toBe(100)
  })

  it('stops external reactive tracking when owner is replaced or disposed', () => {
    const store = createDynamicScrollerSizeStore(() => {})
    const old = reactive({ a: 20 })
    expect(store.adopt(old)).toBe(old)
    store.take()
    old.a = 50
    expect(store.take()).toEqual({ reset: false, keys: new Set(['a']) })
    const current = reactive({ b: 30 })
    store.adopt(current)
    store.take()
    const revision = store.revision.value
    old.a = 900
    expect(store.revision.value).toBe(revision)
    store.dispose()
    current.b = 950
    expect(store.revision.value).toBe(revision)
    expect(store.take()).toEqual({ reset: false, keys: new Set() })
  })

  it('preserves replacement proxy identity when readonly wraps the same reactive map', () => {
    const store = createDynamicScrollerSizeStore(() => {})
    const source = reactive({ a: 20 })
    store.adopt(source)
    const protectedRecord = readonly(source)
    expect(store.adopt(protectedRecord)).toBe(protectedRecord)
    store.take()
    source.a = 50
    expect(store.take()).toEqual({ reset: false, keys: new Set(['a']) })
    store.dispose()
  })
})
