import { readFileSync } from 'node:fs'
import process from 'node:process'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))
const isTest = process.env.VITEST === 'true'

export default defineConfig({
  plugins: [
    vue(),
    ...(!isTest
      ? [dts({
          tsconfigPath: './tsconfig.build.json',
        })]
      : []),
  ],
  define: {
    VERSION: JSON.stringify(pkg.version),
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'VueVirtualScroller',
      formats: ['es'],
      fileName: () => 'vue-virtual-scroller.js',
    },
    sourcemap: true,
    rollupOptions: {
      external: ['vue', 'mitt'],
    },
  },
})
