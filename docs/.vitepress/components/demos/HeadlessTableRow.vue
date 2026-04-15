<script setup lang="ts">
import type { TableRow } from './demo-data'

defineProps<{
  row: TableRow
}>()
</script>

<template>
  <tr
    class="demo-headless-table__row"
    data-testid="demo:row"
    :data-row-id="String(row.id)"
  >
    <td v-memo="[row.id]">
      #{{ row.id }}
    </td>
    <td v-memo="[row.name, row.summary]">
      <div class="demo-table-cell">
        <strong class="demo-table-cell__primary">{{ row.name }}</strong>
        <span class="demo-table-cell__secondary">{{ row.summary }}</span>
      </div>
    </td>
    <td v-memo="[row.email]">
      <span
        class="demo-table-cell__mono"
        :title="row.email"
      >{{ row.email }}</span>
    </td>
    <td v-memo="[row.region]">
      {{ row.region }}
    </td>
    <td v-memo="[row.status]">
      <span
        class="demo-status-badge"
        :data-status="row.status.toLowerCase()"
      >
        {{ row.status }}
      </span>
    </td>
  </tr>
</template>
