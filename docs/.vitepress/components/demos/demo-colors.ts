/** Dark gradient stops preserve white text contrast across every avatar hue. */
export function avatarStyle(hue: number) {
  return {
    background: `linear-gradient(145deg, hsl(${hue} 68% 27%), hsl(${(hue + 32) % 360} 70% 23%))`,
  }
}

/** Shared card and avatar palette; every stop exceeds 4.5:1 against white. */
const GRADIENTS = [
  'linear-gradient(145deg, #247247, #174c35)',
  'linear-gradient(145deg, #9a2254, #5e216e)',
  'linear-gradient(145deg, #2654a3, #24356f)',
  'linear-gradient(145deg, #945100, #633600)',
  'linear-gradient(145deg, #236643, #153e2e)',
  'linear-gradient(145deg, #a13b18, #702917)',
]

/** Select a repeatable, readable gradient for a demo item. */
export function gradientAt(index: number) {
  return GRADIENTS[index % GRADIENTS.length]
}
