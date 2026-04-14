<script setup lang="ts">
import RowAvatar from './virtual-vs-plain-list/RowAvatar.vue'
import RowChips from './virtual-vs-plain-list/RowChips.vue'
import RowFooter from './virtual-vs-plain-list/RowFooter.vue'
import RowHeader from './virtual-vs-plain-list/RowHeader.vue'
import RowIndex from './virtual-vs-plain-list/RowIndex.vue'
import RowMeter from './virtual-vs-plain-list/RowMeter.vue'
import RowSummary from './virtual-vs-plain-list/RowSummary.vue'

interface Props {
  index: number
  item: string
  itemSize: number
}

defineProps<Props>()
</script>

<template>
  <article
    class="demo-heavy-row"
    :style="{ height: `${itemSize}px` }"
  >
    <RowAvatar :index="index" />

    <div class="demo-heavy-row__content">
      <RowHeader
        :index="index"
        :item="item"
      />
      <RowChips :item="item" />
      <RowSummary :item="item" />
      <RowFooter :index="index" />
      <RowMeter :index="index" />
    </div>

    <RowIndex :index="index" />
  </article>
</template>

<style scoped>
.demo-heavy-row {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  gap: 12px;
  box-sizing: border-box;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.demo-heavy-row__avatar {
  margin-top: 2px;
}

.demo-heavy-row__content {
  min-width: 0;
}
</style>
