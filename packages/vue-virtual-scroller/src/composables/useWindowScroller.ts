import type { MaybeRef, MaybeRefOrGetter } from 'vue'
import type { DefaultKeyField, ItemKey, KeyFieldValue, ValidKeyField } from '../types'
import type { UseRecycleScrollerOptions, UseRecycleScrollerReturn } from './useRecycleScroller'
import { computed, toValue } from 'vue'
import { useRecycleScroller } from './useRecycleScroller'

export interface UseWindowScrollerOptions<TItem = unknown, TSizeField extends string = 'size'> extends Omit<UseRecycleScrollerOptions<TItem, TSizeField>, 'pageMode'> {
  pageMode?: boolean
}

export interface UseWindowScrollerReturn<TItem = unknown, TKey = ItemKey<TItem>> extends UseRecycleScrollerReturn<TItem, TKey> {}

type InferredWindowScrollerItem<TOptions extends UseWindowScrollerOptions<any, any>> = TOptions['items'][number]
type InferredWindowScrollerKeyField<TOptions extends UseWindowScrollerOptions<any, any>>
  = Extract<TOptions['keyField'], KeyFieldValue<InferredWindowScrollerItem<TOptions>>>

export function useWindowScroller<TItem, TKeyField extends KeyFieldValue<TItem> = DefaultKeyField<TItem>, TSizeField extends string = 'size'>(
  options: MaybeRefOrGetter<UseWindowScrollerOptions<TItem, TSizeField> & {
    keyField: ValidKeyField<TItem, TKeyField>
  }>,
  el: MaybeRef<HTMLElement | undefined>,
  before?: MaybeRef<HTMLElement | undefined>,
  after?: MaybeRef<HTMLElement | undefined>,
  callbacks?: Parameters<typeof useRecycleScroller>[4],
): UseWindowScrollerReturn<TItem, ItemKey<TItem, TKeyField>>
export function useWindowScroller<TOptions extends UseWindowScrollerOptions<any, any>>(
  options: MaybeRefOrGetter<TOptions>,
  el: MaybeRef<HTMLElement | undefined>,
  before?: MaybeRef<HTMLElement | undefined>,
  after?: MaybeRef<HTMLElement | undefined>,
  callbacks?: Parameters<typeof useRecycleScroller>[4],
): UseWindowScrollerReturn<
  InferredWindowScrollerItem<TOptions>,
  ItemKey<InferredWindowScrollerItem<TOptions>, InferredWindowScrollerKeyField<TOptions>>
>
export function useWindowScroller<TOptions extends UseWindowScrollerOptions<any, any>>(
  options: MaybeRefOrGetter<TOptions>,
  el: MaybeRef<HTMLElement | undefined>,
  before?: MaybeRef<HTMLElement | undefined>,
  after?: MaybeRef<HTMLElement | undefined>,
  callbacks?: Parameters<typeof useRecycleScroller>[4],
): UseWindowScrollerReturn<
  InferredWindowScrollerItem<TOptions>,
  ItemKey<InferredWindowScrollerItem<TOptions>, InferredWindowScrollerKeyField<TOptions>>
> {
  type TItem = InferredWindowScrollerItem<TOptions>
  type TKeyField = InferredWindowScrollerKeyField<TOptions>

  return useRecycleScroller(computed(() => ({
    ...toValue(options),
    pageMode: true,
  })), el, before, after, callbacks) as UseWindowScrollerReturn<TItem, ItemKey<TItem, TKeyField>>
}
