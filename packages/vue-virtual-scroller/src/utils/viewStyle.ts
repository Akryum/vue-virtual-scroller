import type { CSSProperties } from 'vue'
import type { ScrollDirection, View } from '../types'

/**
 * Shared style inputs for pooled view positioning.
 */
export interface PooledViewStyleOptions {
  direction: ScrollDirection
  disableTransform?: boolean
  itemSize?: number | null
  gridItems?: number
  itemSecondarySize?: number
}

/**
 * Build deterministic inline styles for a pooled view.
 */
export function getPooledViewStyle<TItem, TKey>(
  view: View<TItem, TKey>,
  options: PooledViewStyleOptions,
): CSSProperties {
  const isVertical = options.direction === 'vertical'
  const style: CSSProperties = {
    position: 'absolute',
    top: '0px',
    left: '0px',
    visibility: view.nr.used ? 'visible' : 'hidden',
  }

  if (options.disableTransform) {
    style[isVertical ? 'top' : 'left'] = `${view.position}px`
    style[isVertical ? 'left' : 'top'] = `${view.offset}px`
    style.transform = 'none'
    style.willChange = 'unset'
  }
  else {
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
