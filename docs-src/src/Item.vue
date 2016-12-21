<template>
  <div class="person" @click="edit"><span class="index">{{item.index}}</span> {{item.value.name}}</div>
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
