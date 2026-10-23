import type { ShallowRef } from 'vue'
import type { KeyValue } from '../types'
import { shallowRef, toRaw } from 'vue'

/** A coherent membership revision; size-only writes never replace this object. */
export interface DynamicSequenceStructure {
  /** Exact owner array, not a heuristic based on wrapper fields. */
  items: unknown[]
  /** Stable resolved keys, cached once per structural revision. */
  keys: KeyValue[]
}

/** Private owner/consumer bridge. Each recycler observes revisions independently. */
export interface DynamicScrollerSequence {
  /** Current membership snapshot. */
  structure: ShallowRef<DynamicSequenceStructure>
  /** Reactive certification invalidates consumers retaining an old exact array. */
  activeArray: ShallowRef<unknown[] | undefined>
  /** Batch revision, including replacement/reset size records. */
  sizeRevision: ShallowRef<number>
  /** Write revision invalidates synchronous readers before batched publication. */
  pendingRevision: ShallowRef<number>
  /** Effective measured values before consumer-specific minimum fallback. */
  measuredSizes: Array<number | undefined>
  /** Flush pending writes before synchronous offset/cache queries. */
  flush: () => void
  /** First index under existing duplicate-key semantics, or -1. */
  indexOf: (key: KeyValue) => number
}

const sequences = new WeakMap<unknown[], DynamicScrollerSequence>()

/** Find certification through either a raw array or Vue's reactive array proxy. */
export function getDynamicScrollerSequence(items: unknown[]) {
  const raw = toRaw(items)
  const sequence = sequences.get(raw)
  return sequence?.activeArray.value === raw ? sequence : undefined
}

/** Create one lifetime-scoped producer; no global current-scroller state. */
export function createDynamicScrollerSequence(flush: () => void, pendingRevision = shallowRef(0)) {
  let registered: unknown[] | undefined
  let indices = new Map<string, number[]>()
  let identityIndices = new Map<KeyValue, number>()
  const sequence: DynamicScrollerSequence = {
    structure: shallowRef({ items: [], keys: [] }),
    activeArray: shallowRef<unknown[]>(),
    sizeRevision: shallowRef(0),
    pendingRevision,
    measuredSizes: [],
    flush,
    indexOf: key => identityIndices.get(key) ?? -1,
  }

  /** Register before exposing a new wrapper array to component consumers. */
  function replace(items: unknown[], keys: KeyValue[], sizes: Array<number | undefined>) {
    if (registered)
      sequences.delete(registered)
    registered = toRaw(items)
    sequences.set(registered, sequence)
    sequence.activeArray.value = registered
    indices = new Map()
    identityIndices = new Map()
    keys.forEach((key, index) => {
      if (!identityIndices.has(key))
        identityIndices.set(key, index)
      const recordKey = String(key)
      const existing = indices.get(recordKey)
      if (existing)
        existing.push(index)
      else
        indices.set(recordKey, [index])
    })
    sequence.measuredSizes = sizes
    sequence.structure.value = { items, keys }
  }

  /** Resolve all indices, including record keys shared by numeric/string IDs. */
  function indicesFor(key: string): readonly number[] {
    return indices.get(key) ?? []
  }

  /** Notify every consumer after the owner's wrappers and sizes agree. */
  function publish() {
    sequence.sizeRevision.value++
  }

  /** Retained old arrays safely revert to the generic reactive consumer path. */
  function dispose() {
    if (registered)
      sequences.delete(registered)
    registered = undefined
    sequence.activeArray.value = undefined
    indices.clear()
    identityIndices.clear()
  }

  return { sequence, replace, indicesFor, publish, dispose }
}
