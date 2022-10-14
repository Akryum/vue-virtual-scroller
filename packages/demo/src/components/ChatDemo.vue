<template>
  <div class="chat-demo">
    <div class="toolbar">
      <button
        v-if="!streaming"
        @click="startStream()"
      >
        Start stream
      </button>
      <button
        v-else
        @click="stopStream()"
      >
        Stop stream
      </button>

      <input
        v-model="search"
        placeholder="Filter..."
      >
    </div>

    <DynamicScroller
      ref="scroller"
      :items="filteredItems"
      :min-item-size="54"
      class="scroller"
    >
      <template #before>
        <div class="notice">
          The message heights are unknown.
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

let id = 0

const messages = []
for (let i = 0; i < 10000; i++) {
  messages.push(generateMessage())
}

export default {
  data () {
    return {
      items: [],
      search: '',
      streaming: false,
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

  destroyed () {
    this.stopStream()
  },

  methods: {
    changeMessage (message) {
      Object.assign(message, generateMessage())
    },

    addMessage () {
      for (let i = 0; i < 10; i++) {
        this.items.push({
          id: id++,
          ...messages[id % 10000],
        })
      }
      this.scrollToBottom()

      if (this.streaming) {
        requestAnimationFrame(this.addMessage)
      }
    },

    scrollToBottom () {
      this.$refs.scroller.scrollToBottom()
    },

    startStream () {
      if (this.streaming) return
      this.streaming = true
      this.addMessage()
    },

    stopStream () {
      this.streaming = false
    },
  },
}
</script>

<style scoped>
.chat-demo,
.scroller {
  height: 100%;
}

.chat-demo {
  overflow: hidden;
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

.index,
.text {
  flex: 1;
}

.text {
  max-width: 400px;
}

.index {
  opacity: .5;
}

.index span {
  display: inline-block;
  width: 160px;
  text-align: right;
}
</style>
