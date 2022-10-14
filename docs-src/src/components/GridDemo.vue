<script>
import { getData } from '../data'

export default {
  data () {
    return {
      list: [],
      gridItems: 6,
      scrollTo: 500,
    }
  },

  mounted () {
    this.list = getData(5000)
  },
}
</script>

<template>
  <div class="wrapper">
    <div class="toolbar">
      <label>
        Grid items per row
        <input
          v-model.number="gridItems"
          type="number"
          min="2"
          max="20"
        >
      </label>
      <input
        v-model.number="gridItems"
        type="range"
        min="2"
        max="20"
      >
      <span>
        <button @mousedown="$refs.scroller.scrollToItem(scrollTo)">Scroll To: </button>
        <input
          v-model.number="scrollTo"
          type="number"
          min="0"
          :max="list.length - 1"
        >
      </span>
    </div>

    <RecycleScroller
      ref="scroller"
      class="scroller"
      :items="list"
      :item-size="128"
      :grid-items="gridItems"
    >
      <template #default="{ item, index }">
        <div class="item">
          <img
            :key="item.id"
            :src="item.value.avatar"
          >
          <div class="index">
            {{ index }}
          </div>
        </div>
      </template>
    </RecycleScroller>
  </div>
</template>

<style scoped>
.wrapper,
.scroller {
  height: 100%;
}

.wrapper {
  display: flex;
  flex-direction: column;
}

.toolbar {
  flex: none;
}

.scroller {
  flex: 1;
}

.scroller >>> .hover img {
  opacity: 0.5;
}

.item {
  position: relative;
}

.index {
  position: absolute;
  top: 2px;
  left: 2px;
  padding: 4px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.85);
  color: black;
}

img {
  width: 100%;
  height: 100%;
  background: #eee;
}
</style>
