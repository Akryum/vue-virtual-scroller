import { createApp, defineComponent, h, ref } from 'vue'
import DynamicPipelinePanel from './DynamicPipelinePanel.vue'
import MeasurementRoundtrip from './MeasurementRoundtrip.vue'
import 'vue-virtual-scroller/index.css'

/** Browser fixture uses two independent real production library owners. */
const roundtrip = new URLSearchParams(location.search).get('roundtrip')
createApp(roundtrip
  ? defineComponent({ setup: () => () => h(MeasurementRoundtrip, { mode: roundtrip }) })
  : defineComponent({
      setup() {
        const first = ref<InstanceType<typeof DynamicPipelinePanel>>()
        const second = ref<InstanceType<typeof DynamicPipelinePanel>>()
        const showFirst = ref(true)
        Object.assign(window, {
          dynamicPipeline: {
            first: () => first.value,
            second: () => second.value,
            removeFirst: () => { showFirst.value = false },
          },
        })
        return () => h('main', { style: 'display:flex;gap:24px' }, [
          showFirst.value ? h(DynamicPipelinePanel, { name: 'first', ref: first }) : null,
          h(DynamicPipelinePanel, { name: 'second', ref: second }),
        ])
      },
    })).mount('#app')
