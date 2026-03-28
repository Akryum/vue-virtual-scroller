import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'

const rootDir = fileURLToPath(new URL('.', import.meta.url))
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))

export default defineConfig({
  root: rootDir,
  plugins: [
    vue(),
  ],
  define: {
    VERSION: JSON.stringify(pkg.version),
  },
  test: {
    include: ['src/**/*.browser.spec.ts'],
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{
        browser: 'chromium',
      }],
    },
  },
})
