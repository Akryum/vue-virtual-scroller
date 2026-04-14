<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import RecycleScroller from '../../../../packages/vue-virtual-scroller/src/components/RecycleScroller.vue'
import { createSimpleStrings } from './demo-data'
import DemoShell from './DemoShell.vue'
import VirtualVsPlainListRow from './VirtualVsPlainListRow.vue'

const ITEM_SIZE = 152
const ROW_COUNT = 10000
const ROW_ID_SEPARATOR = '::'

const rows = createSimpleStrings(ROW_COUNT, 808)
const listMounted = ref(true)
const mountDuration = ref<number | null>(null)
const plainViewport = ref<HTMLElement | null>(null)
const recycleScroller = ref<InstanceType<typeof RecycleScroller> | null>(null)
const renderedRows = ref(0)
const showList = ref(true)
const unmountDuration = ref<number | null>(null)
const useVirtualScrolling = ref(true)

const modeLabel = computed(() => useVirtualScrolling.value ? 'virtual' : 'plain')
const placeholderLabel = computed(() => showList.value
  ? 'List remounting for timing measurement...'
  : 'List hidden. Toggle Show list to measure next mount.')

/**
 * Build stable row id for test selectors and visible-item assertions.
 */
function rowId(index: number, item: string) {
  return `${index}${ROW_ID_SEPARATOR}${item}`
}

/**
 * Format timing metrics with stable placeholder before first interaction.
 */
function formatDuration(duration: number | null) {
  return duration == null ? '—' : `${duration.toFixed(1)} ms`
}

/**
 * Wait for paint frames so mount and unmount metrics include DOM work.
 */
async function waitForFrames(frameCount = 1) {
  for (let index = 0; index < frameCount; index++) {
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
  }
}

/**
 * Resolve active scroll container across visibility and rendering modes.
 */
function currentViewportElement() {
  if (!showList.value || !listMounted.value) {
    return undefined
  }

  if (useVirtualScrolling.value) {
    return recycleScroller.value?.$el as HTMLElement | undefined
  }

  return plainViewport.value ?? undefined
}

/**
 * Count rendered rows after Vue and browser finish current update cycle.
 */
async function refreshRenderedRows() {
  if (!showList.value || !listMounted.value) {
    renderedRows.value = 0
    return
  }

  await nextTick()
  await waitForFrames()

  if (!useVirtualScrolling.value) {
    renderedRows.value = rows.length
    return
  }

  const viewport = currentViewportElement()
  renderedRows.value = viewport?.querySelectorAll('[data-testid="demo:row"]').length ?? 0
}

/**
 * Reset list scroll position so comparisons always restart from top.
 */
async function resetViewport() {
  await nextTick()
  const viewport = currentViewportElement()
  if (viewport) {
    viewport.scrollTop = 0
  }
}

/**
 * Fully unmount active list and capture teardown duration.
 */
async function measureUnmount() {
  const start = performance.now()
  listMounted.value = false
  renderedRows.value = 0
  await nextTick()
  await waitForFrames(2)
  unmountDuration.value = performance.now() - start
}

/**
 * Mount active list branch and capture startup duration.
 */
async function measureMount() {
  const start = performance.now()
  listMounted.value = true
  await nextTick()
  await waitForFrames(2)
  await resetViewport()
  await refreshRenderedRows()
  mountDuration.value = performance.now() - start
}

/**
 * Apply virtualization toggle through real unmount + remount cycle.
 */
async function onVirtualModeChange(event: Event) {
  const target = event.target as HTMLInputElement

  if (useVirtualScrolling.value === target.checked) {
    return
  }

  if (!showList.value) {
    useVirtualScrolling.value = target.checked
    return
  }

  await measureUnmount()
  useVirtualScrolling.value = target.checked
  await measureMount()
}

/**
 * Measure how long whole list mount or unmount takes.
 */
async function onListVisibilityChange(event: Event) {
  const target = event.target as HTMLInputElement
  const nextValue = target.checked

  if (showList.value === nextValue) {
    return
  }

  showList.value = nextValue

  if (nextValue) {
    await measureMount()
    return
  }

  await measureUnmount()
}

/**
 * Refresh rendered row metric from scroll and recycle updates.
 */
function scheduleRenderedRowsRefresh() {
  void refreshRenderedRows()
}

onMounted(() => {
  void refreshRenderedRows()
})
</script>

<template>
  <DemoShell
    demo-id="virtual-vs-plain-list"
    title="Virtual scrolling on vs off"
    description="Compare heavy fixed-height rows with and without virtualization, then hide the whole list to measure mount and unmount cost."
  >
    <template #toolbar>
      <label class="demo-chip">
        With virtual scrolling
        <input
          :checked="useVirtualScrolling"
          data-testid="demo:control:virtual-mode"
          type="checkbox"
          @change="onVirtualModeChange"
        >
      </label>

      <label class="demo-chip">
        Show list
        <input
          :checked="showList"
          data-testid="demo:control:list-visible"
          type="checkbox"
          @change="onListVisibilityChange"
        >
      </label>

      <span
        class="demo-chip"
        data-testid="demo:metric:rows"
      >Rows: {{ rows.length }}</span>

      <span class="demo-chip">Mode: {{ modeLabel }}</span>

      <span
        class="demo-chip"
        data-testid="demo:metric:rendered-rows"
      >Rendered rows: {{ renderedRows }}</span>

      <span
        class="demo-chip"
        data-testid="demo:metric:mount-duration"
      >Mount: {{ formatDuration(mountDuration) }}</span>

      <span
        class="demo-chip"
        data-testid="demo:metric:unmount-duration"
      >Unmount: {{ formatDuration(unmountDuration) }}</span>
    </template>

    <RecycleScroller
      v-if="showList && listMounted && useVirtualScrolling"
      ref="recycleScroller"
      class="demo-viewport"
      data-testid="demo:viewport"
      :items="rows"
      :item-size="ITEM_SIZE"
      :emit-update="true"
      @update="scheduleRenderedRowsRefresh"
    >
      <template #default="{ item, index }">
        <VirtualVsPlainListRow
          :index="index"
          :item="item"
          :item-size="ITEM_SIZE"
          data-testid="demo:row"
          :data-row-id="rowId(index, item)"
        />
      </template>
    </RecycleScroller>

    <div
      v-else-if="showList && listMounted"
      ref="plainViewport"
      class="demo-viewport demo-plain-list-viewport"
      data-testid="demo:viewport"
      @scroll.passive="scheduleRenderedRowsRefresh"
    >
      <VirtualVsPlainListRow
        v-for="(item, index) in rows"
        :key="rowId(index, item)"
        :index="index"
        :item="item"
        :item-size="ITEM_SIZE"
        data-testid="demo:row"
        :data-row-id="rowId(index, item)"
      />
    </div>

    <div
      v-else
      class="demo-viewport demo-list-placeholder"
      data-testid="demo:viewport"
    >
      {{ placeholderLabel }}
    </div>
  </DemoShell>
</template>

<style scoped>
.demo-plain-list-viewport {
  overflow-y: auto;
}

.demo-list-placeholder {
  display: grid;
  place-items: center;
  color: var(--demo-muted);
  font-size: 0.95rem;
}
</style>
