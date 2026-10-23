import { afterEach, describe, expect, it } from 'vitest'
import { createApp, defineComponent, h, nextTick, reactive, ref } from 'vue'
import { useDynamicScroller } from './useDynamicScroller'

const cleanup: Array<() => void> = []
afterEach(() => cleanup.splice(0).forEach(stop => stop()))

/** Real Vue lifetime; public metadata assertions need no simulated layout. */
function mountConsumer(items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]) {
  let state!: ReturnType<typeof useDynamicScroller>
  const root = document.createElement('div')
  const app = createApp(defineComponent({
    setup() {
      state = useDynamicScroller({
        items,
        keyField: 'id',
        minItemSize: 40,
        el: undefined,
      })
      return () => h('div')
    },
  }))
  app.mount(root)
  cleanup.push(() => app.unmount())
  return state
}

// Preflight: two changed records and one unaffected record reject partial updates.
// Caller aliases and Vue ref write-through must preserve public offsets/snapshots.
describe('public reactive size records', () => {
  it.each(['own', 'inherited'])('does not evaluate unused %s size getters', async (location) => {
    const state = mountConsumer()
    let reads = 0
    const unused = Object.defineProperty({}, 'unloaded', {
      get() {
        reads++
        throw new Error('Unused size getter must not run')
      },
    })
    const record = location === 'own'
      ? Object.assign(unused, { a: 50, b: 60, c: 70 })
      : Object.assign(Object.create(unused), { a: 50, b: 60, c: 70 })
    expect(() => state.vscrollData.sizes = reactive(record)).not.toThrow()
    await nextTick()
    expect(state.getItemOffset(2)).toBe(110)
    expect(state.cacheSnapshot.value.sizes).toEqual([50, 60, 70])
    expect(reads).toBe(0)
  })

  it('tracks newly appended inherited IDs before their first measurements exist', async () => {
    const items = reactive([{ id: 'a' }, { id: 'b' }, { id: 'c' }])
    const state = mountConsumer(items)
    const inherited = reactive({ a: 50, b: 60, c: 70 } as Record<string, number>)
    state.vscrollData.sizes = reactive(Object.create(inherited) as Record<string, number>)
    await nextTick()
    items.push({ id: 'd' }, { id: 'e' })
    await nextTick()
    expect(state.getItemOffset(4)).toBe(220)
    inherited.d = 90
    inherited.e = 100
    expect(state.getItemOffset(4)).toBe(270)
    expect(state.cacheSnapshot.value.sizes).toEqual([50, 60, 70, 90, 100])
  })

  it('tracks inherited caller sizes through offsets, snapshots and replacement', async () => {
    const state = mountConsumer()
    const inherited = reactive({ a: 50, b: 60, c: 70 })
    const record = reactive(Object.create(inherited) as Record<string, number>)
    state.vscrollData.sizes = record
    await nextTick()
    expect(state.getItemOffset(2)).toBe(110)

    inherited.a = 80
    inherited.b = 90
    // Public queries must flush changes even before Vue's queued owner publication.
    expect(state.getItemSize({ id: 'a' })).toBe(80)
    expect(state.getItemOffset(2)).toBe(170)
    expect(state.cacheSnapshot.value.sizes).toEqual([80, 90, 70])
    await nextTick()
    expect(state.getItemOffset(2)).toBe(170)

    state.vscrollData.sizes = { a: 25, b: 35, c: 45 }
    await nextTick()
    inherited.a = 900
    inherited.b = 950
    await nextTick()
    expect(state.getItemOffset(2)).toBe(60)
    expect(state.cacheSnapshot.value.sizes).toEqual([25, 35, 45])
  })

  it('resolves inherited size getters against the shadowing caller record', async () => {
    const state = mountConsumer()
    const inherited = reactive({
      /** Size depends on the final receiver's own override, not this prototype's b. */
      get a() { return this.b * 2 },
      b: 20,
      c: 70,
    })
    const record = reactive(Object.assign(Object.create(inherited), { b: 30 }) as Record<string, number>)
    state.vscrollData.sizes = record
    await nextTick()
    expect(state.cacheSnapshot.value.sizes).toEqual([60, 30, 70])
    record.b = 40
    expect(state.getItemSize({ id: 'a' })).toBe(80)
    expect(state.getItemOffset(2)).toBe(120)
    expect(state.cacheSnapshot.value.sizes).toEqual([80, 40, 70])
  })

  it('tracks non-enumerable caller-owned sizes without losing other records', async () => {
    const state = mountConsumer()
    const record = reactive(Object.defineProperty({ a: 50, b: 60, c: 70 }, 'a', { enumerable: false }))
    state.vscrollData.sizes = record
    await nextTick()
    expect(state.getItemOffset(2)).toBe(110)
    record.a = 80
    await nextTick()
    expect(state.getItemSize({ id: 'a' })).toBe(80)
    expect(state.getItemOffset(2)).toBe(140)
    expect(state.cacheSnapshot.value.sizes).toEqual([80, 60, 70])
  })

  it.each(['retained reference', 'public ref-backed record'] as const)('tracks %s and replacement', async (mode) => {
    const state = mountConsumer()
    const record = mode === 'retained reference'
      ? reactive({ a: 50, b: 60, c: 70 })
      : reactive({ a: ref(50), b: ref(60), c: ref(70) })
    state.vscrollData.sizes = record
    await nextTick()
    expect(state.getItemOffset(2)).toBe(110)
    const writer = mode === 'retained reference' ? record : state.vscrollData.sizes
    writer.a = 80
    writer.b = 90
    await nextTick()
    expect(state.getItemSize({ id: 'a' })).toBe(80)
    expect(state.getItemSize({ id: 'b' })).toBe(90)
    expect(state.getItemOffset(2)).toBe(170)
    expect(state.cacheSnapshot.value.sizes).toEqual([80, 90, 70])

    state.vscrollData.sizes = { a: 25, b: 35, c: 45 }
    await nextTick()
    writer.a = 900
    writer.b = 950
    await nextTick()
    expect(state.getItemOffset(2)).toBe(60)
    expect(state.cacheSnapshot.value.sizes).toEqual([25, 35, 45])

    state.forceUpdate(true)
    await nextTick()
    expect(state.getItemOffset(2)).toBe(80)
    state.vscrollData.sizes.a = 55
    state.vscrollData.sizes.b = 65
    expect(state.getItemOffset(2)).toBe(120)
  })
})
