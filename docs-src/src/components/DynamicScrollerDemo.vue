<template>
  <div class="dynamic-scroller-demo">
    <div class="toolbar">
      <label>
        <input v-model="showMessageBeforeItems" type="checkbox" /> show message before items
      </label>
      <span>({{updateParts.viewStartIdx}} - [{{updateParts.visibleStartIdx}} - {{updateParts.visibleEndIdx}}] - {{updateParts.viewEndIdx}})</span>
    </div>

    <DynamicScroller
      :items="items"
      :min-item-height="54"
      :emit-update="true"
      @update="onUpdate"
      class="scroller"
    >
      <div slot="before-container" class="notice" v-if="showMessageBeforeItems">
        The message heights are unknown.
      </div>

      <template slot-scope="{ item, index, active }">
        <DynamicScrollerItem
          :item="item"
          :active="active"
          :size-dependencies="[
            item.message,
          ]"
          :data-index="index"
          :data-active="active"
          :title="`Click to change message ${index}`"
          class="message"
          @click.native="changeMessage(item)"
        >
          <div class="avatar">
            <img
              :src="item.avatar"
              :key="item.avatar"
              alt="avatar"
              class="image"
            >
          </div>
          <div class="text">
            {{ index }}
            {{ item.message }}
          </div>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
  </div>
</template>

<script>
import { generateMessage } from '../data'

const items = []
for (let i = 0; i < 10000; i++) {
  items.push({
    id: i,
    ...generateMessage(),
  })
}

export default {
  data () {
    return {
      items,
      updateParts: { viewStartIdx: 0, viewEndIdx: 0, visibleStartIdx: 0, visibleEndIdx: 0 },
      showMessageBeforeItems: true,
    }
  },

  methods: {
    changeMessage (message) {
      Object.assign(message, generateMessage())
    },

    onUpdate (viewStartIndex, viewEndIndex, visibleStartIndex, visibleEndIndex) {
      this.updateParts.viewStartIdx = viewStartIndex;
      this.updateParts.viewEndIdx = viewEndIndex;
      this.updateParts.visibleStartIdx = visibleStartIndex;
      this.updateParts.visibleEndIdx = visibleEndIndex;
    },
  },
}
</script>

<style scoped>
.dynamic-scroller-demo,
.scroller {
  height: 100%;
}

.dynamic-scroller-demo {
  overflow: hidden;
}

.scroller {
  border: solid 1px #42b983;
}

.toolbar {
  flex: auto 0 0;
  text-align: center;
}

.toolbar > *:not(:last-child) {
  margin-right: 24px;
}

.notice {
  padding: 24px;
  font-size: 20px;
  color: #999;
}

.message {
  display: flex;
  min-height: 32px;
  padding: 12px;
  box-sizing: border-box;
  max-width: 400px;
}

.avatar {
  flex: auto 0 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 12px;
}

.avatar .image {
  max-width: 100%;
  max-height: 100%;
  border-radius: 50%;
}

.text {
  flex: 1;
}
</style>
