<template>
  <div class="hello">
    <div>
      <button @click="addItems()">
        Add item
      </button>
      <button @click="addItems(5)">
        Add 5 items
      </button>
      <button @click="addItems(10)">
        Add 10 items
      </button>
    </div>

    <DynamicScroller
      ref="scroller"
      :items="items"
      :min-item-size="24"
      class="scroller"
      @resize="scrollToBottom()"
    >
      <template #default="{ item, index, active }">
        <DynamicScrollerItem
          :item="item"
          :active="active"
          :data-index="index"
        >
          <div
            class="message"
            :style="{
              height: `${item.size}px`,
            }"
          >
            {{ item.text }}
          </div>
        </DynamicScrollerItem>
      </template>
    </DynamicScroller>
  </div>
</template>

<script>
import faker from 'faker'

export default {
  name: 'TestChat',

  data () {
    return {
      items: [],
    }
  },

  methods: {
    addItems (count = 1) {
      for (let i = 0; i < count; i++) {
        this.items.push({
          text: faker.lorem.sentence(),
          id: this.items.length + 1,
          size: Math.random() * 120 + 40,
        })
      }
      this.scrollToBottom()
    },

    scrollToBottom () {
      this.$refs.scroller.scrollToBottom()
    },
  },
}
</script>

<style scoped>
.hello {
  flex: 0 1 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.scroller {
  flex: auto 1 1;
  border: 2px solid #ddd;
}

h1,
h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

.message {
  padding: 10px 10px 9px;
  border-bottom: solid 1px #eee;
}
</style>
