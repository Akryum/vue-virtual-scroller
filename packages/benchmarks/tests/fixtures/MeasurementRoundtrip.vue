<script setup lang="ts">
import { defineComponent, h, nextTick, onMounted, reactive, ref } from 'vue'
import { useDynamicScroller, useDynamicScrollerItem } from 'vue-virtual-scroller'

/** Native fallback fixture preserves normal owner/item lifecycle and measurement queue. */
const props = defineProps<{ mode: string }>()
const container = ref<HTMLElement>()
const state = useDynamicScroller({
  items: [{ id: 'alpha' }, { id: 'tail' }],
  keyField: 'id',
  minItemSize: 20,
  el: container,
})
let rowElement: HTMLElement | undefined
const height = ref(73)
const options = reactive({ item: { id: 'alpha' }, watchData: false, active: true, emitResize: false })
let requestMeasurement: (() => void) | undefined

/** Rebind after the public item mount queues its first native layout read. */
const Row = defineComponent({
  setup() {
    const element = ref<HTMLElement>()
    requestMeasurement = useDynamicScrollerItem(options, element).updateSize
    onMounted(() => {
      rowElement = element.value
      if (props.mode === 'delayed')
        options.active = false
      if (props.mode === 'active') {
        options.active = false
        options.active = true
      }
      if (props.mode === 'id') {
        options.item = { id: 'beta' }
        options.item = { id: 'alpha' }
      }
    })
    return () => h('div', { ref: element, style: { height: `${height.value}px`, width: '120px' } }, 'Measured row')
  },
})

Object.assign(window, {
  /** Application activation after the initial queue has already drained. */
  measurementActivate: () => { options.active = true },
  /** Keep an existing size while a legitimate new measurement is pending. */
  measurementPauseUpdate: async () => {
    height.value = 91
    await nextTick()
    requestMeasurement?.()
    options.active = false
  },
  measurementRoundtrip: () => ({
    size: state.getItemSize({ id: 'alpha' }),
    offset: state.getItemOffset(1),
    nativeHeight: rowElement?.offsetHeight,
  }),
})
</script>

<template>
  <div ref="container" style="height: 100px; overflow: auto">
    <Row />
  </div>
</template>
