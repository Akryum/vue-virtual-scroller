<script setup lang="ts">
import type { MessageRow } from './demo-data'
import { computed, ref, watch } from 'vue'
import RecycleScroller from '../../../../packages/vue-virtual-scroller/src/components/RecycleScroller.vue'
import { avatarStyle, createMessages } from './demo-data'
import DemoShell from './DemoShell.vue'

interface FunctionSizeRow extends MessageRow {
  density: 'compact' | 'comfortable'
  priority: 'normal' | 'vip' | 'alert'
  resolvedHeight: number
}

type RecycleScrollerExposed = InstanceType<typeof RecycleScroller> & {
  visiblePool?: Array<{ nr: { index: number } }>
}

const scroller = ref<RecycleScrollerExposed>()
const count = ref(1600)
const compact = ref(false)
const useFunctionGetter = ref(true)
const scrollTo = ref(120)
const sourceRows = ref(createMessages(count.value, 427))

const visibleStart = ref(0)
const visibleEnd = ref(0)

/**
 * Build stable synthetic priority so row height can be derived from item content.
 */
function getPriority(index: number): FunctionSizeRow['priority'] {
  if (index % 11 === 0)
    return 'alert'
  if (index % 4 === 0)
    return 'vip'
  return 'normal'
}

/**
 * Estimate preview line count from message length.
 */
function getPreviewLines(message: string, priority: FunctionSizeRow['priority']) {
  const lines = Math.ceil(message.length / 72)
  return priority === 'alert'
    ? Math.min(5, lines + 1)
    : Math.min(4, Math.max(1, lines))
}

/**
 * Derive row height without relying on one dedicated item field.
 */
function resolveItemHeight(item: Pick<FunctionSizeRow, 'message' | 'priority'>, index: number) {
  const previewLines = getPreviewLines(item.message, item.priority)
  const densityBase = compact.value ? 54 : 72
  const priorityBoost = item.priority === 'alert' ? 20 : item.priority === 'vip' ? 10 : 0
  const parityBoost = index % 3 === 0 ? 6 : 0
  return densityBase + (previewLines * 18) + priorityBoost + parityBoost
}

const rows = computed<FunctionSizeRow[]>(() =>
  sourceRows.value.map((row, index) => {
    const priority = getPriority(index)
    return {
      ...row,
      density: compact.value ? 'compact' : 'comfortable',
      priority,
      resolvedHeight: resolveItemHeight({
        message: row.message,
        priority,
      }, index),
    }
  }),
)

const itemSize = computed(() => (useFunctionGetter.value
  ? (item: FunctionSizeRow, index: number) => resolveItemHeight(item, index)
  : null))

const sizeModeLabel = computed(() => (useFunctionGetter.value ? 'Function getter' : 'sizeField'))

const renderedSummary = computed(() => `${visibleStart.value}-${visibleEnd.value}`)

function regenerate() {
  sourceRows.value = createMessages(Math.max(200, count.value), 427)
}

function jump() {
  const target = Math.min(Math.max(0, scrollTo.value), rows.value.length - 1)
  scroller.value?.scrollToItem(target, { align: 'start' })
}

function onUpdate(_viewStart: number, _viewEnd: number, start: number, end: number) {
  visibleStart.value = start
  visibleEnd.value = end
}

watch(count, regenerate)
</script>

<template>
  <DemoShell
    demo-id="function-item-size"
    title="Function itemSize getter"
    description="Derive virtual row sizes from item content and UI state without storing them under one dedicated field."
  >
    <template #toolbar>
      <label class="demo-chip">
        Items
        <input
          v-model.number="count"
          data-testid="demo:control:items"
          type="number"
          min="200"
          max="12000"
        >
      </label>

      <label class="demo-chip">
        Compact density
        <input
          v-model="compact"
          data-testid="demo:control:compact"
          type="checkbox"
        >
      </label>

      <label class="demo-chip">
        Use function getter
        <input
          v-model="useFunctionGetter"
          data-testid="demo:control:function-getter"
          type="checkbox"
        >
      </label>

      <label class="demo-chip">
        Go to row
        <input
          v-model.number="scrollTo"
          data-testid="demo:control:scroll-to"
          type="number"
          min="0"
          :max="rows.length"
        >
      </label>

      <button
        class="demo-button"
        data-testid="demo:control:jump"
        @click="jump"
      >
        Go
      </button>

      <span class="demo-chip">Mode: {{ sizeModeLabel }}</span>
      <span class="demo-chip">Visible rows: {{ renderedSummary }}</span>
    </template>

    <RecycleScroller
      ref="scroller"
      class="demo-viewport"
      data-testid="demo:viewport"
      :items="rows"
      :item-size="itemSize"
      key-field="id"
      size-field="resolvedHeight"
      :buffer="260"
      :emit-update="true"
      @update="onUpdate"
    >
      <template #default="{ item, index }">
        <article
          class="demo-function-size-row"
          data-testid="demo:row"
          :data-row-id="String(item.id)"
          :style="{ height: `${item.resolvedHeight}px` }"
        >
          <div
            class="demo-avatar"
            :style="avatarStyle(item.hue)"
          >
            {{ item.initials }}
          </div>

          <div class="demo-function-size-copy">
            <div class="demo-function-size-topline">
              <strong>{{ item.user }}</strong>
              <span class="demo-function-size-badge">{{ item.priority }}</span>
              <span class="demo-function-size-badge">{{ item.density }}</span>
            </div>

            <p class="demo-function-size-message">
              Chosen row height: <strong>{{ item.resolvedHeight }}px</strong>
            </p>
          </div>

          <div class="demo-function-size-meta">
            <small>{{ item.timestamp }}</small>
            <strong>#{{ index + 1 }}</strong>
            <small>{{ item.resolvedHeight }}px</small>
          </div>
        </article>
      </template>
    </RecycleScroller>
  </DemoShell>
</template>

<style scoped>
.demo-function-size-row {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: start;
  box-sizing: border-box;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.demo-function-size-copy {
  min-width: 0;
}

.demo-function-size-topline {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 6px;
}

.demo-function-size-topline strong {
  color: var(--demo-text);
}

.demo-function-size-badge {
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border: 1px solid var(--demo-border);
  background: color-mix(in srgb, var(--demo-surface) 72%, transparent 28%);
  color: var(--demo-muted);
}

.demo-function-size-message {
  margin: 0;
  color: var(--demo-text);
  line-height: 1.45;
}

.demo-function-size-message strong {
  color: var(--demo-accent);
}

.demo-function-size-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
  color: var(--demo-muted);
}
</style>
