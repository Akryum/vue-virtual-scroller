<template>
  <tr class="letter">
    <td class="index">
      {{item.index}}
    </td>
    <td>
      {{item.value}}
    </td>
  </tr>
</template>

<script>
export default {
  props: ['item'],
}
</script>
