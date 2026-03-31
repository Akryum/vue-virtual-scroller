<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import DynamicScroller from '../../../../packages/vue-virtual-scroller/src/components/DynamicScroller.vue'
import DynamicScrollerItem from '../../../../packages/vue-virtual-scroller/src/components/DynamicScrollerItem.vue'
import { avatarStyle, createMessages } from './demo-data'
import DemoShell from './DemoShell.vue'

const scroller = ref<InstanceType<typeof DynamicScroller>>()
const basePool = createMessages(320, 911)
const initialStart = 120
const initialCount = 36
const shiftEnabled = ref(true)
const visibleStart = ref(0)
const rows = ref(createWindow(initialStart, initialStart + initialCount))
const historyCursor = ref(initialStart)

const topRow = computed(() => rows.value[visibleStart.value] ?? null)

function createWindow(start: number, end: number) {
  return basePool.slice(start, end).map((item, index) => {
    const sourceIndex = start + index
    return {
      ...item,
      id: sourceIndex + 1,
      timestamp: `History ${String(sourceIndex + 1).padStart(3, '0')}`,
    }
  })
}

async function jumpToMiddle() {
  await nextTick()
  requestAnimationFrame(() => {
    scroller.value?.scrollToItem(18, { align: 'center' })
  })
}

async function reset() {
  historyCursor.value = initialStart
  rows.value = createWindow(initialStart, initialStart + initialCount)
  visibleStart.value = 0
  await jumpToMiddle()
}

async function prepend(count: number) {
  if (historyCursor.value <= 0) {
    return
  }

  const nextStart = Math.max(0, historyCursor.value - count)
  const prepended = createWindow(nextStart, historyCursor.value)
  historyCursor.value = nextStart
  rows.value = [...prepended, ...rows.value]
}

function onUpdate(_startIndex: number, _endIndex: number, nextVisibleStart: number) {
  visibleStart.value = nextVisibleStart
}

onMounted(() => {
  void jumpToMiddle()
})
</script>

<template>
  <DemoShell
    demo-id="shift"
    title="Prepend anchoring with shift"
    description="Adds older rows above the viewport. With shift enabled, the current view stays in place."
  >
    <template #toolbar>
      <label class="demo-chip">
        <input
          v-model="shiftEnabled"
          data-testid="demo:control:shift"
          type="checkbox"
        >
        Keep position with shift
      </label>

      <button
        class="demo-button"
        data-testid="demo:control:prepend-1"
        @click="prepend(1)"
      >
        Add 1 above
      </button>
      <button
        class="demo-button"
        data-testid="demo:control:prepend-10"
        @click="prepend(10)"
      >
        Add 10 above
      </button>
      <button
        class="demo-button secondary"
        data-testid="demo:control:jump-middle"
        @click="jumpToMiddle"
      >
        Go to middle
      </button>
      <button
        class="demo-button secondary"
        data-testid="demo:control:reset"
        @click="reset"
      >
        Reset
      </button>

      <span
        class="demo-chip"
        data-testid="demo:metric:rows"
      >Loaded rows: {{ rows.length }}</span>
      <span
        class="demo-chip"
        data-testid="demo:metric:top-row"
      >First visible row: {{ topRow ? `#${topRow.id}` : '—' }}</span>
    </template>

    <DynamicScroller
      ref="scroller"
      class="demo-viewport"
      data-testid="demo:viewport"
      :items="rows"
      :min-item-size="62"
      :shift="shiftEnabled"
      :emit-update="true"
      @update="onUpdate"
    >
      <template #default="{ item, active }">
        <DynamicScrollerItem
          :item="item"
          :active="active"
          :size-dependencies="[item.message]"
          class="demo-message-row"
          data-testid="demo:row"
          :data-row-id="String(item.id)"
        >
          <div
            class="demo-avatar"
            :style="avatarStyle(item.hue)"
          >
            {{ item.initials }}
          </div>

          <div class="demo-chat-bubble">
            <strong>{{ item.user }}</strong>
            <div class="demo-message-body">
              {{ item.message }}
            </div>
          </div>

          <small class="demo-message-meta">{{ item.timestamp }}</small>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
  </DemoShell>
</template>
