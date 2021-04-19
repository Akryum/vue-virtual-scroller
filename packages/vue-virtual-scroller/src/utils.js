export let supportsPassive = false

if (typeof window !== 'undefined') {
  supportsPassive = false
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get () {
        supportsPassive = true
      },
    })
    window.addEventListener('test', null, opts)
  } catch (e) {}
}
