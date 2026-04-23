import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))
const isTest = process.env.VITEST === 'true'
const libraryEntries = {
  'vue-virtual-scroller': resolve('src/index.ts'),
  'components/DynamicScroller': resolve('src/components/DynamicScroller.vue'),
  'components/DynamicScrollerItem': resolve('src/components/DynamicScrollerItem.vue'),
  'components/RecycleScroller': resolve('src/components/RecycleScroller.vue'),
  'components/WindowScroller': resolve('src/components/WindowScroller.vue'),
  'composables/useDynamicScroller': resolve('src/composables/useDynamicScroller.ts'),
  'composables/useDynamicScrollerItem': resolve('src/composables/useDynamicScrollerItem.ts'),
  'composables/useIdState': resolve('src/composables/useIdState.ts'),
  'composables/useRecycleScroller': resolve('src/composables/useRecycleScroller.ts'),
  'composables/useTableColumnWidths': resolve('src/composables/useTableColumnWidths.ts'),
  'composables/useWindowScroller': resolve('src/composables/useWindowScroller.ts'),
}

export default defineConfig({
  plugins: [
    vue(),
    ...(!isTest
      ? [dts({
          tsconfigPath: './tsconfig.build.json',
          entryRoot: 'src',
          strictOutput: true,
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
    cssCodeSplit: false,
    lib: {
      entry: libraryEntries,
      name: 'VueVirtualScroller',
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
      cssFileName: 'vue-virtual-scroller',
    },
    sourcemap: true,
    rollupOptions: {
      external: ['vue'],
    },
  },
})
