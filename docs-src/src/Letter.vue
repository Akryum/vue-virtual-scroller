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
