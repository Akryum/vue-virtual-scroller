<script setup lang="ts">
import { ref } from 'vue'
import { DynamicScroller, RecycleScroller } from '../index'

interface Message {
  id: string
  text: string
  size: number
}

const messages = ref<Message[]>([
  {
    id: 'alpha',
    text: 'Hello',
    size: 32,
  },
])

const functionItemSize = (item: Message) => item.size
</script>

<template>
  <RecycleScroller
    :items="messages"
    :item-size="32"
    :disable-transform="true"
  >
    <template #default="{ item }">
      {{ item.text.toUpperCase() }}
      <!-- @vue-expect-error Message slot props should stay item-aware. -->
      {{ item.missing }}
    </template>
  </RecycleScroller>

  <RecycleScroller
    :items="messages"
    :item-size="functionItemSize"
    :min-item-size="32"
    :disable-transform="true"
  >
    <template #default="{ item }">
      {{ item.text.toUpperCase() }}
    </template>
  </RecycleScroller>

  <DynamicScroller
    :items="messages"
    :min-item-size="32"
    :disable-transform="true"
  >
    <template #default="{ item, itemWithSize }">
      {{ item.text.toUpperCase() }}
      {{ itemWithSize.item.text.toUpperCase() }}
      <!-- @vue-expect-error Wrapped dynamic slot items should stay item-aware. -->
      {{ itemWithSize.item.missing }}
    </template>
  </DynamicScroller>
</template>
