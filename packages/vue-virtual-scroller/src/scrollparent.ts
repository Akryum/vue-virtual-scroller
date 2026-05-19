// Fork of https://github.com/olahol/scrollparent.js to be able to build with Rollup

const regex = /auto|scroll/

function parents(node: Node, ps: Node[]): Node[] {
  if (node.parentNode === null) {
    return ps
  }

  return parents(node.parentNode, [...ps, ...[node]])
}

function style(node: Element, prop: string): string {
  return getComputedStyle(node, null).getPropertyValue(prop)
}

function overflow(node: Element): string {
  return style(node, 'overflow') + style(node, 'overflow-y') + style(node, 'overflow-x')
}

function scroll(node: Element): boolean {
  return regex.test(overflow(node))
}

/**
 * Walk the DOM tree starting from `node`'s parent and return the first
 * ancestor whose computed `overflow*` allows scrolling. Falls back to the
 * document's scrolling element (typically `<html>`) when no ancestor scrolls.
 *
 * @param node - The element whose scroll parent should be resolved.
 * @returns The first scrollable ancestor, or the document scrolling element.
 */
export function getScrollParent(node: Node): Element | undefined {
  if (!(node instanceof HTMLElement || node instanceof SVGElement)) {
    return
  }

  // A detached element has no parent chain to walk; fall back to the
  // document scrolling element so callers don't see a crash. Matches the
  // legacy contract where the fallback only kicked in for attached nodes.
  if (node.parentNode === null) {
    return document.scrollingElement || document.documentElement
  }

  const ps = parents(node.parentNode, [])

  for (let i = 0; i < ps.length; i += 1) {
    if (ps[i] instanceof Element && scroll(ps[i] as Element)) {
      return ps[i] as Element
    }
  }

  return document.scrollingElement || document.documentElement
}

/**
 * Resolve the scroll-parent target used by the scroller's pageMode paths.
 *
 * Combines the auto-detection of `getScrollParent` with an optional explicit
 * override and normalizes html/body to `window`, so callers get a single
 * "target" they can listen on AND measure against (geometry math reads the
 * returned target's rect; for `window` it uses `innerHeight/innerWidth`).
 *
 * @param node - The scroller's root element. Used as the start of the DOM
 *   walk when no override is provided.
 * @param override - Optional explicit scroll-parent. Accepts either an
 *   `HTMLElement` or `Window`. When `undefined`, falls back to auto-detection.
 * @returns A `Window` or `HTMLElement` to listen on and measure against.
 *   Returns `undefined` only when `node` is not a host element AND no
 *   override was supplied — callers should fall back to `window` in that
 *   case (matches the legacy behavior in `useRecycleScroller`).
 */
export function resolveScrollParent(
  node: Node | undefined,
  override?: HTMLElement | Window,
): Window | HTMLElement | undefined {
  // Explicit override short-circuits the DOM walk.
  if (override) {
    return override
  }

  if (!node) {
    return undefined
  }

  const detected = getScrollParent(node)
  if (!detected) {
    return undefined
  }

  // html/body normalize to `window` — keeps the Chrome/Safari fix from
  // `getListenerTarget` in sync with all other call sites.
  if (typeof window !== 'undefined' && window.document
    && (detected === window.document.documentElement || detected === window.document.body)) {
    return window
  }

  return detected as HTMLElement
}
