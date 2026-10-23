<script setup lang="ts">
import CustomerTable from '../../workloads/CustomerTable.vue'
import { createWorkloadState } from '../../workloads/state'

/** Small real-consumer fixture: first update grows an unbroken currency value. */
const model = createWorkloadState({
  workload: 'customer-table',
  mode: new URLSearchParams(location.search).get('mode') === 'plain' ? 'plain' : 'virtual',
  count: 101,
  seed: 2026,
})
// All accounts are legitimate but intentionally small except the first revenue boundary.
for (const row of model.state.records) {
  row.title = `Account ${row.id}`
  row.body = 'Review pending.'
  row.amount = row.id === 1 ? 9_999_999_900 : 1000
}
</script>

<template>
  <button @click="model.update()">
    Update accounts
  </button>
  <CustomerTable :model="model" />
</template>
