// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: [
    'playwright-report/**',
    'test-results/**',
  ],
})
