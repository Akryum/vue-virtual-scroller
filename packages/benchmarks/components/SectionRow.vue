<script setup lang="ts">
import type { BenchRecord } from '../data/types'
import { sectionRowSize } from '../workloads/sections'
import DiffFileHeader from './DiffFileHeader.vue'
import DiffHunkRow from './DiffHunkRow.vue'
import DiffLine from './DiffLine.vue'
import ExplorerBranchRow from './ExplorerBranchRow.vue'
import ExplorerCommitRow from './ExplorerCommitRow.vue'
import ExplorerGroupRow from './ExplorerGroupRow.vue'
import ExplorerProjectRow from './ExplorerProjectRow.vue'
/**
 * Picks the row component for a record kind, like an explorer tree node.
 * A recycled view that changes kind switches components here, which is what
 * the scroller's `typeField` pools avoid.
 */
defineProps<{ row: BenchRecord, selected: boolean, expanded: boolean, pinned?: boolean }>()
const emit = defineEmits<{ select: [id: number] }>()
</script>

<template>
  <div class="section-row" :style="{ height: `${sectionRowSize(row, expanded)}px` }">
    <ExplorerProjectRow v-if="row.kind === 'project'" :row="row" :selected="selected" :expanded="expanded" :pinned="pinned" @select="emit('select', $event)" />
    <ExplorerGroupRow v-else-if="row.kind === 'group'" :row="row" :selected="selected" :expanded="expanded" :pinned="pinned" />
    <ExplorerBranchRow v-else-if="row.kind === 'branch'" :row="row" :selected="selected" :expanded="expanded" :pinned="pinned" @select="emit('select', $event)" />
    <ExplorerCommitRow v-else-if="row.kind === 'commit'" :row="row" :selected="selected" :expanded="expanded" :pinned="pinned" @select="emit('select', $event)" />
    <DiffFileHeader v-else-if="row.kind === 'file'" :row="row" :selected="selected" :expanded="expanded" :pinned="pinned" @select="emit('select', $event)" />
    <DiffHunkRow v-else-if="row.kind === 'hunk'" :row="row" :selected="selected" :expanded="expanded" :pinned="pinned" />
    <DiffLine v-else :row="row" :selected="selected" :expanded="expanded" :pinned="pinned" @select="emit('select', $event)" />
  </div>
</template>
