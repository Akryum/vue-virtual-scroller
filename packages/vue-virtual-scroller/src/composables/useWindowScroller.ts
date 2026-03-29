import type { MaybeRef, MaybeRefOrGetter } from 'vue'
import type { UseRecycleScrollerOptions, UseRecycleScrollerReturn } from './useRecycleScroller'
import { computed, toValue } from 'vue'
import { useRecycleScroller } from './useRecycleScroller'

export interface UseWindowScrollerOptions extends Omit<UseRecycleScrollerOptions, 'pageMode'> {
  pageMode?: boolean
}

export interface UseWindowScrollerReturn extends UseRecycleScrollerReturn {}

export function useWindowScroller(
  options: MaybeRefOrGetter<UseWindowScrollerOptions>,
  el: MaybeRef<HTMLElement | undefined>,
  before?: MaybeRef<HTMLElement | undefined>,
  after?: MaybeRef<HTMLElement | undefined>,
  callbacks?: Parameters<typeof useRecycleScroller>[4],
): UseWindowScrollerReturn {
  return useRecycleScroller(computed(() => ({
    ...toValue(options),
    pageMode: true,
  })), el, before, after, callbacks)
}
