import type { KeyValue } from '../types'
import { isProxy, isReadonly, shallowRef, toRaw, watch } from 'vue'

/** Changes collected since the last owner publication. Keys retain Record coercion. */
export interface DynamicSizeChanges {
  /** A whole-record replacement requires reseeding all existing wrappers. */
  reset: boolean
  /** String keys deliberately match JavaScript Record indexing. */
  keys: ReadonlySet<string>
}

/** Read effective sizes through the caller receiver, preserving getters and key coercion. */
function sizeRecordSnapshot(record: Record<KeyValue, number>, keys: readonly KeyValue[]) {
  return Array.from(new Set(keys.map(String)), key => [key, record[key]] as const)
}

/**
 * Observe public size-record writes without an effect for every logical row.
 * @param beforeChange Capture current geometry before publishing size changes.
 * @param getKeys Current logical keys; unrelated lazy accessors must stay unread.
 */
export function createDynamicScrollerSizeStore(beforeChange: () => void, getKeys?: () => readonly KeyValue[]) {
  const revision = shallowRef(0)
  let dirty = new Set<string>()
  let reset = false
  let current: Record<KeyValue, number>
  let active = true
  let stopFallback: (() => void) | undefined
  const ownedRecords = new WeakSet<Record<KeyValue, number>>()

  /** Capture the viewport before mutation, but publish only successful writes. */
  function beforeWrite() {
    if (active && !reset && !dirty.size)
      beforeChange()
  }

  /** Mark successful writes after the target contains the new value. */
  function changed(key?: string) {
    if (!active)
      return
    if (key === undefined)
      reset = true
    else
      dirty.add(key)
    revision.value++
  }

  /** Tag producer-owned numeric records before assignment, without publishing early. */
  function createRecord(record: Record<KeyValue, number> = {}) {
    const observed = new Proxy(record, {
      set(target, key, value) {
        const effective = current === observed && typeof key === 'string' && !Object.is(target[key], value)
        if (effective)
          beforeWrite()
        const success = Reflect.set(target, key, value)
        if (effective && success)
          changed(key as string)
        return success
      },
      deleteProperty(target, key) {
        const effective = current === observed && typeof key === 'string' && Object.hasOwn(target, key)
        if (effective)
          beforeWrite()
        const success = Reflect.deleteProperty(target, key)
        if (effective && success)
          changed(key as string)
        return success
      },
    })
    ownedRecords.add(observed)
    return observed
  }

  /** Adopt records after assignment; external Vue proxies keep their own identity. */
  function adopt(record: Record<KeyValue, number>) {
    const raw = toRaw(record)
    if (record === current || (!isReadonly(record) && raw === current))
      return current
    stopFallback?.()
    stopFallback = undefined
    beforeWrite()
    const owned = ownedRecords.has(raw) && !isReadonly(record)
    current = owned ? raw : isProxy(record) ? record : createRecord(raw)
    if (!owned && isProxy(record) && active) {
      // Caller aliases and ref write-through bypass our Proxy traps. Read current
      // logical IDs, including missing/inherited entries, so later measurements
      // and membership changes invalidate geometry without touching unused getters.
      stopFallback = watch(() => sizeRecordSnapshot(record, getKeys?.() ?? Object.getOwnPropertyNames(record)), (next, previous) => {
        const before = new Map(previous)
        const after = new Map(next)
        const keys = new Set([...before.keys(), ...after.keys()])
        const changedKeys = [...keys].filter(key => before.has(key) !== after.has(key) || !Object.is(before.get(key), after.get(key)))
        if (!changedKeys.length)
          return
        // Values changed, but wrapper geometry is still old at this point.
        beforeWrite()
        for (const key of changedKeys)
          changed(key)
      }, { flush: 'sync' })
    }
    changed()
    return current
  }

  /** Only the producer drains writes; downstream recyclers keep independent revisions. */
  function take(): DynamicSizeChanges {
    const changes = { reset, keys: dirty }
    dirty = new Set()
    reset = false
    return changes
  }

  /** Stop old externally held size records from scheduling owner work. */
  function dispose() {
    active = false
    stopFallback?.()
    stopFallback = undefined
    dirty.clear()
    reset = false
  }

  return { revision, createRecord, adopt, take, dispose }
}
