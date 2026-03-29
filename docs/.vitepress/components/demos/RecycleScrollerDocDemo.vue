<script setup lang="ts">
import type { Person, PersonRow } from './demo-data'
import { computed, onMounted, ref, watch } from 'vue'
import RecycleScroller from '../../../../packages/vue-virtual-scroller/src/components/RecycleScroller.vue'
import { avatarStyle, createPeopleRows } from './demo-data'
import DemoShell from './DemoShell.vue'

const scroller = ref<InstanceType<typeof RecycleScroller>>()
const count = ref(8000)
const withLetters = ref(true)
const buffer = ref(240)
const scrollTo = ref(180)
const rows = ref<PersonRow[]>([])

const visibleStart = ref(0)
const visibleEnd = ref(0)

const itemSize = computed(() => (withLetters.value ? null : 74))

function regenerate() {
  rows.value = createPeopleRows(Math.max(50, count.value), withLetters.value, 17)
}

function addPeople(amount = 100) {
  count.value = Math.min(50000, count.value + amount)
}

function jump() {
  const target = Math.min(Math.max(0, scrollTo.value), rows.value.length - 1)
  scroller.value?.scrollToItem(target)
}

function toggleLetterSize(row: PersonRow) {
  if (row.type === 'letter') {
    row.height = row.height === 96 ? 136 : 96
  }
}

function personOf(row: PersonRow) {
  return row.value as Person
}

function onUpdate(_viewStart: number, _viewEnd: number, start: number, end: number) {
  visibleStart.value = start
  visibleEnd.value = end
}

watch([count, withLetters], regenerate)
onMounted(regenerate)
</script>

<template>
  <DemoShell
    title="RecycleScroller: Large list, variable height"
    description="Handles large lists with known or data-driven row sizes and fast programmatic navigation."
  >
    <template #toolbar>
      <label class="demo-chip">
        Items
        <input
          v-model.number="count"
          type="number"
          min="50"
          max="50000"
        >
      </label>

      <label class="demo-chip">
        Variable height
        <input
          v-model="withLetters"
          type="checkbox"
        >
      </label>

      <label class="demo-chip">
        Buffer
        <input
          v-model.number="buffer"
          type="range"
          min="100"
          max="1800"
          step="20"
        >
        {{ buffer }}px
      </label>

      <label class="demo-chip">
        Scroll to
        <input
          v-model.number="scrollTo"
          type="number"
          min="0"
          :max="rows.length"
        >
      </label>

      <button
        class="demo-button secondary"
        @click="addPeople(500)"
      >
        +500
      </button>

      <button
        class="demo-button"
        @click="jump"
      >
        Jump
      </button>

      <span class="demo-chip">Visible: {{ visibleStart }}-{{ visibleEnd }}</span>
    </template>

    <RecycleScroller
      ref="scroller"
      class="demo-viewport"
      :items="rows"
      :item-size="itemSize"
      :buffer="buffer"
      key-field="id"
      size-field="height"
      :emit-update="true"
      @update="onUpdate"
    >
      <template #default="{ item, index }">
        <div
          v-if="item.type === 'letter'"
          class="demo-letter-row"
          :style="{ height: `${item.height}px` }"
          @click="toggleLetterSize(item)"
        >
          <strong>{{ item.value }}</strong>
          <span>Segment {{ index }}</span>
        </div>

        <div
          v-else
          class="demo-person-row"
          :style="{ height: `${item.height}px` }"
        >
          <div
            class="demo-avatar"
            :style="avatarStyle(personOf(item).hue)"
          >
            {{ personOf(item).initials }}
          </div>

          <div>
            <div>{{ personOf(item).name }}</div>
            <small class="demo-message-meta">Click letter rows to toggle heights</small>
          </div>

          <small class="demo-message-meta">#{{ index }}</small>
        </div>
      </template>
    </RecycleScroller>
  </DemoShell>
</template>
