<template>
  <tr class="letter">
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
}
</script>
