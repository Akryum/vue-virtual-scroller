// Fork of https://github.com/olahol/scrollparent.js to be able to build with Rollup

const regex = /(auto|scroll)/

function parents (node, ps) {
  if (node.parentNode === null) { return ps }

  return parents(node.parentNode, ps.concat([node]))
}

const style = function (node, prop) {
  return getComputedStyle(node, null).getPropertyValue(prop)
}

const overflow = function (node) {
  return style(node, 'overflow') + style(node, 'overflow-y') + style(node, 'overflow-x')
}

const scroll = function (node) {
  return regex.test(overflow(node))
}

export function getScrollParent (node) {
  if (!(node instanceof HTMLElement || node instanceof SVGElement)) {
    return
  }

  const ps = parents(node.parentNode, [])

  for (let i = 0; i < ps.length; i += 1) {
    if (scroll(ps[i])) {
      return ps[i]
    }
  }

  return document.scrollingElement || document.documentElement
}
