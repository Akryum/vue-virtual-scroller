<script setup lang="ts">
import { computed, ref } from 'vue'
import DynamicScroller from '../../../../packages/vue-virtual-scroller/src/components/DynamicScroller.vue'
import DynamicScrollerItem from '../../../../packages/vue-virtual-scroller/src/components/DynamicScrollerItem.vue'
import { avatarStyle, createMessages } from './demo-data'
import DemoShell from './DemoShell.vue'

/**
 * Issue #928 reproduction: a DynamicScroller in `page-mode` nested inside a
 * scrollable `<div>` parent. Either the auto-detected ancestor or an
 * explicit `scrollParent` prop drives virtualization against that inner
 * 300px clip box rather than the browser window height.
 */
const items = ref(createMessages(2500))
const useExplicitScrollParent = ref(false)
const scrollParentEl = ref<HTMLElement | null>(null)

const explicitScrollParent = computed(() => (useExplicitScrollParent.value ? scrollParentEl.value ?? undefined : undefined))

const visibleStart = ref(0)
const visibleEnd = ref(0)

function onUpdate(_viewStart: number, _viewEnd: number, start: number, end: number) {
  visibleStart.value = start
  visibleEnd.value = end
}
</script>

<template>
  <DemoShell
    demo-id="page-mode-div-parent"
    title="page-mode with a div scroll-parent"
    description="DynamicScroller with page-mode nested inside an overflow:auto div. Virtualization clips to the parent div (issue #928)."
  >
    <template #toolbar>
      <label class="demo-chip">
        Use explicit scrollParent prop
        <input
          v-model="useExplicitScrollParent"
          data-testid="demo:control:use-explicit"
          type="checkbox"
        >
      </label>
      <span
        class="demo-chip"
        data-testid="demo:metric:visible-range"
      >Visible rows: {{ visibleStart }}-{{ visibleEnd }}</span>
    </template>

    <div
      ref="scrollParentEl"
      class="demo-page-mode-parent"
      data-testid="demo:viewport"
    >
      <div class="demo-page-mode-inner">
        <DynamicScroller
          :items="items"
          :min-item-size="54"
          :page-mode="true"
          :scroll-parent="explicitScrollParent"
          :emit-update="true"
          key-field="id"
          data-testid="demo:scroller"
          @update="onUpdate"
        >
          <template #default="{ item, index, active }">
            <DynamicScrollerItem
              :item="item"
              :index="index"
              :active="active"
              :size-dependencies="[item.message]"
              class="demo-page-mode-row"
              data-testid="demo:row"
              :data-row-id="String(item.id)"
            >
              <div
                class="demo-avatar"
                :style="avatarStyle(item.hue)"
              >
                {{ item.initials }}
              </div>
              <div class="demo-page-mode-copy">
                <div class="demo-page-mode-name">
                  {{ item.user }}
                </div>
                <div class="demo-page-mode-preview">
                  {{ item.message }}
                </div>
              </div>
              <div class="demo-page-mode-meta">
                <small>{{ item.timestamp }}</small>
                <strong>#{{ index + 1 }}</strong>
              </div>
            </DynamicScrollerItem>
          </template>
        </DynamicScroller>
      </div>
    </div>
  </DemoShell>
</template>

<style scoped>
.demo-page-mode-parent {
  height: 300px;
  overflow: auto;
  border: 2px solid #42b983;
  border-radius: 4px;
}

.demo-page-mode-inner {
  padding: 8px;
}

.demo-page-mode-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid #eef;
  min-height: 32px;
  box-sizing: border-box;
}

.demo-avatar {
  flex: 0 0 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
}

.demo-page-mode-copy {
  flex: 1;
  min-width: 0;
}

.demo-page-mode-name {
  font-weight: 600;
}

.demo-page-mode-preview {
  color: #555;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.demo-page-mode-meta {
  flex: 0 0 80px;
  text-align: right;
  color: #999;
  font-size: 0.85em;
}
</style>
