import { describe, expect, it } from 'vitest'
import { supportsPassive } from './utils'

describe('supportsPassive', () => {
  it('returns a boolean value', () => {
    expect(typeof supportsPassive()).toBe('boolean')
  })
})
