import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import { computed, toValue } from 'vue'

/**
 * Shared lifecycle callbacks exposed by headless scroller composables.
 */
export interface ScrollerCallbacks {
  onResize?: () => void
  onVisible?: () => void
  onHidden?: () => void
  onUpdate?: (startIndex: number, endIndex: number, visibleStartIndex: number, visibleEndIndex: number) => void
}

/**
 * Common single-object inputs for headless scroller composables.
 */
export interface ScrollerOptionElements {
  el?: MaybeRefOrGetter<HTMLElement | undefined>
  before?: MaybeRefOrGetter<HTMLElement | undefined>
  after?: MaybeRefOrGetter<HTMLElement | undefined>
}

/**
 * Common single-object callback hooks for headless scroller composables.
 */
export interface ScrollerOptionCallbacks extends ScrollerCallbacks {}

/**
 * Normalized element refs and callback hooks resolved from either object or legacy positional inputs.
 */
export interface NormalizedScrollerInputs {
  el: ComputedRef<HTMLElement | undefined>
  before: ComputedRef<HTMLElement | undefined>
  after: ComputedRef<HTMLElement | undefined>
  callbacks: ScrollerCallbacks
}

/**
 * Resolve shared scroller inputs while keeping `items` and DOM refs as separate reactive sources.
 */
export function normalizeScrollerInputs<TOptions extends ScrollerOptionElements & ScrollerOptionCallbacks>(
  options: MaybeRefOrGetter<TOptions>,
  el?: MaybeRefOrGetter<HTMLElement | undefined>,
  before?: MaybeRefOrGetter<HTMLElement | undefined>,
  after?: MaybeRefOrGetter<HTMLElement | undefined>,
  callbacks?: ScrollerCallbacks,
): NormalizedScrollerInputs {
  return {
    el: computed(() => {
      const optionEl = toValue(options).el
      return toValue(el ?? optionEl)
    }),
    before: computed(() => {
      const optionBefore = toValue(options).before
      return toValue(before ?? optionBefore)
    }),
    after: computed(() => {
      const optionAfter = toValue(options).after
      return toValue(after ?? optionAfter)
    }),
    callbacks: {
      onResize: () => (callbacks?.onResize ?? toValue(options).onResize)?.(),
      onVisible: () => (callbacks?.onVisible ?? toValue(options).onVisible)?.(),
      onHidden: () => (callbacks?.onHidden ?? toValue(options).onHidden)?.(),
      onUpdate: (startIndex, endIndex, visibleStartIndex, visibleEndIndex) =>
        (callbacks?.onUpdate ?? toValue(options).onUpdate)?.(startIndex, endIndex, visibleStartIndex, visibleEndIndex),
    },
  }
}
