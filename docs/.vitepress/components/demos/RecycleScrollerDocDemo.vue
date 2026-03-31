<script setup lang="ts">
import type { Person, PersonRow } from './demo-data'
import { onMounted, ref, watch } from 'vue'
import RecycleScroller from '../../../../packages/vue-virtual-scroller/src/components/RecycleScroller.vue'
import { avatarStyle, createPeopleRows } from './demo-data'
import DemoShell from './DemoShell.vue'

const ITEM_SIZE = 74

const scroller = ref<InstanceType<typeof RecycleScroller>>()
const count = ref(8000)
const buffer = ref(240)
const scrollTo = ref(180)
const rows = ref<PersonRow[]>([])

const visibleStart = ref(0)
const visibleEnd = ref(0)

function regenerate() {
  rows.value = createPeopleRows(Math.max(50, count.value), false, 17)
}

function addPeople(amount = 100) {
  count.value = Math.min(50000, count.value + amount)
}

function jump() {
  const target = Math.min(Math.max(0, scrollTo.value), rows.value.length - 1)
  scroller.value?.scrollToItem(target)
}

function personOf(row: PersonRow) {
  return row.value as Person
}

function onUpdate(_viewStart: number, _viewEnd: number, start: number, end: number) {
  visibleStart.value = start
  visibleEnd.value = end
}

watch(count, regenerate)
onMounted(regenerate)
</script>

<template>
  <DemoShell
    demo-id="recycle-scroller"
    title="RecycleScroller with known sizes"
    description="A large fixed-size list example with fast navigation and predictable recycling."
  >
    <template #toolbar>
      <label class="demo-chip">
        Items
        <input
          v-model.number="count"
          data-testid="demo:control:items"
          type="number"
          min="50"
          max="50000"
        >
      </label>

      <label class="demo-chip">
        Buffer
        <input
          v-model.number="buffer"
          data-testid="demo:control:buffer"
          type="range"
          min="100"
          max="1800"
          step="20"
        >
        {{ buffer }}px
      </label>

      <label class="demo-chip">
        Go to item
        <input
          v-model.number="scrollTo"
          data-testid="demo:control:scroll-to"
          type="number"
          min="0"
          :max="rows.length"
        >
      </label>

      <button
        class="demo-button secondary"
        data-testid="demo:control:add-500"
        @click="addPeople(500)"
      >
        Add 500
      </button>

      <button
        class="demo-button"
        data-testid="demo:control:jump"
        @click="jump"
      >
        Go
      </button>

      <span
        class="demo-chip"
        data-testid="demo:metric:visible-range"
      >Visible rows: {{ visibleStart }}-{{ visibleEnd }}</span>
    </template>

    <RecycleScroller
      ref="scroller"
      class="demo-viewport"
      data-testid="demo:viewport"
      :items="rows"
      :item-size="ITEM_SIZE"
      :buffer="buffer"
      key-field="id"
      :emit-update="true"
      @update="onUpdate"
    >
      <template #default="{ item, index }">
        <div
          class="demo-person-row"
          data-testid="demo:row"
          data-row-type="person"
          :data-row-id="String(item.id)"
          :style="{ height: `${ITEM_SIZE}px` }"
        >
          <div
            class="demo-avatar"
            :style="avatarStyle(personOf(item).hue)"
          >
            {{ personOf(item).initials }}
          </div>

          <div>
            <div>{{ personOf(item).name }}</div>
            <small class="demo-message-meta">Fixed row height keeps the pool stable and predictable</small>
          </div>

          <small class="demo-message-meta">#{{ index }}</small>
        </div>
      </template>
    </RecycleScroller>
  </DemoShell>
</template>
