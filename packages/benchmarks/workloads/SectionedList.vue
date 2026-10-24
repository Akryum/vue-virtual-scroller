<script setup lang="ts">
import type { WorkloadState } from './state'
import { computed, ref } from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import SectionRow from '../components/SectionRow.vue'
import { pinnedCaptions, sectionOffsets, sectionRowSize } from './sections'
/**
 * Explorer tree and continuous diff, written the way such apps commonly are:
 * mixed row components chosen per kind, a sticky caption overlay derived from
 * the scroll offset in this component, and an inline size resolver. Each
 * scroll event therefore re-renders this component, and the overlay changes
 * whenever another caption takes over.
 */
const props = defineProps<{ model: WorkloadState }>()
const rows = props.model.rows
const state = props.model.state
const scroller = ref<{ scrollToItem: (index: number) => void }>()
const scrollTop = ref(0)
const offsets = computed(() => sectionOffsets(rows.value, row => sectionRowSize(row, state.expanded.has(row.id))))
const pinned = computed(() => pinnedCaptions(rows.value, offsets.value, scrollTop.value))
/** Track the offset for the sticky captions, like an app's own `@scroll` handler. */
function trackScroll(event: Event) {
  scrollTop.value = (event.target as HTMLElement).scrollTop
}
/** Public package jump for virtual mode; native DOM jump for plain mode. */
function jump(index: number) {
  if (props.model.config.mode === 'virtual')
    scroller.value?.scrollToItem(index)
  else document.querySelector<HTMLElement>(`[data-record][data-id="${rows.value[index].id}"]`)?.scrollIntoView({ block: 'nearest' })
}
defineExpose({ jump })
</script>

<template>
  <div class="sectioned" :style="{ width: `${state.width}px` }">
    <div class="pinned-captions">
      <SectionRow v-for="row in pinned" :key="row.id" :row="row" :selected="state.selected.has(row.id)" :expanded="false" pinned @select="model.select" />
    </div>
    <RecycleScroller
      v-if="model.config.mode === 'virtual'" ref="scroller" class="viewport" data-viewport
      :items="rows" :item-size="row => sectionRowSize(row, state.expanded.has(row.id))" type-field="kind"
      @scroll.passive="trackScroll"
    >
      <template #default="{ item }">
        <SectionRow :row="item" :selected="state.selected.has(item.id)" :expanded="state.expanded.has(item.id)" @select="model.select" />
      </template>
    </RecycleScroller>
    <div v-else class="viewport" data-viewport @scroll.passive="trackScroll">
      <SectionRow v-for="item in rows" :key="item.id" :row="item" :selected="state.selected.has(item.id)" :expanded="state.expanded.has(item.id)" @select="model.select" />
    </div>
  </div>
</template>
