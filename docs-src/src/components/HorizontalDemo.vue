<template>
  <div class="dynamic-scroller-demo">
    <div class="toolbar">
      <input
        v-model="search"
        placeholder="Filter..."
      >
    </div>

    <DynamicScroller
      :items="filteredItems"
      :min-item-size="54"
      direction="horizontal"
      class="scroller"
    >
      <template #before>
        <div
          v-if="!dismissInfo"
          class="notice"
        >
          <div>The message widths are unknown.</div>
          <div>Scroll to the left ➡️</div>
          <div><button @click="dismissInfo = true">OK</button></div>
        </div>
      </template>

      <template v-slot="{ item, index, active }">
        <DynamicScrollerItem
          :item="item"
          :active="active"
          :size-dependencies="[
            item.message,
          ]"
          :data-index="index"
          :data-active="active"
          :title="`Click to change message ${index}`"
          :style="{
            width: `${Math.max(130, Math.round(item.message.length / 20 * 20))}px`,
          }"
          class="message"
          @click.native="changeMessage(item)"
        >
          <div class="avatar">
            <img
              :key="item.avatar"
              :src="item.avatar"
              alt="avatar"
              class="image"
            >
          </div>
          <div class="text">
            {{ item.message }}
          </div>
          <div class="index">
            <span>{{ item.id }} (id)</span>
            <span>{{ index }} (index)</span>
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
      search: '',
      dismissInfo: false,
    }
  },

  computed: {
    filteredItems () {
      const { search, items } = this
      if (!search) return items
      const lowerCaseSearch = search.toLowerCase()
      return items.filter(i => i.message.toLowerCase().includes(lowerCaseSearch))
    },
  },

  methods: {
    changeMessage (message) {
      Object.assign(message, generateMessage())
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

.notice {
  padding: 24px;
  font-size: 20px;
  color: #999;
}

.message {
  display: flex;
  flex-direction: column;
  min-height: 32px;
  padding: 12px;
  box-sizing: border-box;
}

.avatar {
  flex: auto 0 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-bottom: 12px;
}

.avatar .image {
  max-width: 100%;
  max-height: 100%;
  border-radius: 50%;
}

.index,
.text {
  flex: 1;
}

.text {
  margin-bottom: 12px;
}

.index {
  opacity: .5;
}

.index span {
  display: block;
}
</style>
