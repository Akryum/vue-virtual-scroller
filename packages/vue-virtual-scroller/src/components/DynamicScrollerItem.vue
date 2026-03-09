<script setup lang="ts">
import { h, ref } from 'vue'
import { useDynamicScrollerItem } from '../composables/useDynamicScrollerItem'

const props = withDefaults(defineProps<{
  item: unknown
  watchData?: boolean
  active: boolean
  index?: number
  sizeDependencies?: Record<string, unknown> | unknown[] | null
  emitResize?: boolean
  tag?: string
}>(), {
  watchData: false,
  index: undefined,
  sizeDependencies: null,
  emitResize: false,
  tag: 'div',
})

const emit = defineEmits<{
  resize: [id: string | number]
}>()

const el = ref<HTMLElement>()

useDynamicScrollerItem(
  props,
  el,
  {
    onResize: (id) => emit('resize', id),
  },
)

// Render
defineSlots()
</script>

<script lang="ts">
export default {
  render(this: any) {
    return h(this.$props.tag || 'div', { ref: 'el' }, this.$slots.default?.())
  },
}
</script>
