<script setup lang="ts">
import type { UseDynamicScrollerReturn } from 'vue-virtual-scroller'
import { computed, reactive, ref } from 'vue'
import { DynamicScrollerItem, RecycleScroller } from 'vue-virtual-scroller'
import { useDynamicScroller } from 'vue-virtual-scroller/composables/useDynamicScroller'

/** Independent owner for production package/subpath bridge regression tests. */
const props = defineProps<{ name: string }>()
/** Fixed initial geometry makes offset oracles independent from implementation. */
const rows = ref(Array.from({ length: 100 }, (_, index) => ({ id: `row-${index}`, label: `Account ${index}`, height: 40 })))
const renderer = ref<{ el: HTMLElement }>()
const enabled = ref(true)
const element = computed(() => renderer.value?.el as HTMLElement | undefined)
const state: UseDynamicScrollerReturn<(typeof rows.value)[number], string> = useDynamicScroller({
  items: rows,
  keyField: 'id',
  minItemSize: 40,
  el: element,
  enabled,
})
const { itemsWithSize } = state

/** Retain a real observer delivery to exercise stale ownership after recycling. */
let retainedResize: ((id: string, width: number, height: number) => void) | undefined
let retainedElement: (HTMLElement & { $_vs_id?: string, $_vs_onResize?: typeof retainedResize }) | undefined
let externalSizes: Record<string, number> | undefined

/**
 * Install caller-owned sizes while retaining the alias used for later writes.
 * @param withRefs Store the first two sizes as Vue refs.
 * @param inherited Read sizes through a reactive record's prototype.
 */
function useReactiveSizes(withRefs: boolean, inherited = false) {
  const values = Object.fromEntries(rows.value.map(row => [row.id, row.height]))
  const record = withRefs
    ? reactive({ ...values, 'row-0': ref(rows.value[0].height), 'row-1': ref(rows.value[1].height) })
    : reactive(values)
  externalSizes = record
  state.vscrollData.sizes = inherited ? reactive(Object.create(record)) : record
}

/** Offscreen changes cannot be rescued by a fresh visible-row measurement. */
function growReactiveSizes(throughPublic: boolean) {
  const writer = throughPublic ? state.vscrollData.sizes : externalSizes!
  rows.value[0].height = writer['row-0'] = 80
  rows.value[1].height = writer['row-1'] = 90
  return state.getItemOffset(10)
}

/** Update two sizes through the supported public record before Vue's next tick. */
function grow(first = 60, second = 80) {
  rows.value[0].height = first
  rows.value[1].height = second
  state.vscrollData.sizes['row-0'] = first
  state.vscrollData.sizes['row-1'] = second
  return state.getItemOffset(10)
}

/** Replacing a same-key object must refresh content without changing identity. */
function replace() {
  rows.value[10] = { ...rows.value[10], label: 'Replaced account' }
}

/** Expose public results only; no private registry or watcher counters. */
defineExpose({
  grow,
  useReactiveSizes,
  growReactiveSizes,
  replace,
  active: () => state.vscrollData.active,
  holdResize: () => {
    retainedElement = element.value?.querySelector('[data-row="row-2"]') as typeof retainedElement
    retainedResize = retainedElement?.$_vs_onResize
    return Boolean(retainedResize)
  },
  deliveryOwner: () => retainedElement?.$_vs_id,
  deliverOldResize: () => retainedResize?.('row-2', 300, 999),
  jump: (index: number) => state.scrollToItem(index),
  position: (position: number) => state.scrollToPosition(position),
  offset: (index: number) => state.getItemOffset(index),
  size: (index: number) => state.getItemSize(rows.value[index]),
  snapshot: () => state.cacheSnapshot.value,
  restore: () => {
    rows.value.forEach((row, index) => {
      row.height = index === 0 ? 50 : index === 1 ? 70 : 40
    })
    state.restoreCache({ keys: rows.value.map(row => row.id), sizes: rows.value.map(row => row.height) })
    return state.getItemOffset(10)
  },
  reset: () => {
    rows.value.forEach((row) => {
      row.height = 40
    })
    state.forceUpdate(true)
    return state.getItemOffset(10)
  },
  disable: () => { enabled.value = false },
  enable: () => { enabled.value = true },
})
</script>

<template>
  <RecycleScroller
    ref="renderer" :items="itemsWithSize" :enabled="enabled"
    :min-item-size="40" :item-size="null" :buffer="0"
    key-field="id" class="pipeline" :data-owner="props.name"
  >
    <template #default="{ item, index, active }">
      <DynamicScrollerItem :item="item.item" :index="index" :active="active" :data-row="item.id">
        <div :style="{ height: `${item.item.height}px`, boxSizing: 'border-box', padding: '8px' }">
          {{ item.item.label }}
        </div>
      </DynamicScrollerItem>
    </template>
  </RecycleScroller>
</template>

<style scoped>
.pipeline { width: 300px; height: 200px; overflow: auto; background: #f2f3f4; }
</style>
