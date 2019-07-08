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
      <button @click="addItems(50)">
        Add 50 items
      </button>
    </div>

    <DynamicScroller
      ref="scroller"
      :items="items"
      :min-item-size="24"
      class="scroller"
      @resize="scrollToBottom()"
    >
      <DynamicScrollerItem
        slot-scope="{ item, index, active }"
        :item="item"
        :active="active"
        :data-index="index"
      >
        <div class="message">
          {{ item.text }}
        </div>
      </DynamicScrollerItem>
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
          text: faker.lorem.lines(),
          id: this.items.length + 1,
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

.scroller {
  height: 500px;
  border: 2px solid #ddd;
}

.message {
  padding: 10px 10px 9px;
  border-bottom: solid 1px #eee;
}
</style>
