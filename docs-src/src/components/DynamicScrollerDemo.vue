<template>
  <div class="dynamic-scroller-demo">
    <DynamicScroller
      :items="items"
      :min-item-height="54"
      class="scroller"
    >
      <div slot="before-container" class="notice">
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
    }
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
