/** Reconstruct signed CDP deltas, then partition profile clock with midpoint weights. */
export function profileSamples(profile, resolveFrame = frame => frame) {
  if (!profile.samples?.length)
    throw new Error('CPU profile contains no samples')
  if (profile.samples.length !== profile.timeDeltas?.length)
    throw new Error('CPU profile sample/delta lengths differ')
  const nodes = new Map(profile.nodes.map(node => [node.id, node]))
  const parents = new Map()
  for (const node of nodes.values()) {
    for (const child of node.children ?? [])
      parents.set(child, node.id)
  }
  const stacks = new Map()
  const stackFor = (id) => {
    if (!stacks.has(id)) {
      const stack = []
      const seen = new Set()
      for (let current = id; current !== undefined && !seen.has(current); current = parents.get(current)) {
        seen.add(current)
        const node = nodes.get(current)
        if (!node)
          throw new Error(`Missing CPU profile node ${current}`)
        if (node.callFrame.functionName !== '(root)')
          stack.unshift(resolveFrame(node.callFrame))
      }
      stacks.set(id, stack)
    }
    return stacks.get(id)
  }
  let timestamp = profile.startTime
  const points = (profile.samples ?? []).map((node, index) => {
    const delta = profile.timeDeltas[index]
    if (!Number.isFinite(delta))
      throw new Error('Missing CPU profile delta')
    timestamp += delta
    return { timestamp, stack: stackFor(node) }
  }).sort((left, right) => left.timestamp - right.timestamp)
  return points.map((point, index) => ({
    start: Math.max(profile.startTime, index ? (points[index - 1].timestamp + point.timestamp) / 2 : profile.startTime),
    end: Math.min(profile.endTime, index + 1 < points.length ? (point.timestamp + points[index + 1].timestamp) / 2 : profile.endTime),
    timestamp: point.timestamp,
    stack: point.stack,
  })).filter(sample => sample.end > sample.start)
}

/** Clip normalized intervals; resulting exclusive weights never overlap. */
export function intersectSamples(samples, span) {
  return samples.map(sample => ({ ...sample, start: Math.max(sample.start, span.start), end: Math.min(sample.end, span.end) }))
    .filter(sample => sample.end > sample.start)
}
