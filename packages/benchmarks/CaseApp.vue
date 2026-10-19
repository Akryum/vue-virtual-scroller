<script setup lang="ts">
import type { WorkloadState } from './workloads/state'
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { createController } from './measurement/controller'
import { validateConfig } from './workloads/registry'
import WorkloadView from './workloads/WorkloadView.vue'

const model = shallowRef<WorkloadState>()
const mounted = ref(false)
const view = ref<InstanceType<typeof WorkloadView>>()
const controller = createController(model, visible => mounted.value = visible, index => view.value?.jump(index))
onMounted(async () => {
  try {
    const params = new URLSearchParams(location.search)
    const config = validateConfig({ workload: params.get('workload') as 'issue-inbox', mode: params.get('mode') as 'virtual', count: Number(params.get('count') ?? 1000), seed: Number(params.get('seed') ?? 2026) })
    await controller.prepare(config)
    window.benchmark = controller
  }
  catch (error) { window.benchmarkError = String(error) }
})
onBeforeUnmount(() => {
  controller.dispose()
  delete window.benchmark
})
</script>

<template>
  <main class="case-root">
    <WorkloadView v-if="mounted && model" ref="view" :model="model" />
  </main>
</template>
