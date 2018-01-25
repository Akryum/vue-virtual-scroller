<template>
  <tr class="person" @click="edit">
    <td class="index">
      {{item.index}}
    </td>
    <td>
      <div class="info">
        <img
          class="avatar"
          :src="item.value.avatar"
          :key="item.value.avatar"
        />
        <span>{{item.value.name}}</span>
      </div>
    </td>
  </tr>
</template>

<script>
export default {
  props: ['item'],

  created () {
    console.log('created')
  },

  destroyed () {
    console.log('destroyed')
  },

  methods: {
    edit () {
      this.item.value.name += '#'
    },
  },
}
</script>
