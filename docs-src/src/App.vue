<template>
  <div id="app">
    <div class="counter">
      <span>
        <input v-model="countInput" type="number" min="0" max="500000" /> items
      </span>
      <span v-if="generateTime !== null">
        Items generation: {{ generateTime }} ms
      </span>
      <span v-if="updateTime !== null">
        Virtual scroller update: {{ updateTime }} ms
      </span>
      <span>
        <button @mousedown="showScroller = !showScroller">Toggle scroller</button>
      </span>
    </div>
    <div class="content" v-if="showScroller">
      <div class="wrapper">
        <virtual-scroller class="scroller" :items="items" :renderers="renderers" item-height="42" type-field="type" key-field="index" main-tag="section" content-tag="table"></virtual-scroller>
      </div>
    </div>
  </div>
</template>

<script>
import { getData } from './data.js'

import Letter from './Letter.vue'
import Item from './Item.vue'

const renderers = {
  letter: Letter,
  person: Item,
}

export default {
  data: () => ({
    items: [],
    renderers,
    count: 10000,
    generateTime: null,
    updateTime: null,
    showScroller: true,
  }),

  watch: {
    count () {
      this.generateItems()
    },
  },

  computed: {
    countInput: {
      get () {
        return this.count
      },
      set (val) {
        if (val > 500000) {
          val = 500000
        } else if (val < 0) {
          val = 0
        }
        this.count = val
      },
    },
  },

  methods: {
    generateItems () {
      console.log('Generating ' + this.count + ' items...')
      let time = Date.now()
      const items = Object.freeze(getData(this.count))
      this._time = Date.now()
      this.generateTime = this._time - time
      console.log('Generated ' + items.length + ' in ' + this.generateTime + 'ms')
      this._dirty = true
      this.items = items
    },
  },

  updated () {
    if (this._dirty) {
      const time = Date.now()
      this.updateTime = time - this._time
      console.log('update', this.updateTime, 'ms')
      this._dirty = false
    }
  },

  mounted () {
    this.$nextTick(this.generateItems)
  },
}
</script>

<style>
html,
body,
#app {
  height: 100%;
  box-sizing: border-box;
}

body {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 0;
}

#app {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 12px;
}

.counter {
  flex: auto 0 0;
  text-align: center;
  margin-bottom: 12px;
}

.counter > span:not(:last-child) {
  margin-right: 24px;
}

.content {
  flex: 100% 1 1;
  border: solid 1px #42b983;
  position: relative;
}

.wrapper {
  overflow: hidden;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.scroller {
  width: 100%;
  height: 100%;
}

.item-container {
  box-sizing: border-box;
}

.item {
  height: 42px;
  box-sizing: border-box;
  cursor: pointer;
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
}

.item:hover {
  background: #4fc08d;
  color: white;
}

.letter {
  text-transform: uppercase;
  color: grey;
  font-weight: bold;
}

.index {
  color: rgba(0, 0, 0, 0.2);
  width: 55px;
  text-align: right;
}

table {
  border-collapse: collapse;
}

td {
  padding: 12px;
}
</style>
