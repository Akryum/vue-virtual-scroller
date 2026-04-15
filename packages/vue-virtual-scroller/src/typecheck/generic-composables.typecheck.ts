/* eslint-disable ts/no-unused-expressions */

import type { MaybeRefOrGetter } from 'vue'
import type { UseDynamicScrollerOptions } from '../composables/useDynamicScroller'
import type { UseRecycleScrollerOptions } from '../composables/useRecycleScroller'
import type { UseWindowScrollerOptions } from '../composables/useWindowScroller'
import { ref } from 'vue'
import { useDynamicScroller, useDynamicScrollerItem, useRecycleScroller, useWindowScroller } from '../index'

interface Message {
  id: string
  text: string
  size: number
}

interface CompositeMessage extends Message {
  scopeId: string
}

const messages: Message[] = [
  {
    id: 'alpha',
    text: 'Hello',
    size: 32,
  },
]

const scrollerEl = ref<HTMLElement>()
const functionKeyField = (item: Message, index: number) => `${item.id}:${index}`
const compositeKeyField = (item: CompositeMessage) => `${item.scopeId}:${item.id}`
const functionItemSize = (item: Message) => item.size

const recycleScroller = useRecycleScroller<Message>({
  items: messages,
  el: scrollerEl,
  keyField: 'id',
  direction: 'vertical',
  itemSize: null,
  minItemSize: 32,
  sizeField: 'size',
  typeField: 'type',
  buffer: 200,
  pageMode: false,
  shift: false,
  disableTransform: true,
  hiddenPosition: -100,
  prerender: 0,
  emitUpdate: false,
  updateInterval: 0,
}, scrollerEl)

const recycleScrollerWithDefaultDirection = useRecycleScroller<Message>({
  items: messages,
  keyField: 'id',
  itemSize: 32,
  minItemSize: 32,
  typeField: 'type',
  buffer: 200,
  pageMode: false,
  shift: false,
  disableTransform: true,
  prerender: 0,
  emitUpdate: false,
  updateInterval: 0,
}, scrollerEl)

recycleScroller.pool.value[0]?.item.text
recycleScroller.getViewStyle(recycleScroller.pool.value[0]!)
recycleScrollerWithDefaultDirection.getScroll()

// @ts-expect-error Message items should not expose missing properties.
recycleScroller.pool.value[0]?.item.missing

const functionKeyRecycleScroller = useRecycleScroller<Message, typeof functionKeyField>({
  items: messages,
  keyField: functionKeyField,
  direction: 'vertical',
  itemSize: 32,
  minItemSize: 32,
  typeField: 'type',
  buffer: 200,
  pageMode: false,
  shift: false,
  disableTransform: true,
  hiddenPosition: -100,
  prerender: 0,
  emitUpdate: false,
  updateInterval: 0,
}, scrollerEl)

functionKeyRecycleScroller.pool.value[0]?.nr.key

const nestedRefRecycleScroller = useRecycleScroller<Message>({
  items: ref(messages),
  el: scrollerEl,
  keyField: 'id',
  direction: 'vertical',
  itemSize: 32,
  minItemSize: 32,
  typeField: 'type',
  buffer: 200,
  pageMode: false,
  shift: false,
  disableTransform: true,
  prerender: 0,
  emitUpdate: false,
  updateInterval: 0,
})

nestedRefRecycleScroller.pool.value[0]?.item.text

const functionItemSizeRecycleScroller = useRecycleScroller<Message>({
  items: messages,
  el: scrollerEl,
  keyField: 'id',
  direction: 'vertical',
  itemSize: functionItemSize,
  minItemSize: 32,
  typeField: 'type',
  buffer: 200,
  pageMode: false,
  shift: false,
  disableTransform: true,
  prerender: 0,
  emitUpdate: false,
  updateInterval: 0,
}, scrollerEl)

functionItemSizeRecycleScroller.getItemSize(0)

useRecycleScroller<Message>({
  items: messages,
  // @ts-expect-error Invalid object-item key fields should be rejected.
  keyField: 'missing',
  direction: 'vertical',
  itemSize: 32,
  minItemSize: 32,
  typeField: 'type',
  buffer: 200,
  pageMode: false,
  shift: false,
  disableTransform: true,
  prerender: 0,
  emitUpdate: false,
  updateInterval: 0,
}, scrollerEl)

useRecycleScroller<Message>({
  items: messages,
  keyField: 'id',
  direction: 'vertical',
  itemSize: null,
  minItemSize: 32,
  // @ts-expect-error Invalid object-item size fields should be rejected in variable-size mode.
  sizeField: 'missing',
  typeField: 'type',
  buffer: 200,
  pageMode: false,
  shift: false,
  disableTransform: true,
  prerender: 0,
  emitUpdate: false,
  updateInterval: 0,
}, scrollerEl)

useRecycleScroller<Message>({
  items: messages,
  keyField: 'id',
  direction: 'vertical',
  // @ts-expect-error Function itemSize should stay item-aware.
  itemSize: item => item.missing,
  minItemSize: 32,
  typeField: 'type',
  buffer: 200,
  pageMode: false,
  shift: false,
  disableTransform: true,
  prerender: 0,
  emitUpdate: false,
  updateInterval: 0,
}, scrollerEl)

const dynamicScroller = useDynamicScroller<Message>({
  items: messages,
  keyField: 'id',
  direction: 'vertical',
  minItemSize: 32,
  disableTransform: true,
  hiddenPosition: -100,
  el: scrollerEl,
})

const dynamicScrollerWithDefaultDirection = useDynamicScroller<Message>({
  items: messages,
  keyField: 'id',
  minItemSize: 32,
  disableTransform: true,
  hiddenPosition: -100,
  el: scrollerEl,
})

const functionKeyDynamicScroller = useDynamicScroller<Message, typeof functionKeyField>({
  items: messages,
  keyField: functionKeyField,
  direction: 'vertical',
  minItemSize: 32,
  disableTransform: true,
  hiddenPosition: -100,
  el: scrollerEl,
})

dynamicScroller.itemsWithSize.value[0]?.item.text
dynamicScroller.getItemSize(messages[0])
dynamicScroller.getViewStyle(dynamicScroller.pool.value[0]!)
dynamicScrollerWithDefaultDirection.measurementContext.direction.value
functionKeyDynamicScroller.itemsWithSize.value[0]?.id

function useWrappedDynamicScroller<TItem>(
  options: MaybeRefOrGetter<UseDynamicScrollerOptions<TItem>>,
) {
  return useDynamicScroller(options)
}

useWrappedDynamicScroller<CompositeMessage>(() => ({
  items: [
    {
      id: 'alpha',
      scopeId: 'thread-1',
      text: 'Hello',
      size: 32,
    },
  ],
  keyField: compositeKeyField,
  direction: 'vertical',
  minItemSize: 32,
  el: scrollerEl,
}))

function useWrappedRecycleScroller<TItem>(
  options: MaybeRefOrGetter<UseRecycleScrollerOptions<TItem>>,
) {
  return useRecycleScroller(options, scrollerEl)
}

useWrappedRecycleScroller<CompositeMessage>(() => ({
  items: [
    {
      id: 'alpha',
      scopeId: 'thread-1',
      text: 'Hello',
      size: 32,
    },
  ],
  keyField: compositeKeyField,
  direction: 'vertical',
  itemSize: 32,
  minItemSize: 32,
  typeField: 'type',
  buffer: 200,
  pageMode: false,
  shift: false,
  disableTransform: true,
  hiddenPosition: -100,
  prerender: 0,
  emitUpdate: false,
  updateInterval: 0,
}))

function useWrappedWindowScroller<TItem>(
  options: MaybeRefOrGetter<UseWindowScrollerOptions<TItem>>,
) {
  return useWindowScroller(options, scrollerEl)
}

useWrappedWindowScroller<CompositeMessage>(() => ({
  items: [
    {
      id: 'alpha',
      scopeId: 'thread-1',
      text: 'Hello',
      size: 32,
    },
  ],
  keyField: compositeKeyField,
  direction: 'vertical',
  itemSize: 32,
  minItemSize: 32,
  typeField: 'type',
  buffer: 200,
  shift: false,
  disableTransform: true,
  hiddenPosition: -100,
  prerender: 0,
  emitUpdate: false,
  updateInterval: 0,
}))

const windowScroller = useWindowScroller<Message>({
  items: messages,
  el: scrollerEl,
  keyField: 'id',
  direction: 'vertical',
  itemSize: 32,
  minItemSize: 32,
  typeField: 'type',
  buffer: 200,
  shift: false,
  disableTransform: true,
  hiddenPosition: -100,
  prerender: 0,
  emitUpdate: false,
  updateInterval: 0,
}, scrollerEl)

const windowScrollerWithDefaultDirection = useWindowScroller<Message>({
  items: messages,
  el: scrollerEl,
  keyField: 'id',
  itemSize: 32,
  minItemSize: 32,
  typeField: 'type',
  buffer: 200,
  shift: false,
  disableTransform: true,
  prerender: 0,
  emitUpdate: false,
  updateInterval: 0,
}, scrollerEl)

useWindowScroller<Message>({
  items: messages,
  el: scrollerEl,
  keyField: 'id',
  direction: 'vertical',
  itemSize: functionItemSize,
  minItemSize: 32,
  typeField: 'type',
  buffer: 200,
  shift: false,
  disableTransform: true,
  prerender: 0,
  emitUpdate: false,
  updateInterval: 0,
}, scrollerEl)

windowScroller.getViewStyle(windowScroller.pool.value[0]!)
windowScrollerWithDefaultDirection.getScroll()

// @ts-expect-error getItemSize should require the declared item type.
dynamicScroller.getItemSize({ id: 'beta', size: 40 })

useDynamicScrollerItem<Message>({
  item: messages[0],
  active: true,
  watchData: false,
  emitResize: false,
  el: scrollerEl,
})

useDynamicScrollerItem<Message>({
  item: messages[0],
  active: true,
  watchData: false,
  emitResize: false,
  el: scrollerEl,
  onResize: id => id,
})

useDynamicScrollerItem<Message>({
  // @ts-expect-error Dynamic item helpers should reject incompatible item shapes.
  item: { id: 'beta', size: 40 },
  active: true,
  watchData: false,
  emitResize: false,
}, scrollerEl)
