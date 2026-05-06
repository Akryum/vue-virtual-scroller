import type { CSSProperties } from 'vue'
import type { ViewWithStyleStamp } from '../composables/useRecycleScroller'
import type { ScrollDirection, View } from '../types'

/**
 * Supported pooled-view positioning modes.
 */
export type PooledViewPositionMode = 'transform' | 'position' | 'flow'

/**
 * Shared style inputs for pooled view positioning.
 */
export interface PooledViewStyleOptions {
  direction: ScrollDirection
  mode?: PooledViewPositionMode
  itemSize?: number | null
  gridItems?: number
  itemSecondarySize?: number
}

/**
 * Resolve pooled-view positioning mode from public options.
 */
export function resolvePooledViewMode(options: {
  direction: ScrollDirection
  disableTransform?: boolean
  flowMode?: boolean
  gridItems?: number
}): PooledViewPositionMode {
  if (options.flowMode && options.direction === 'vertical' && !options.gridItems) {
    return 'flow'
  }

  return options.disableTransform ? 'position' : 'transform'
}

/**
 * Build deterministic inline styles for a pooled view.
 *
 * Reactivity note: `view.nr` is `markRaw`, so reads of `view.nr.used` create
 * no reactive dep when this is called inside a Vue render context. Read
 * `_vs_visibilityStamp` first — it is bumped via `touchViewVisibility`
 * whenever `used` flips, anchoring reactivity so the style binding refreshes.
 */
export function getPooledViewStyle<TItem, TKey>(
  view: View<TItem, TKey>,
  options: PooledViewStyleOptions,
): CSSProperties {
  void (view as ViewWithStyleStamp<TItem, TKey>)._vs_visibilityStamp
  const isVertical = options.direction === 'vertical'
  const mode = options.mode ?? 'transform'
  const style: CSSProperties = {
    visibility: view.nr.used ? 'visible' : 'hidden',
    pointerEvents: view.nr.used ? undefined : 'none',
  }

  if (mode === 'flow') {
    style.display = view.nr.used ? undefined : 'none'
  }
  else {
    style.position = 'absolute'
    style.top = '0px'
    style.left = '0px'
    style.display = undefined
  }

  if (mode === 'position') {
    style[isVertical ? 'top' : 'left'] = `${view.position}px`
    style[isVertical ? 'left' : 'top'] = `${view.offset}px`
    style.transform = 'none'
    style.willChange = 'unset'
  }
  else if (mode === 'transform') {
    style.transform = isVertical
      ? `translateY(${view.position}px) translateX(${view.offset}px)`
      : `translateX(${view.position}px) translateY(${view.offset}px)`
    style.willChange = 'transform'
  }

  if (options.gridItems && options.itemSize != null) {
    const secondarySize = options.itemSecondarySize || options.itemSize
    style.width = `${isVertical ? secondarySize : options.itemSize}px`
    style.height = `${isVertical ? options.itemSize : secondarySize}px`
  }

  return style
}
