<template>
  <div
    class="recycle-scroller-demo"
    :class="{
      'page-mode': pageMode,
      'full-page': pageModeFullPage,
    }"
  >
    <div class="toolbar">
      <span>
        <input
          v-model="countInput"
          type="number"
          min="0"
          max="500000"
        > items
        <button @click="addItem()">+1</button>
      </span>
      <label>
        <input
          v-model="enableLetters"
          type="checkbox"
        > variable height
      </label>
      <label>
        <input
          v-model="pageMode"
          type="checkbox"
        > page mode
      </label>
      <label v-if="pageMode">
        <input
          v-model="pageModeFullPage"
          type="checkbox"
        > full page
      </label>
      <span>
        <input
          v-model.number="buffer"
          type="number"
          min="1"
          max="500000"
        > buffer
      </span>
      <span>
        <button @mousedown="renderScroller = !renderScroller">Toggle render</button>
        <button @mousedown="showScroller = !showScroller">Toggle visibility</button>
      </span>
    </div>

    <div
      v-if="renderScroller"
      v-show="showScroller"
      class="content"
    >
      <div class="wrapper">
        <RecycleScroller
          :key="pageModeFullPage"
          ref="scroller"
          class="scroller"
          :items="list"
          :item-size="itemHeight"
          :buffer="buffer"
          :page-mode="pageMode"
          key-field="id"
          size-field="height"
          @visible="onVisible"
          @hidden="onHidden"
        >
          <template v-slot="props">
            <div
              v-if="props.item.type === 'letter'"
              class="tr letter big"
              @click="props.item.height = (props.item.height === 200 ? 300 : 200)"
            >
              <div class="td index">
                {{ props.index }}
              </div>
              <div class="td value">
                {{ props.item.value }} Scoped
              </div>
            </div>
            <Person
              v-if="props.item.type === 'person'"
              :item="props.item"
              :index="props.index"
            />
          </template>
        </RecycleScroller>
      </div>
    </div>
  </div>
</template>

<script>
import { getData, addItem } from '../data'

import Person from './Person.vue'

export default {
  components: {
    Person,
  },

  data: () => ({
    items: [],
    count: 10000,
    renderScroller: true,
    showScroller: true,
    scopedSlots: false,
    buffer: 200,
    poolSize: 2000,
    enableLetters: true,
    pageMode: false,
    pageModeFullPage: true,
  }),

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

  watch: {
    count () {
      this.generateItems()
    },
    enableLetters () {
      this.generateItems()
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

    onVisible () {
      console.log('visible')
    },

    onHidden () {
      console.log('hidden')
    },
  },
}
</script>

<style scoped>
.recycle-scroller-demo:not(.page-mode) {
  height: 100%;
}

.recycle-scroller-demo.page-mode:not(.full-page) {
  height: 100%;
}

.recycle-scroller-demo.page-mode {
  flex: auto 0 0;
}

.recycle-scroller-demo.page-mode .toolbar {
  border-bottom: solid 1px #e0edfa;
}

.content {
  flex: 100% 1 1;
  border: solid 1px #42b983;
  position: relative;
}

.recycle-scroller-demo.page-mode:not(.full-page) .content {
  overflow: auto;
}

.recycle-scroller-demo:not(.page-mode) .wrapper {
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

.letter {
  text-transform: uppercase;
  color: grey;
  font-weight: bold;
}

.letter .td {
  padding: 12px;
}

.letter.big {
  font-weight: normal;
  height: 200px;
}

.letter.big .value {
  font-size: 120px;
}
</style>
