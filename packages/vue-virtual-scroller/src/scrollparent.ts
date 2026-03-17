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

export function getScrollParent(node: Node): Element | undefined {
  if (!(node instanceof HTMLElement || node instanceof SVGElement)) {
    return
  }

  const ps = parents(node.parentNode!, [])

  for (let i = 0; i < ps.length; i += 1) {
    if (ps[i] instanceof Element && scroll(ps[i] as Element)) {
      return ps[i] as Element
    }
  }

  return document.scrollingElement || document.documentElement
}
