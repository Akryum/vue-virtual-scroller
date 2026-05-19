<script setup>
import { computed, ref } from 'vue'
import { generateMessage } from '../data'

/**
 * Reproduction for issue #928: DynamicScroller with `page-mode` nested inside
 * a scrollable parent <div>. Toggling between auto-detection and an explicit
 * `scrollParent` ref shows that both code paths virtualize correctly against
 * the inner div's clip box rather than `window.innerHeight`.
 */
const items = []
for (let i = 0; i < 10_000; i++) {
  items.push({ id: i, ...generateMessage() })
}

const scrollParentRef = ref(null)
const useExplicitScrollParent = ref(false)
const updateParts = ref({ viewStartIdx: 0, viewEndIdx: 0, visibleStartIdx: 0, visibleEndIdx: 0 })

const explicitScrollParent = computed(() => useExplicitScrollParent.value ? scrollParentRef.value : undefined)

function onUpdate(viewStartIndex, viewEndIndex, visibleStartIndex, visibleEndIndex) {
  updateParts.value = {
    viewStartIdx: viewStartIndex,
    viewEndIdx: viewEndIndex,
    visibleStartIdx: visibleStartIndex,
    visibleEndIdx: visibleEndIndex,
  }
}
</script>

<template>
  <div class="page-mode-demo">
    <div class="toolbar">
      <label>
        <input
          v-model="useExplicitScrollParent"
          type="checkbox"
        >
        Use explicit scrollParent prop (vs. auto-detect)
      </label>
      <span>
        view [{{ updateParts.viewStartIdx }} → {{ updateParts.viewEndIdx }}]
        visible [{{ updateParts.visibleStartIdx }} → {{ updateParts.visibleEndIdx }}]
      </span>
    </div>

    <p class="notice">
      The scrollbar below belongs to a wrapping <code>div</code>, not the
      DynamicScroller. With <code>page-mode</code> the scroller virtualizes
      against that wrapper's clip box (issue #928).
    </p>

    <div
      ref="scrollParentRef"
      class="scroll-parent"
      data-testid="issue-928-scroll-parent"
    >
      <div class="inner">
        <DynamicScroller
          :items="items"
          :min-item-size="54"
          :emit-update="true"
          :page-mode="true"
          :scroll-parent="explicitScrollParent"
          class="scroller"
          @update="onUpdate"
        >
          <template #default="{ item, index, active }">
            <DynamicScrollerItem
              :item="item"
              :index="index"
              :active="active"
              :data-index="index"
              :size-dependencies="[item.message]"
              class="message"
            >
              <div class="text">
                {{ item.message }}
              </div>
              <div class="index">
                <span>#{{ index }}</span>
              </div>
            </DynamicScrollerItem>
          </template>
        </DynamicScroller>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-mode-demo {
  flex: auto 1 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toolbar {
  display: flex;
  gap: 16px;
  align-items: center;
  flex: auto 0 0;
}

.notice {
  padding: 0 4px;
  color: #666;
}

.scroll-parent {
  height: 300px;
  overflow: auto;
  border: 2px solid #42b983;
  border-radius: 4px;
}

.inner {
  padding: 8px;
}

.message {
  display: flex;
  min-height: 32px;
  padding: 12px;
  box-sizing: border-box;
  border-bottom: 1px solid #eef;
}

.text {
  flex: 1;
  max-width: 600px;
}

.index {
  flex: 0 0 80px;
  text-align: right;
  color: #999;
}
</style>
