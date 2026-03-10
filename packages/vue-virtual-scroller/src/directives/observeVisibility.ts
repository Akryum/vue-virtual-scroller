import type { Directive, DirectiveBinding } from 'vue'

type ObserveVisibilityCallback = (isVisible: boolean, entry: IntersectionObserverEntry) => void

interface ObserveVisibilityValue {
  callback: ObserveVisibilityCallback
  intersection?: IntersectionObserverInit
}

interface ObserveVisibilityState {
  callback: ObserveVisibilityCallback
  intersection?: IntersectionObserverInit
  observer: IntersectionObserver | null
  visible: boolean | null
}

const stateMap = new WeakMap<Element, ObserveVisibilityState>()

function normalizeValue(value: ObserveVisibilityCallback | ObserveVisibilityValue): ObserveVisibilityState {
  if (typeof value === 'function') {
    return {
      callback: value,
      observer: null,
      intersection: undefined,
      visible: null,
    }
  }

  return {
    callback: value.callback,
    observer: null,
    intersection: value.intersection,
    visible: null,
  }
}

function updateState(el: Element, binding: DirectiveBinding<ObserveVisibilityCallback | ObserveVisibilityValue>) {
  teardown(el)
  const state = normalizeValue(binding.value)
  stateMap.set(el, state)

  if (typeof IntersectionObserver === 'undefined') {
    const rect = (el as HTMLElement).getBoundingClientRect()
    state.visible = true
    state.callback(true, {
      boundingClientRect: rect,
    } as IntersectionObserverEntry)
    return
  }

  state.observer = new IntersectionObserver((entries) => {
    const entry = entries[0]
    const isVisible = !!entry?.isIntersecting
    if (state.visible !== null && state.visible === isVisible)
      return
    state.visible = isVisible
    state.callback(isVisible, entry)
  }, state.intersection)

  state.observer.observe(el)
}

function teardown(el: Element) {
  const state = stateMap.get(el)
  if (state?.observer) {
    state.observer.disconnect()
    state.observer = null
  }
}

export const ObserveVisibility: Directive<Element, ObserveVisibilityCallback | ObserveVisibilityValue> = {
  mounted(el, binding) {
    updateState(el, binding)
  },
  updated(el, binding) {
    if (binding.value === binding.oldValue)
      return
    updateState(el, binding)
  },
  unmounted(el) {
    teardown(el)
    stateMap.delete(el)
  },
}
