/* global captures */
/* Standalone diagnostic viewer. Captured source locations remain authoritative. */
const select = document.querySelector('#capture')
const phaseSelect = document.querySelector('#phase')
const canvas = document.querySelector('#chart')
const context = canvas.getContext('2d')
let phase
let windowStart = 0
let windowEnd = 1
let rectangles = []
/** Populate controls without interpreting captured names as HTML. */
function fill(element, values) {
  element.replaceChildren(...values.map((value, index) => {
    const option = document.createElement('option')
    option.value = index
    option.textContent = value
    return option
  }))
}
/** Merge adjacent prefix stacks so shared parents remain readable continuous bars. */
function bars(samples) {
  const rows = []
  for (const sample of samples) {
    for (let depth = 0; depth < sample.stack.length; depth++) {
      const prefix = sample.stack.slice(0, depth + 1).join(':')
      rows[depth] ??= []
      const previous = rows[depth].at(-1)
      if (previous?.prefix === prefix && Math.abs(previous.end - sample.start) < 0.0001)
        previous.end = sample.end
      else rows[depth].push({ start: sample.start, end: sample.end, symbol: sample.stack[depth], prefix, depth })
    }
  }
  return rows.flat()
}
/** Draw CPU samples and independent browser engine tracks. */
function draw() {
  if (!phase) {
    rectangles = []
    context.clearRect(0, 0, canvas.width, canvas.height)
    document.querySelector('#range').textContent = captures.length ? 'No measured phases.' : 'No valid captures.'
    return
  }
  document.querySelector('#range').textContent = `${windowStart.toFixed(1)}–${windowEnd.toFixed(1)}ms`
  const records = bars(phase.flame)
  const depth = Math.max(1, ...records.map(record => record.depth + 1))
  canvas.width = Math.max(700, canvas.clientWidth)
  canvas.height = (depth + 5) * 20
  rectangles = []
  context.clearRect(0, 0, canvas.width, canvas.height)
  const x = value => (value - windowStart) / (windowEnd - windowStart) * canvas.width
  for (const record of records) {
    if (record.end <= windowStart || record.start >= windowEnd)
      continue
    const symbol = phase.symbols[record.symbol]
    const left = Math.max(0, x(record.start))
    const width = Math.min(canvas.width, x(record.end)) - left
    const top = record.depth * 20
    context.fillStyle = `hsl(${record.symbol * 47 % 360} 30% 78%)`
    context.fillRect(left, top, width, 19)
    context.fillStyle = '#202322'
    if (width > 35)
      context.fillText(symbol.name.slice(0, Math.floor(width / 7)), left + 3, top + 13)
    rectangles.push({ left, width, top, text: `${symbol.key}\n${(record.end - record.start).toFixed(2)}ms sampled inclusive span; mapped: ${symbol.mapped}` })
  }
  for (const [index, name] of ['RunTask', 'Layout', 'UpdateLayoutTree', 'Paint'].entries()) {
    const top = (depth + index) * 20
    context.fillStyle = '#303837'
    context.fillText(name, 3, top + 13)
    for (const event of phase.timeline.filter(event => event.name === name)) {
      const left = Math.max(0, x(event.start))
      const width = Math.min(canvas.width, x(event.end)) - left
      if (width <= 0)
        continue
      context.fillStyle = '#c4cfca'
      context.fillRect(left, top, width, 19)
      rectangles.push({ left, width, top, text: `${name}: clipped ${(event.end - event.start).toFixed(2)}ms; whole task ${event.wholeTaskDuration.toFixed(2)}ms` })
    }
  }
}
/** Select phase and reset independent zoom state. */
function changePhase() {
  phase = captures[select.value]?.phases[phaseSelect.value]
  document.querySelector('#reset').disabled = !phase
  windowStart = 0
  windowEnd = phase?.duration || 1
  document.querySelector('#self').replaceChildren(...(phase?.topSelf ?? []).slice(0, 25).map((row) => {
    const tr = document.createElement('tr')
    for (const value of [row.symbol, row.ms.toFixed(2)]) {
      const td = document.createElement('td')
      td.textContent = value
      tr.append(td)
    }
    return tr
  }))
  draw()
}
/** Select capture and retain raw evidence links. */
function changeCapture() {
  const capture = captures[select.value]
  fill(phaseSelect, capture?.phases.map(phase => `${phase.phase}: ${phase.duration.toFixed(1)}ms`) ?? [])
  phaseSelect.disabled = !capture?.phases.length
  const links = document.querySelector('#links')
  links.replaceChildren()
  for (const extension of capture ? ['trace.json', 'cpuprofile', 'result.json'] : []) {
    const link = document.createElement('a')
    link.href = `${capture.id}.${extension}`
    link.textContent = ` ${extension} `
    links.append(link)
  }
  changePhase()
}
fill(select, captures.map(capture => capture.id))
select.disabled = !captures.length
select.addEventListener('change', changeCapture)
phaseSelect.addEventListener('change', changePhase)
document.querySelector('#reset').addEventListener('click', changePhase)
canvas.addEventListener('mousemove', (event) => {
  const box = canvas.getBoundingClientRect()
  const rectangle = rectangles.findLast(rectangle => event.clientX - box.left >= rectangle.left && event.clientX - box.left <= rectangle.left + rectangle.width && event.clientY - box.top >= rectangle.top && event.clientY - box.top < rectangle.top + 20)
  document.querySelector('#detail').textContent = rectangle?.text ?? ''
})
canvas.addEventListener('wheel', (event) => {
  if (!phase)
    return
  event.preventDefault()
  const center = windowStart + event.offsetX / canvas.clientWidth * (windowEnd - windowStart)
  const factor = event.deltaY > 0 ? 1.3 : 1 / 1.3
  windowStart = Math.max(0, center - (center - windowStart) * factor)
  windowEnd = Math.min(phase.duration, center + (windowEnd - center) * factor)
  draw()
}, { passive: false })
canvas.addEventListener('keydown', (event) => {
  if (!phase)
    return
  if (event.key === 'Home') {
    changePhase()
  }
  else if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
    const delta = (windowEnd - windowStart) * (event.key === 'ArrowLeft' ? -0.1 : 0.1)
    const width = windowEnd - windowStart
    windowStart = Math.max(0, Math.min(phase.duration - width, windowStart + delta))
    windowEnd = windowStart + width
    draw()
  }
})
window.addEventListener('resize', draw)
changeCapture()
