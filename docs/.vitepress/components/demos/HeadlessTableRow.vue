<script setup lang="ts">
import type { TableRow } from './demo-data'
import { onBeforeUnmount, onMounted } from 'vue'

const props = defineProps<{
  row: TableRow
}>()

onMounted(() => {
  // eslint-disable-next-line no-console
  console.log('Row mounted:', props.row.id)
})

onBeforeUnmount(() => {
  // eslint-disable-next-line no-console
  console.log('Row unmounted:', props.row.id)
})
</script>

<template>
  <tr
    class="demo-headless-table__row"
    data-testid="demo:row"
    :data-row-id="String(row.id)"
  >
    <td>#{{ row.id }}</td>
    <td>
      <div class="demo-table-cell">
        <strong class="demo-table-cell__primary">{{ row.name }}</strong>
        <span class="demo-table-cell__secondary">{{ row.summary }}</span>
      </div>
    </td>
    <td>
      <span
        class="demo-table-cell__mono"
        :title="row.email"
      >{{ row.email }}</span>
    </td>
    <td>{{ row.region }}</td>
    <td>
      <span
        class="demo-status-badge"
        :data-status="row.status.toLowerCase()"
      >
        {{ row.status }}
      </span>
    </td>
  </tr>
</template>
