import type { MaybeRef, MaybeRefOrGetter } from 'vue'
import type { ItemKey } from '../types'
import type { UseRecycleScrollerOptions, UseRecycleScrollerReturn } from './useRecycleScroller'
import { computed, toValue } from 'vue'
import { useRecycleScroller } from './useRecycleScroller'

export interface UseWindowScrollerOptions<TItem = unknown, TKeyField extends string = 'id', TSizeField extends string = 'size'> extends Omit<UseRecycleScrollerOptions<TItem, TKeyField, TSizeField>, 'pageMode'> {
  pageMode?: boolean
}

export interface UseWindowScrollerReturn<TItem = unknown, TKey = ItemKey<TItem>> extends UseRecycleScrollerReturn<TItem, TKey> {}

export function useWindowScroller<TItem, TKeyField extends string = 'id', TSizeField extends string = 'size'>(
  options: MaybeRefOrGetter<UseWindowScrollerOptions<TItem, TKeyField, TSizeField>>,
  el: MaybeRef<HTMLElement | undefined>,
  before?: MaybeRef<HTMLElement | undefined>,
  after?: MaybeRef<HTMLElement | undefined>,
  callbacks?: Parameters<typeof useRecycleScroller>[4],
): UseWindowScrollerReturn<TItem, ItemKey<TItem, TKeyField>> {
  return useRecycleScroller(computed(() => ({
    ...toValue(options),
    pageMode: true,
  })), el, before, after, callbacks)
}
