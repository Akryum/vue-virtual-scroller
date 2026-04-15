import type { MaybeRefOrGetter } from 'vue'
import type { DefaultKeyField, ItemKey, KeyFieldValue, ValidKeyField } from '../types'
import type { ScrollerCallbacks } from './scrollerOptions'
import type { UseRecycleScrollerOptions, UseRecycleScrollerReturn } from './useRecycleScroller'
import { useRecycleScroller } from './useRecycleScroller'

export interface UseWindowScrollerOptions<TItem = unknown, TSizeField extends string = 'size'> extends Omit<UseRecycleScrollerOptions<TItem, TSizeField>, 'pageMode'> {
  pageMode?: boolean
}

export interface UseWindowScrollerReturn<TItem = unknown, TKey = ItemKey<TItem>> extends UseRecycleScrollerReturn<TItem, TKey> {}

type ResolvedWindowScrollerItems<TOptions extends UseWindowScrollerOptions<any, any>>
  = TOptions['items'] extends MaybeRefOrGetter<infer TItems extends any[]> ? TItems : never
type InferredWindowScrollerItem<TOptions extends UseWindowScrollerOptions<any, any>> = ResolvedWindowScrollerItems<TOptions>[number]
type InferredWindowScrollerKeyField<TOptions extends UseWindowScrollerOptions<any, any>>
  = Extract<TOptions['keyField'], KeyFieldValue<InferredWindowScrollerItem<TOptions>>>

export function useWindowScroller<TItem, TKeyField extends KeyFieldValue<TItem> = DefaultKeyField<TItem>, TSizeField extends string = 'size'>(
  options: MaybeRefOrGetter<UseWindowScrollerOptions<TItem, TSizeField> & {
    keyField: ValidKeyField<TItem, TKeyField>
  }>,
  el?: MaybeRefOrGetter<HTMLElement | undefined>,
  before?: MaybeRefOrGetter<HTMLElement | undefined>,
  after?: MaybeRefOrGetter<HTMLElement | undefined>,
  callbacks?: ScrollerCallbacks,
): UseWindowScrollerReturn<TItem, ItemKey<TItem, TKeyField>>
export function useWindowScroller<TOptions extends UseWindowScrollerOptions<any, any>>(
  options: MaybeRefOrGetter<TOptions>,
  el?: MaybeRefOrGetter<HTMLElement | undefined>,
  before?: MaybeRefOrGetter<HTMLElement | undefined>,
  after?: MaybeRefOrGetter<HTMLElement | undefined>,
  callbacks?: ScrollerCallbacks,
): UseWindowScrollerReturn<
  InferredWindowScrollerItem<TOptions>,
  ItemKey<InferredWindowScrollerItem<TOptions>, InferredWindowScrollerKeyField<TOptions>>
>
export function useWindowScroller<TOptions extends UseWindowScrollerOptions<any, any>>(
  options: MaybeRefOrGetter<TOptions>,
  el?: MaybeRefOrGetter<HTMLElement | undefined>,
  before?: MaybeRefOrGetter<HTMLElement | undefined>,
  after?: MaybeRefOrGetter<HTMLElement | undefined>,
  callbacks?: ScrollerCallbacks,
): UseWindowScrollerReturn<
  InferredWindowScrollerItem<TOptions>,
  ItemKey<InferredWindowScrollerItem<TOptions>, InferredWindowScrollerKeyField<TOptions>>
> {
  type TItem = InferredWindowScrollerItem<TOptions>
  type TKeyField = InferredWindowScrollerKeyField<TOptions>

  return (useRecycleScroller as any)(
    options,
    el,
    before,
    after,
    callbacks,
    {
      pageMode: true,
    },
  ) as UseWindowScrollerReturn<TItem, ItemKey<TItem, TKeyField>>
}
