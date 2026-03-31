<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import WindowScroller from '../../../../packages/vue-virtual-scroller/src/components/WindowScroller.vue'
import { avatarStyle, createMessages } from './demo-data'
import DemoShell from './DemoShell.vue'

const scroller = ref<InstanceType<typeof WindowScroller>>()
const count = ref(1800)
const expandedHero = ref(false)
const variableHeight = ref(false)
const scrollTo = ref(260)
const sourceRows = ref(createMessages(count.value, 612))

const visibleStart = ref(0)
const visibleEnd = ref(0)
const windowY = ref(0)

function getPreviewLines(message: string) {
  return Math.max(1, Math.min(4, Math.ceil(message.length / 72)))
}

function getRowHeight(message: string) {
  if (!variableHeight.value) {
    return 88
  }

  return 60 + (getPreviewLines(message) * 24)
}

const itemSize = computed(() => (variableHeight.value ? null : 88))

const rows = computed(() =>
  sourceRows.value.map(item => ({
    ...item,
    previewLines: getPreviewLines(item.message),
    height: getRowHeight(item.message),
  })),
)

function regenerate() {
  sourceRows.value = createMessages(Math.max(200, count.value), 612)
}

function syncWindowY() {
  windowY.value = Math.round(window.scrollY)
}

function jump() {
  const target = Math.min(Math.max(0, scrollTo.value), rows.value.length - 1)
  scroller.value?.scrollToItem(target, { align: 'start' })
}

function onUpdate(_viewStart: number, _viewEnd: number, start: number, end: number) {
  visibleStart.value = start
  visibleEnd.value = end
  syncWindowY()
}

watch(count, regenerate)

onMounted(() => {
  syncWindowY()
  window.addEventListener('scroll', syncWindowY, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', syncWindowY)
})
</script>

<template>
  <DemoShell
    demo-id="window-scroller"
    title="WindowScroller in page flow"
    description="Uses the browser window as the scroll container while the list stays part of the page."
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
        Expand intro block
        <input
          v-model="expandedHero"
          data-testid="demo:control:expanded-hero"
          type="checkbox"
        >
      </label>

      <label class="demo-chip">
        Use variable heights
        <input
          v-model="variableHeight"
          data-testid="demo:control:variable-height"
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
    </template>

    <div class="demo-window-page">
      <aside class="demo-window-stats">
        <span
          class="demo-chip"
          data-testid="demo:metric:visible-range"
        >Visible rows: {{ visibleStart }}-{{ visibleEnd }}</span>
        <span
          class="demo-chip"
          data-testid="demo:metric:window-y"
        >Window offset: {{ windowY }}</span>
      </aside>

      <WindowScroller
        ref="scroller"
        class="demo-window-scroller"
        data-testid="demo:viewport"
        :items="rows"
        :item-size="itemSize"
        :buffer="320"
        key-field="id"
        size-field="height"
        list-class="demo-window-track"
        :emit-update="true"
        @update="onUpdate"
      >
        <template #before>
          <section
            class="demo-window-hero"
            :class="{ 'is-expanded': expandedHero }"
            data-testid="demo:hero"
          >
            <div>
              <small class="demo-window-kicker">Before slot</small>
              <h4>Content before the virtualized list</h4>
              <p>
                This content lives in the `before` slot and appears ahead of the virtualized rows.
              </p>
              <p v-if="expandedHero">
                Expanding this block changes the leading slot height. Jump to the same row again to confirm that `WindowScroller` still lands where you expect.
              </p>
            </div>

            <div class="demo-window-summary">
              <span>{{ rows.length }} rows</span>
              <span>{{ variableHeight ? 'Data-driven row heights' : '88px fixed rows' }}</span>
            </div>
          </section>
        </template>

        <template #default="{ item, index }">
          <article
            class="demo-window-row"
            :class="{ 'is-variable': variableHeight }"
            data-testid="demo:row"
            :data-row-id="String(item.id)"
            :style="{ height: `${item.height}px` }"
          >
            <div
              class="demo-avatar"
              :style="avatarStyle(item.hue)"
            >
              {{ item.initials }}
            </div>

            <div class="demo-window-copy">
              <div class="demo-window-name">
                {{ item.user }}
              </div>
              <div
                class="demo-window-preview"
                :style="variableHeight ? { WebkitLineClamp: String(item.previewLines) } : undefined"
              >
                {{ item.message }}
              </div>
            </div>

            <div class="demo-window-meta">
              <small>{{ item.timestamp }}</small>
              <strong>#{{ index + 1 }}</strong>
            </div>
          </article>
        </template>

        <template #after>
          <footer class="demo-window-tail">
            <strong>After slot</strong>
            <p>The virtualized list can still be followed by ordinary page content after the last row.</p>
          </footer>
        </template>
      </WindowScroller>
    </div>
  </DemoShell>
</template>
