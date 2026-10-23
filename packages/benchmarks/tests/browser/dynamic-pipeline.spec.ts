import { expect, test } from '@playwright/test'

// Preflight: no ResizeObserver is a supported fallback, not a simulated layout.
// Real mount, same-tick rebind and native geometry must converge without manual recovery.
for (const mode of ['control', 'active', 'id']) {
  test(`fallback measurement survives ${mode} binding round-trip`, async ({ page }) => {
    await page.addInitScript(() => Object.defineProperty(window, 'ResizeObserver', { value: undefined, configurable: true }))
    await page.goto(`/dynamic-pipeline.html?roundtrip=${mode}`)
    await expect(page.getByText('Measured row', { exact: true })).toBeVisible()
    await expect.poll(() => page.evaluate(() => (window as any).measurementRoundtrip())).toEqual({
      size: 73,
      offset: 73,
      nativeHeight: 73,
    })
  })
}

// Preflight: activation occurs after queued work was rejected, including a row
// with a previously known size. Unknown-size-only recovery would miss the latter.
for (const mode of ['delayed', 'pending-update']) {
  test(`fallback measurement resumes ${mode} after inactive frames`, async ({ page }) => {
    await page.addInitScript(() => Object.defineProperty(window, 'ResizeObserver', { value: undefined, configurable: true }))
    await page.goto(`/dynamic-pipeline.html?roundtrip=${mode}`)
    await expect(page.getByText('Measured row', { exact: true })).toBeVisible()
    if (mode === 'pending-update') {
      await expect.poll(() => page.evaluate(() => (window as any).measurementRoundtrip().size)).toBe(73)
      await page.evaluate(() => (window as any).measurementPauseUpdate())
    }
    await page.evaluate(async () => {
      await new Promise(requestAnimationFrame)
      await new Promise(requestAnimationFrame)
      ;(window as any).measurementActivate()
    })
    const expected = mode === 'delayed' ? 73 : 91
    await expect.poll(() => page.evaluate(() => (window as any).measurementRoundtrip())).toEqual({
      size: expected,
      offset: expected,
      nativeHeight: expected,
    })
  })
}

/** Real browser geometry validates both recycler consumers and independent owners. */
test('public size batches, same-key replacement and disposed owner preserve geometry', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/dynamic-pipeline.html')
  const first = page.locator('[data-owner="first"]')
  const second = page.locator('[data-owner="second"]')
  await expect(first.getByText('Account 0', { exact: true })).toBeVisible()
  await expect(second.getByText('Account 0', { exact: true })).toBeVisible()
  await page.evaluate(() => (window as any).dynamicPipeline.first().jump(10))
  await expect(first.getByText('Account 10', { exact: true })).toBeVisible()
  const anchor = first.locator('[data-row="row-10"]')
  const before = await anchor.boundingBox()
  expect(before).not.toBeNull()
  // Synchronous offset query must see both dirty records, before queued render.
  expect(await page.evaluate(() => (window as any).dynamicPipeline.first().grow())).toBe(460)
  await expect.poll(async () => (await anchor.boundingBox())?.y).toBeCloseTo(before!.y, 0)
  expect(await page.evaluate(() => (window as any).dynamicPipeline.second().offset(10))).toBe(400)
  await page.evaluate(() => (window as any).dynamicPipeline.first().replace())
  await expect(first.getByText('Replaced account', { exact: true })).toBeVisible()
  await expect(second.getByText('Account 0', { exact: true })).toBeVisible()
  await page.evaluate(() => (window as any).dynamicPipeline.removeFirst())
  await expect(first).toHaveCount(0)
  expect(await page.evaluate(() => (window as any).dynamicPipeline.second().grow())).toBe(460)
  await page.evaluate(() => (window as any).dynamicPipeline.second().jump(10))
  await expect(second.getByText('Account 10', { exact: true })).toBeVisible()
  await page.evaluate(() => (window as any).dynamicPipeline.second().disable())
  await page.evaluate(() => (window as any).dynamicPipeline.second().grow(90, 110))
  await page.evaluate(() => (window as any).dynamicPipeline.second().enable())
  await expect.poll(() => page.evaluate(() => (window as any).dynamicPipeline.second().offset(10))).toBe(520)
  await expect(second.getByText('Account 10', { exact: true })).toBeVisible()
  expect(await page.evaluate(() => (window as any).dynamicPipeline.second().reset())).toBe(400)
  expect(await page.evaluate(() => (window as any).dynamicPipeline.second().restore())).toBe(440)
  expect(await page.evaluate(() => (window as any).dynamicPipeline.second().snapshot().sizes.slice(0, 3))).toEqual([50, 70, 40])
  expect(await page.evaluate(() => (window as any).dynamicPipeline.second().offset(12) - (window as any).dynamicPipeline.second().offset(11))).toBe(40)
  await page.evaluate(() => (window as any).dynamicPipeline.second().jump(0))
  await expect(second.getByText('Account 0', { exact: true })).toBeVisible()
  await expect.poll(async () => (await second.locator('[data-row="row-0"]').boundingBox())?.height).toBe(50)
  await expect.poll(async () => (await second.locator('[data-row="row-1"]').boundingBox())?.height).toBe(70)
  expect(errors).toEqual([])
})

/** A retained real callback must not survive a disabled owner's new lifetime. */
test('old observer deliveries cannot cross disable and re-enable', async ({ page }) => {
  await page.goto('/dynamic-pipeline.html')
  const first = page.locator('[data-owner="first"]')
  await expect(first.getByText('Account 0', { exact: true })).toBeVisible()
  await expect.poll(() => page.evaluate(() => (window as any).dynamicPipeline.first().holdResize())).toBe(true)
  await page.evaluate(() => (window as any).dynamicPipeline.first().disable())
  await expect.poll(() => page.evaluate(() => (window as any).dynamicPipeline.first().active())).toBe(false)
  await page.evaluate(() => (window as any).dynamicPipeline.first().enable())
  await expect.poll(() => page.evaluate(() => (window as any).dynamicPipeline.first().active())).toBe(true)
  expect(await page.evaluate(() => (window as any).dynamicPipeline.first().deliveryOwner())).toBe('row-2')
  await page.evaluate(() => (window as any).dynamicPipeline.first().deliverOldResize())
  expect(await page.evaluate(() => (window as any).dynamicPipeline.first().offset(3))).toBe(120)
})

// Preflight: grow two offscreen records while retaining visible ID/pixel anchor.
// Own, ref-backed and inherited aliases must publish both changes; the native
// anchor and independent second owner reject stale or shared sequence publication.
test('reactive size aliases and public ref writes preserve offscreen geometry', async ({ page }) => {
  for (const config of [
    { withRefs: false, inherited: false },
    { withRefs: true, inherited: false },
    { withRefs: false, inherited: true },
  ]) {
    await page.goto('/dynamic-pipeline.html')
    const first = page.locator('[data-owner="first"]')
    await expect(first.getByText('Account 0', { exact: true })).toBeVisible()
    await page.evaluate(() => (window as any).dynamicPipeline.first().jump(10))
    await expect(first.getByText('Account 10', { exact: true })).toBeVisible()
    // Adopt only after the changed records leave the active measurement range;
    // a visible measurement must not shadow inherited values and hide the bug.
    await page.evaluate(({ withRefs, inherited }) => {
      ;(window as any).dynamicPipeline.first().useReactiveSizes(withRefs, inherited)
    }, config)
    await expect(first.getByText('Account 10', { exact: true })).toBeVisible()
    const anchor = first.locator('[data-row="row-10"]')
    const before = await anchor.boundingBox()
    expect(before).not.toBeNull()
    expect(await page.evaluate((withRefs) => {
      const owner = (window as any).dynamicPipeline.first()
      return { offset: owner.growReactiveSizes(withRefs), sizes: [owner.size(0), owner.size(1), owner.size(2)] }
    }, config.withRefs)).toEqual({ offset: 490, sizes: [80, 90, 40] })
    await expect.poll(async () => (await anchor.boundingBox())?.y).toBeCloseTo(before!.y, 0)
    expect(await page.evaluate(() => (window as any).dynamicPipeline.first().snapshot().sizes.slice(0, 3))).toEqual([80, 90, 40])
    expect(await page.evaluate(() => (window as any).dynamicPipeline.second().offset(10))).toBe(400)
    await page.evaluate(() => {
      const owner = (window as any).dynamicPipeline.first()
      owner.reset()
      owner.position(0)
    })
    await expect(first.getByText('Account 0', { exact: true })).toBeVisible()
    expect(await page.evaluate(() => (window as any).dynamicPipeline.first().offset(10))).toBe(400)
  }
})
