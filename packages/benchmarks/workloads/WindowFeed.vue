<script setup lang="ts">
import type { WorkloadState } from './state'
import { ref } from 'vue'
import { WindowScroller } from 'vue-virtual-scroller'
import NewsRow from '../components/NewsRow.vue'
/** Browser-window scrolling with known variable row sizes and real surrounding content. */
const props = defineProps<{ model: WorkloadState }>()
const rows = props.model.rows
const scroller = ref<{ scrollToItem: (index: number) => void }>()
/** The iframe is the document viewport during interactive use. */
function jump(index: number) {
  if (props.model.config.mode === 'virtual')
    scroller.value?.scrollToItem(index)
  else document.querySelector<HTMLElement>(`[data-record][data-id="${rows.value[index].id}"]`)?.scrollIntoView({ block: 'start' })
}
defineExpose({ jump })
</script>

<template>
  <section class="news-page" :style="{ width: `${model.state.width}px` }">
    <header class="news-intro" :style="{ height: model.state.intro ? '320px' : '120px' }">
      <small>NORTHSTAR JOURNAL</small><h1>Notes from teams building together</h1><p v-if="model.state.intro">
        Product updates, operating lessons, and stories from regional teams.
      </p>
    </header>
    <WindowScroller v-if="model.config.mode === 'virtual'" ref="scroller" :items="rows" size-field="height">
      <template #default="{ item }">
        <NewsRow :row="item" />
      </template>
    </WindowScroller>
    <div v-else>
      <NewsRow v-for="row in rows" :key="row.id" :row="row" />
    </div>
    <footer class="news-footer">
      Northstar Journal · Editorial archive
    </footer>
  </section>
</template>
