/* eslint-disable ts/no-unused-expressions */

import { ref } from 'vue'
import { useDynamicScroller, useDynamicScrollerItem, useRecycleScroller, useWindowScroller } from '../index'

interface Message {
  id: string
  text: string
  size: number
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

const recycleScroller = useRecycleScroller<Message>({
  items: messages,
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
  prerender: 0,
  emitUpdate: false,
  updateInterval: 0,
}, scrollerEl)

recycleScroller.pool.value[0]?.item.text
recycleScroller.getViewStyle(recycleScroller.pool.value[0]!)

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
  prerender: 0,
  emitUpdate: false,
  updateInterval: 0,
}, scrollerEl)

functionKeyRecycleScroller.pool.value[0]?.nr.key

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

const dynamicScroller = useDynamicScroller<Message>({
  items: messages,
  keyField: 'id',
  direction: 'vertical',
  minItemSize: 32,
  disableTransform: true,
  el: scrollerEl,
})

const functionKeyDynamicScroller = useDynamicScroller<Message, typeof functionKeyField>({
  items: messages,
  keyField: functionKeyField,
  direction: 'vertical',
  minItemSize: 32,
  disableTransform: true,
  el: scrollerEl,
})

dynamicScroller.itemsWithSize.value[0]?.item.text
dynamicScroller.getItemSize(messages[0])
dynamicScroller.getViewStyle(dynamicScroller.pool.value[0]!)
functionKeyDynamicScroller.itemsWithSize.value[0]?.id

const windowScroller = useWindowScroller<Message>({
  items: messages,
  keyField: 'id',
  direction: 'vertical',
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

windowScroller.getViewStyle(windowScroller.pool.value[0]!)

// @ts-expect-error getItemSize should require the declared item type.
dynamicScroller.getItemSize({ id: 'beta', size: 40 })

useDynamicScrollerItem<Message>({
  item: messages[0],
  active: true,
  watchData: false,
  emitResize: false,
}, scrollerEl)

useDynamicScrollerItem<Message>({
  // @ts-expect-error Dynamic item helpers should reject incompatible item shapes.
  item: { id: 'beta', size: 40 },
  active: true,
  watchData: false,
  emitResize: false,
}, scrollerEl)
