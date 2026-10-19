<script setup lang="ts">
import type { WorkloadState } from './state'
import { ref } from 'vue'
import { useDynamicScroller, useTableColumnWidths } from 'vue-virtual-scroller'
import CustomerRow from '../components/CustomerRow.vue'
/** Headless virtual table and native semantic table share the same row component. */
const props = defineProps<{ model: WorkloadState }>()
const viewport = ref<HTMLElement>()
const table = ref<HTMLTableElement>()
const rows = props.model.rows
const virtual = props.model.config.mode === 'virtual'
const { pool, startSpacerSize, endSpacerSize, scrollToItem, vDynamicScrollerItem } = virtual
  ? useDynamicScroller({
      items: () => rows.value,
      keyField: 'id',
      minItemSize: 80,
      el: viewport,
      flowMode: true,
    })
  : { pool: undefined, startSpacerSize: undefined, endSpacerSize: undefined, scrollToItem: undefined, vDynamicScrollerItem: undefined }
const { columnWidths, tableStyle } = useTableColumnWidths({ table, dependencies: () => [rows.value, props.model.state.width] })
/** Resolve deep jumps through the appropriate actual rendering strategy. */
function jump(index: number) {
  if (virtual)
    scrollToItem?.(index)
  else document.querySelector<HTMLElement>(`[data-record][data-id="${rows.value[index].id}"]`)?.scrollIntoView({ block: 'nearest' })
}
defineExpose({ jump })
</script>

<template>
  <div ref="viewport" class="viewport table-viewport" data-viewport :style="{ width: `${model.state.width}px` }">
    <table ref="table" :style="tableStyle">
      <colgroup v-if="columnWidths.length">
        <col v-for="(width, index) in columnWidths" :key="index" :style="{ width: `${width}px` }">
      </colgroup>
      <thead><tr><th>Select</th><th>Customer</th><th>Region</th><th>Account</th><th>Revenue</th><th>Account notes</th></tr></thead>
      <tbody v-if="virtual">
        <tr v-if="startSpacerSize" aria-hidden="true">
          <td colspan="6" class="spacer" :style="{ height: `${startSpacerSize}px` }" />
        </tr>
        <CustomerRow v-for="view in pool" :key="view.id" v-dynamic-scroller-item="{ view }" :row="view.item" :selected="model.state.selected.has(view.item.id)" @select="model.select" />
        <tr v-if="endSpacerSize" aria-hidden="true">
          <td colspan="6" class="spacer" :style="{ height: `${endSpacerSize}px` }" />
        </tr>
      </tbody>
      <tbody v-else>
        <CustomerRow v-for="row in rows" :key="row.id" :row="row" :selected="model.state.selected.has(row.id)" @select="model.select" />
      </tbody>
    </table>
  </div>
</template>
