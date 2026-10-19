<script setup lang="ts">
import type { CaseConfig } from './workloads/registry'
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import ResultsPanel from './components/ResultsPanel.vue'
import { useHarness } from './measurement/useHarness'
import { WORKLOADS } from './workloads/registry'

const iframe = ref<HTMLIFrameElement>()
const config = reactive<CaseConfig>({ workload: 'issue-inbox', mode: 'virtual', count: 1000, seed: 2026 })
const trials = ref(5)
const selected = computed(() => WORKLOADS.find(workload => workload.id === config.workload)!)
const production = import.meta.env.PROD
const { busy, status, error, report, preview, action, compare, cancel, download, importReport } = useHarness(iframe)
/** Snapshot reactive controls; controller validates before allocating workload data. */
function configuration() {
  return { ...config }
}
onBeforeUnmount(cancel)
</script>

<template>
  <main class="app">
    <header><h1>Vue Virtual Scroller benchmarks</h1><span class="status" role="status">{{ status }}</span></header>
    <form class="toolbar" @submit.prevent="preview(configuration())">
      <label>Workload<select v-model="config.workload" :disabled="busy"><option v-for="workload in WORKLOADS" :key="workload.id" :value="workload.id">{{ workload.name }}</option></select></label>
      <label>Mode<select v-model="config.mode" :disabled="busy"><option value="virtual">Virtual</option><option value="plain">Plain Vue</option></select></label>
      <label>Items<input v-model.number="config.count" type="number" min="30" max="100000" required :disabled="busy"></label>
      <label>Seed<input v-model.number="config.seed" type="number" min="0" max="4294967295" required :disabled="busy"></label>
      <label>Paired trials<input v-model.number="trials" type="number" min="1" max="100" required :disabled="busy"></label>
      <button :disabled="busy">
        Preview
      </button>
      <button type="button" :disabled="busy || !production" @click="compare(configuration(), trials)">
        Run comparison
      </button>
      <button type="button" :disabled="!busy" @click="cancel">
        Cancel
      </button>
    </form>
    <p v-if="!production">
      Benchmark timings require production preview.
    </p>
    <p v-if="error" class="error" role="alert">
      {{ error }}
    </p>
    <div class="toolbar" aria-label="Workload actions">
      <button v-for="name in selected.actions" :key="name" :disabled="busy" @click="action(configuration(), name)">
        {{ name }}
      </button>
    </div>
    <div class="preview-frame">
      <iframe ref="iframe" title="Isolated benchmark workload" src="about:blank" />
    </div>
    <div class="toolbar">
      <label>Import report<input type="file" accept="application/json,.json" :disabled="busy" @change="importReport"></label><button :disabled="!report || busy" @click="download('json')">
        Export JSON
      </button><button :disabled="!report || busy" @click="download('md')">
        Export Markdown
      </button>
    </div>
    <ResultsPanel v-if="report" :report="report" />
  </main>
</template>
