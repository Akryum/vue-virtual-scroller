<template>
  <tr class="person" @click="edit">
    <td class="index">
      {{item.index}}
    </td>
    <td>
      {{item.value.name}}
    </td>
  </tr>
</template>

<script>
export default {
  props: ['item'],
  methods: {
    edit () {
      this.item.value.name += '#'
    },
  },
  /* beforeCreate () {
    let d = 0
    for (let i = 0; i < 9999999; i++) {
      d++
    }
    return d
  }, */
}
</script>
