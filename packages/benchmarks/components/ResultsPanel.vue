<script setup lang="ts">
import type { Report } from '../reports/types'
import { computed } from 'vue'
import { aggregate, diagnostics, percentile } from '../reports/summary.mjs'
/** Reports from either browser UI or CLI share this renderer. */
const props = defineProps<{ report: Report }>()
const rows = computed(() => aggregate(props.report.trials))
const scrollRows = computed(() => diagnostics(props.report.trials))
/** Display absent samples explicitly rather than inventing a zero. */
function number(value: number | null) {
  return value == null ? '—' : value.toFixed(2)
}
</script>

<template>
  <section aria-label="Benchmark results">
    <p>Status: {{ report.status }} · {{ report.trials.filter(trial => trial.valid && !trial.warmup).length }} valid trials · {{ report.trials.filter(trial => !trial.valid && !trial.warmup).length }} invalid trials</p>
    <p v-for="(trial, index) in report.trials.filter(trial => !trial.valid)" :key="index" class="error">
      {{ trial.browser }} / {{ trial.workload }} / {{ trial.mode }}: {{ trial.error }}
    </p>
    <div class="result-scroll">
      <table class="results">
        <thead><tr><th>Browser</th><th>Workload</th><th>Items</th><th>Mode</th><th>Action</th><th>Valid / invalid</th><th>Median ms</th><th>Range ms</th><th>Plain / virtual</th></tr></thead>
        <tbody>
          <tr v-for="row in rows" :key="`${row.browser}:${row.workload}:${row.count}:${row.mode}:${row.phase}`">
            <td>{{ row.browser }}</td><td>{{ row.workload }}</td><td>{{ row.count }}</td><td>{{ row.mode }}</td><td>{{ row.phase }}</td><td>{{ row.valid }} / {{ row.invalid }}</td>
            <td>{{ number(row.median) }}</td><td>{{ number(row.min) }}–{{ number(row.max) }}</td><td>{{ number(percentile(row.pairedRatios, 50)) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <h2>Scripted scroll and DOM</h2>
    <div class="result-scroll">
      <table class="results">
        <thead><tr><th>Browser / workload</th><th>Items/cells</th><th>Mode</th><th>P50 / P95 interval ms</th><th>Stalls &gt;50ms</th><th>Max mounted records</th><th>Max elements</th></tr></thead>
        <tbody>
          <tr v-for="row in scrollRows" :key="`${row.browser}:${row.workload}:${row.count}:${row.mode}`">
            <td>{{ row.browser }} / {{ row.workload }}</td><td>{{ row.count }}</td><td>{{ row.mode }}</td><td>{{ number(row.p50) }} / {{ number(row.p95) }}</td>
            <td>{{ number(row.medianStalls) }}</td><td>{{ row.maxRecords }}</td><td>{{ row.maxElements }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <details><summary>Environment and measurement policy</summary><pre>{{ JSON.stringify(report.metadata, null, 2) }}</pre></details>
  </section>
</template>
