<template>
  <div class="letter"><span class="index">{{item.index}}</span> {{item.value}}</div>
</template>

<script>
export default {
  props: ['item'],
}
</script>
