<template>
  <div
    id="app"
    :class="{
      'page-mode': pageMode,
      'full-page': pageModeFullPage,
    }"
  >
    <div class="toolbar">
      <span>
        <input v-model="countInput" type="number" min="0" max="500000" /> items
        <button @click="addItem()">+1</button>
      </span>
      <label>
        <input v-model="enableLetters" type="checkbox" /> variable height
      </label>
      <label>
        <input v-model="pageMode" type="checkbox" /> page mode
      </label>
      <label v-if="pageMode">
        <input v-model="pageModeFullPage" type="checkbox" /> full page
      </label>
      <span>
        <input v-model.number="buffer" type="number" min="1" max="500000" /> buffer
      </span>
      <span v-if="!recycleList">
        <input v-model.number="poolSize" type="number" min="1" max="500000" /> poolSize
      </span>
      <span>
        <button @mousedown="showScroller = !showScroller">Toggle scroller</button>
        <label v-if="!recycleList"><input type="checkbox" v-model="scopedSlots" :disabled="recycleList" /> Scoped slots</label>
        <label><input type="checkbox" v-model="recycleList" /> Use recycle list</label>
      </span>
    </div>

    <div class="content" v-if="showScroller">
      <div class="wrapper">
        <template v-if="!recycleList">
          <!-- Scoped slots -->
          <virtual-scroller
            v-if="scopedSlots"
            :key="pageModeFullPage"
            class="scroller"
            :item-height="itemHeight"
            :items="list"
            main-tag="section"
            content-tag="table"
            :buffer="buffer"
            :pool-size="poolSize"
            emit-update
            @update="onUpdate"
          >
            <template slot-scope="props">
              <!-- <letter v-if="props.item.type === 'letter'" :item="props.item"></letter>-->
              <tr v-if="props.item.type === 'letter'" class="letter" :key="props.itemKey">
                <td class="index">
                  {{props.item.index}}
                </td>
                <td>
                  {{props.item.value}} Scoped
                </td>
              </tr>
              <item v-if="props.item.type === 'person'" :item="props.item" :key="props.itemKey"></item>
            </template>
          </virtual-scroller>

          <!-- Renderers -->
          <virtual-scroller
            v-else
            :key="pageModeFullPage"
            class="scroller"
            :item-height="itemHeight"
            :items="list"
            :renderers="renderers"
            type-field="type"
            key-field="id"
            main-tag="section"
            content-tag="table"
            :buffer="buffer"
            :pool-size="poolSize"
            :page-mode="pageMode"
          />
        </template>

        <template v-else>
          <recycle-list
            :key="pageModeFullPage"
            ref="scroller"
            class="scroller"
            :items="list"
            :item-height="itemHeight"
            :buffer="buffer"
            :page-mode="pageMode"
            key-field="id"
          >
            <template slot-scope="props">
              <tr
                v-if="props.item.type === 'letter'"
                class="letter big"
                @click="props.item.height = (props.item.height === 200 ? 300 : 200)"
              >
                <td class="index">
                  {{props.index}}
                </td>
                <td class="value">
                  {{props.item.value}} Scoped
                </td>
              </tr>
              <item v-if="props.item.type === 'person'" :item="props.item" :index="props.index"></item>
            </template>
          </recycle-list>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { getData, addItem } from './data.js'

import Letter from './Letter.vue'
import Item from './Item.vue'

const renderers = {
  letter: Letter,
  person: Item,
}

export default {
  components: {
    Letter,
    Item,
  },

  data: () => ({
    items: [],
    renderers,
    count: 10000,
    showScroller: true,
    scopedSlots: false,
    buffer: 200,
    poolSize: 2000,
    enableLetters: true,
    pageMode: false,
    pageModeFullPage: true,
    recycleList: true,
  }),

  watch: {
    count () {
      this.generateItems()
    },
    enableLetters () {
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

    itemHeight () {
      return this.enableLetters ? null : 50
    },

    list () {
      return this.items.map(
        item => Object.assign({}, {
          random: Math.random(),
        }, item)
      )
    },
  },

  mounted () {
    this.$nextTick(this.generateItems)
    window.scroller = this.$refs.scroller
  },

  methods: {
    generateItems () {
      console.log('Generating ' + this.count + ' items...')
      let time = Date.now()
      const items = getData(this.count, this.enableLetters)
      console.log('Generated ' + items.length + ' in ' + (Date.now() - time) + 'ms')
      this._dirty = true
      this.items = items
    },

    addItem () {
      addItem(this.items)
    },

    onUpdate (startIndex, endIndex) {
      this.updateCount++
    },
  },
}
</script>

<style>
html,
body,
#app {
  box-sizing: border-box;
}

html,
body {
  height: 100%;
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

#app:not(.page-mode) {
  height: 100%;
}

#app.page-mode:not(.full-page) {
  height: 100%;
}

.toolbar {
  flex: auto 0 0;
  text-align: center;
  margin-bottom: 12px;
  line-height: 32px;
  position: sticky;
  top: 0;
  z-index: 9999;
  background: white;
}

#app.page-mode .toolbar {
  border-bottom: solid 1px #e0edfa;
}

.toolbar > *:not(:last-child) {
  margin-right: 24px;
}

.content {
  flex: 100% 1 1;
  border: solid 1px #42b983;
  position: relative;
}

#app.page-mode:not(.full-page) .content {
  overflow: auto;
}

#app:not(.page-mode) .wrapper {
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

.item-container,
.item-wrapper {
  box-sizing: border-box;
}

.item,
.item-view {
  cursor: pointer;
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
}

.item {
  height: 50px;
}

tr, td {
  box-sizing: border-box;
}

.item-view tr {
  display: flex;
  align-items: center;
}

.item-view td {
  display: block;
}

.item:hover,
.item-view:hover {
  background: #4fc08d;
  color: white;
}

.letter {
  text-transform: uppercase;
  color: grey;
  font-weight: bold;
}

.letter td {
  padding: 12px;
}

.item .letter td {
  height: 200px;
}

.letter.big {
  font-weight: normal;
  height: 200px;
}

.letter.big .value {
  font-size: 120px;
}

.index {
  color: rgba(0, 0, 0, 0.2);
  width: 55px;
  text-align: right;
  flex: auto 0 0;
}

table {
  border-collapse: collapse;
}

.person td:first-child {
  padding: 12px;
}

.person .info {
  display: flex;
  align-items: center;
  height: 48px;
}

.avatar {
  width: 50px;
  height: 50px;
  margin-right: 12px;
  background: grey;
}
</style>
