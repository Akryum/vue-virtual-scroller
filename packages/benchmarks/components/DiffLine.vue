<script setup lang="ts">
import type { BenchRecord } from '../data/types'
import { computed } from 'vue'
import { recordAttributes } from './format'
import { highlightCode } from './highlight'
/** One unified diff line with gutters and highlighted code. */
const props = defineProps<{ row: BenchRecord, selected: boolean, expanded: boolean, pinned?: boolean }>()
const emit = defineEmits<{ select: [id: number] }>()
const html = computed(() => highlightCode(props.row.title))
const sign = computed(() => props.row.status === 'Added' ? '+' : props.row.status === 'Removed' ? '−' : ' ')
</script>

<template>
  <div v-bind="pinned ? {} : recordAttributes(row, selected, expanded)" class="diff-line" :class="[`diff-${row.status.toLowerCase()}`, { selected }]" @dblclick="emit('select', row.id)">
    <span class="diff-gutter">{{ row.oldLine ?? '' }}</span><span class="diff-gutter">{{ row.newLine ?? '' }}</span>
    <span class="diff-sign" aria-hidden="true">{{ sign }}</span>
    <!-- eslint-disable-next-line vue/no-v-html -- deterministic, escaped highlighter output -->
    <code v-html="html" />
  </div>
</template>
