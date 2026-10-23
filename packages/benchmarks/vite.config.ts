import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  build: { rollupOptions: { input: {
    index: fileURLToPath(new URL('./index.html', import.meta.url)),
    case: fileURLToPath(new URL('./case.html', import.meta.url)),
    tableWidthPolicy: fileURLToPath(new URL('./table-width-policy.html', import.meta.url)),
    dynamicPipeline: fileURLToPath(new URL('./dynamic-pipeline.html', import.meta.url)),
  } } },
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
})
