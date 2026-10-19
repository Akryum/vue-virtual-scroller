<script setup lang="ts">
import type { WorkloadState } from './state'
import { computed, ref } from 'vue'
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import FeedEntry from '../components/FeedEntry.vue'
import { projectWidth } from '../components/format'
import ProjectCard from '../components/ProjectCard.vue'
/** Measured content dimensions, including mixed feed types and horizontal cards. */
const props = defineProps<{ model: WorkloadState }>()
const rows = props.model.rows
const horizontal = computed(() => props.model.config.workload === 'horizontal-cards')
const scroller = ref<{ scrollToItem: (index: number) => void }>()
/** Use the public dynamic jump API rather than estimating unknown dimensions. */
function jump(index: number) {
  if (props.model.config.mode === 'virtual')
    scroller.value?.scrollToItem(index)
  else document.querySelector<HTMLElement>(`[data-record][data-id="${rows.value[index].id}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
}
defineExpose({ jump })
</script>

<template>
  <DynamicScroller
    v-if="model.config.mode === 'virtual'" ref="scroller" class="viewport" data-viewport
    :style="{ width: `${model.state.width}px` }" :items="rows" :min-item-size="horizontal ? 260 : 100"
    :direction="horizontal ? 'horizontal' : 'vertical'" :shift="!horizontal"
  >
    <template #default="{ item, active }">
      <DynamicScrollerItem :item="item" :active="active" :style="horizontal ? { width: `${projectWidth(item, model.state.expanded.has(item.id))}px` } : undefined">
        <ProjectCard v-if="horizontal" :row="item" :expanded="model.state.expanded.has(item.id)" @expand="model.expand" />
        <FeedEntry v-else :row="item" :expanded="model.state.expanded.has(item.id)" @expand="model.expand" />
      </DynamicScrollerItem>
    </template>
  </DynamicScroller>
  <div v-else class="viewport" data-viewport :style="{ width: `${model.state.width}px` }">
    <div :class="{ 'horizontal-content': horizontal }">
      <template v-for="item in rows" :key="item.id">
        <ProjectCard v-if="horizontal" :row="item" :expanded="model.state.expanded.has(item.id)" @expand="model.expand" />
        <FeedEntry v-else :row="item" :expanded="model.state.expanded.has(item.id)" @expand="model.expand" />
      </template>
    </div>
  </div>
</template>
