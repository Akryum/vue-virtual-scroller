import type { Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { control } from './demo'

/** Linear gradients serialize their color stops as RGB or RGBA in supported browsers. */
const RGB_COLOR_PATTERN = /rgba?\([^)]+\)/g

/** Select a stable explicit theme before any page scripts execute. */
export async function useContrastMode(page: Page, mode: 'light' | 'dark') {
  await page.emulateMedia({ colorScheme: mode, reducedMotion: 'reduce' })
  await page.addInitScript(value => localStorage.setItem('vitepress-theme-appearance', value), mode)
}

/** Audit rendered text, retaining uncertain results for explicit review. */
export async function expectReadableText(page: Page, selector?: string) {
  let builder = new AxeBuilder({ page }).withRules(['color-contrast'])
  if (selector)
    builder = builder.include(selector)
  const results = await builder.analyze()
  if (results.incomplete.length) {
    await test.info().attach('contrast-review', {
      body: JSON.stringify(results.incomplete, null, 2),
      contentType: 'application/json',
    })
    const uncertainBackground = results.incomplete.some(result => result.nodes.some(node =>
      node.any.some(check => check.message?.includes('background gradient') || check.message?.includes('no value')),
    ))
    if (uncertainBackground) {
      const failures = (await gradientContrast(page, [], '#fff', selector ?? 'body'))
        .filter(result => result.ratio < result.required)
      expect(failures).toEqual([])
    }
  }
  expect(results.violations.map(result => ({
    rule: result.id,
    nodes: result.nodes.map(node => ({ target: node.target, reason: node.failureSummary })),
  }))).toEqual([])
}

/** Wait for Vue hydration and actual pooled demo content before measuring it. */
export async function openContrastPage(page: Page, route: string) {
  await page.goto(route)
  await expect(page.locator('#app')).toHaveAttribute('data-v-app', '', { timeout: 15_000 })
  if (route.startsWith('/demos/') && route !== '/demos/') {
    await expect(page.locator('.demo-shell').first()).toBeVisible()
    if (route === '/demos/test-chat')
      await control(page, 'add-80').click()
    await page.locator('.demo-shell').first().scrollIntoViewIfNeeded()
    await expect(page.locator('[data-testid="demo:row"]:visible, [data-testid="demo:card"]:visible')
      .first()).toBeVisible()
  }
  await page.evaluate(() => document.fonts.ready)
}

/** Check actual text colors on every rendered avatar and card gradient. */
export async function expectReadableGradients(page: Page) {
  const groups = await page.locator('.demo-avatar, .demo-grid-card').evaluateAll((elements) => {
    const groups: Record<string, string[]> = {}
    for (const element of elements) {
      const { color, backgroundImage } = getComputedStyle(element)
      const backgrounds = groups[color] ??= []
      if (!backgrounds.includes(backgroundImage))
        backgrounds.push(backgroundImage)
    }
    return groups
  })
  for (const [foreground, gradients] of Object.entries(groups)) {
    const failures = (await gradientContrast(page, gradients, foreground)).filter(result => result.ratio < 4.5)
    expect(failures).toEqual([])
  }
}

/** Measure palette gradients or conservative composited backgrounds behind text. */
export async function gradientContrast(
  page: Page,
  gradients: string[],
  foreground = '#fff',
  scope?: string,
) {
  return page.evaluate(({ gradients, foreground, colorPattern, scope }) => {
    const rgbColorPattern = new RegExp(colorPattern, 'g')
    const canvas = document.createElement('canvas')
    canvas.width = 101
    canvas.height = 1
    const context = canvas.getContext('2d')!
    const colors = new Map<string, number[]>()
    const probe = document.createElement('span')
    document.body.append(probe)

    /** Decode CSS colors through browser instead of duplicating CSS color parsing. */
    function color(value: string) {
      const cached = colors.get(value)
      if (cached)
        return cached
      context.clearRect(0, 0, 101, 1)
      context.fillStyle = value
      context.fillRect(0, 0, 101, 1)
      const channels = [...context.getImageData(0, 0, 1, 1).data]
      colors.set(value, channels)
      return channels
    }

    /** WCAG relative luminance from unrounded sRGB channels. */
    function luminance(channels: number[]) {
      return channels.slice(0, 3).reduce((sum, channel, index) => {
        const value = channel / 255
        const linear = value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
        return sum + linear * [0.2126, 0.7152, 0.0722][index]
      }, 0)
    }

    /** Contrast ratio without rounding threshold values. */
    function contrast(first: number[], second: number[]) {
      const a = luminance(first)
      const b = luminance(second)
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
    }

    /** Normalize linear gradient stops using browser-resolved CSS colors. */
    function stops(background: string) {
      probe.style.backgroundImage = background
      const resolved = getComputedStyle(probe).backgroundImage
      const values = resolved.match(rgbColorPattern)
      if (!resolved.startsWith('linear-gradient(') || !values || values.length < 2)
        throw new Error(`Expected linear gradient color stops: ${resolved}`)
      return values
    }

    /** Composite a translucent paint over conservative RGB background bounds. */
    function composite(paint: number[], background: number[]) {
      const alpha = paint[3] / 255
      return background.map((channel, index) => paint[index] * alpha + channel * (1 - alpha))
    }

    /** Bound every possible background under text, including nested translucent surfaces. */
    function textContrast(element: Element, pseudo?: string) {
      const ancestors: Element[] = []
      for (let ancestor: Element | null = element; ancestor; ancestor = ancestor.parentElement)
        ancestors.unshift(ancestor)
      let low = [255, 255, 255]
      let high = [...low]
      let hasGradient = false
      for (const ancestor of ancestors) {
        const style = getComputedStyle(ancestor)
        const background = color(style.backgroundColor)
        low = composite(background, low)
        high = composite(background, high)
        if (style.backgroundImage === 'none')
          continue
        hasGradient = true
        const paints = stops(style.backgroundImage).map(color)
        // Channel bounds enclose every sRGB gradient position. Compositing
        // each ancestor preserves that bound even with translucent surfaces.
        const lower = paints.map(paint => composite(paint, low))
        const upper = paints.map(paint => composite(paint, high))
        low = low.map((_, index) => Math.min(...lower.map(paint => paint[index])))
        high = high.map((_, index) => Math.max(...upper.map(paint => paint[index])))
      }
      if (!hasGradient && !pseudo)
        return []
      const style = getComputedStyle(element, pseudo)
      const text = color(style.color)
      if (text[3] !== 255)
        throw new Error(`Expected opaque foreground for gradient text: ${element.outerHTML}`)
      const inside = luminance(text) >= luminance(low) && luminance(text) <= luminance(high)
      const large = Number.parseFloat(style.fontSize) >= 24
        || (Number.parseFloat(style.fontSize) >= 18.6667 && Number(style.fontWeight) >= 700)
      return [{
        background: element.outerHTML.slice(0, 180),
        ratio: inside ? 1 : Math.min(contrast(text, low), contrast(text, high)),
        required: large ? 3 : 4.5,
      }]
    }

    try {
      const text = color(foreground)
      const palettes = gradients.map((background) => {
        const values = stops(background)
        const endpoints = values.map(color)
        if (endpoints.length !== 2 || endpoints.some(stop => stop[3] !== 255))
          throw new Error(`Expected two opaque palette stops: ${background}`)
        const gradient = context.createLinearGradient(0, 0, 101, 0)
        values.forEach((stop, index) => gradient.addColorStop(index, stop))
        context.fillStyle = gradient
        context.fillRect(0, 0, 101, 1)
        const pixels = context.getImageData(0, 0, 101, 1).data
        const ratios = endpoints.map(stop => contrast(text, stop))
        for (let index = 0; index < pixels.length; index += 4)
          ratios.push(contrast(text, [...pixels.slice(index, index + 3)]))
        return { background, ratio: Math.min(...ratios), required: 4.5 }
      })
      // Inspect current DOM synchronously. axe selectors can become stale when
      // pooled rows recycle or hover classes change during its asynchronous scan.
      const elements = scope
        ? [...new Set([...document.querySelectorAll(scope)].flatMap(root => [root, ...root.querySelectorAll('*')]))]
        : []
      const rendered = elements.flatMap((element) => {
        const style = getComputedStyle(element)
        const bounds = element.getBoundingClientRect()
        if (!bounds.width || !bounds.height || style.visibility === 'hidden' || style.opacity === '0')
          return []
        const textInput = element instanceof HTMLInputElement && ['text', 'number', 'search'].includes(element.type)
        if (textInput && !element.value && element.placeholder)
          return textContrast(element, '::placeholder')
        const hasText = [...element.childNodes].some(node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim())
        return hasText || textInput ? textContrast(element) : []
      })
      return [...palettes, ...rendered]
    }
    finally {
      probe.remove()
    }
  }, { gradients, foreground, colorPattern: RGB_COLOR_PATTERN.source, scope })
}
