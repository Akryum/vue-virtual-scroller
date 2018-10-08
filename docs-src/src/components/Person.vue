<template>
  <div class="tr person" @click="edit">
    <div class="td index">
      {{index}}
    </div>
    <div class="td">
      <div class="info">
        <img
          class="avatar"
          :src="item.value.avatar"
          :key="item.value.avatar"
        />
        <span>{{item.value.name}}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['item', 'index'],

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
