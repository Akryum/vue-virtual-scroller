<template>
  <div class="person" @click="edit">({{item.index}}) {{item.value.name}}</div>
</template>

<script>
export default {
  props: ['item'],
  methods: {
    edit () {
      this.item.value.name += '*'
    },
  },
}
</script>
