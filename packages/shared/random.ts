/** Deterministic LCG shared with documentation fixtures; preserve historical sequence. */
export function createRng(seed = 1) {
  let value = seed >>> 0
  return () => {
    value = (Math.imul(1664525, value) + 1013904223) >>> 0
    return value / 4294967296
  }
}
