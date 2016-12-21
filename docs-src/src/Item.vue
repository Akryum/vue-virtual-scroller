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
}
</script>
