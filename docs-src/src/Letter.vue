<template>
  <tr class="letter" :class="{ big: big }" @click="toggle">
    <td class="index">
      {{item.index}}
    </td>
    <td class="value">
      {{item.value}}
    </td>
  </tr>
</template>

<script>
export default {
  props: ['item'],

  computed: {
    big () {
      return this.item.height === 200
    },
  },

  methods: {
    toggle () {
      this.item.height = this.big ? 42 : 200
    },
  },
}
</script>

<style scoped>
.letter.big {
  font-weight: normal;
  height: 200px;
}

.letter.big .value {
  font-size: 120px;
}
</style>
