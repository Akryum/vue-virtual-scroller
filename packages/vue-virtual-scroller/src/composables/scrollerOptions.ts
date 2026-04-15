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
 * Cache single-object scroller options so getter-based callers do not rebuild the object on every access.
 */
export function resolveScrollerOptions<TOptions>(
  options: MaybeRefOrGetter<TOptions>,
): ComputedRef<TOptions> {
  return computed(() => toValue(options))
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
  const resolvedOptions = resolveScrollerOptions(options)

  return {
    el: computed(() => {
      const optionEl = resolvedOptions.value.el
      return toValue(el ?? optionEl)
    }),
    before: computed(() => {
      const optionBefore = resolvedOptions.value.before
      return toValue(before ?? optionBefore)
    }),
    after: computed(() => {
      const optionAfter = resolvedOptions.value.after
      return toValue(after ?? optionAfter)
    }),
    callbacks: {
      onResize: () => (callbacks?.onResize ?? resolvedOptions.value.onResize)?.(),
      onVisible: () => (callbacks?.onVisible ?? resolvedOptions.value.onVisible)?.(),
      onHidden: () => (callbacks?.onHidden ?? resolvedOptions.value.onHidden)?.(),
      onUpdate: (startIndex, endIndex, visibleStartIndex, visibleEndIndex) =>
        (callbacks?.onUpdate ?? resolvedOptions.value.onUpdate)?.(startIndex, endIndex, visibleStartIndex, visibleEndIndex),
    },
  }
}
