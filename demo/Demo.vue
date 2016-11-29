<template>
  <div class="demo">
    <virtual-scroller :items="items" :renderers="renderers" item-height="22"></virtual-scroller>
  </div>
</template>

<script>
import { getData } from './data.js'

const count = 100000
console.log('Generating ' + count + ' items...')
let time = new Date().getTime()
let time2
const items = Object.freeze(getData(count))
console.log('Generated ' + items.length + ' in ' + ((time2 = new Date().getTime()) - time))

import Letter from './Letter.vue'
import Item from './Item.vue'

const renderers = {
  letter: Letter,
  person: Item,
}

export default {
  data: () => ({
    items,
    renderers,
  }),
  mounted () {
    console.log('app ready', new Date().getTime() - time2)
  },
}
</script>

<style>
body {
  font-family: sans-serif;
}

.virtual-scroller {
  overflow: auto;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.item-container {
  box-sizing: border-box;
}

.item {
  height: 22px;
  padding: 2px 12px;
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
}
</style>
