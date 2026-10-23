import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))
const isTest = process.env.VITEST === 'true'
/** Relative static imports, re-exports, and import types in emitted declarations. */
const relativeDeclarationImport = /((?:\bfrom\s+|\bimport\s*\(\s*)['"])(\.\.?\/[^'"]+)(['"])/g
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
          cleanVueFileName: true,
          /** Add ESM extensions to generated declarations without changing source imports. */
          beforeWriteFile(filePath, content) {
            return {
              filePath,
              content: content.replace(
                relativeDeclarationImport,
                (_match, prefix, specifier, quote) =>
                  `${prefix}${specifier.endsWith('.js') ? specifier : `${specifier}.js`}${quote}`,
              ),
            }
          },
          /** Support both legacy and arbitrary-extension CSS declaration resolution. */
          afterBuild() {
            for (const suffix of ['css.d.ts', 'd.css.ts']) {
              writeFileSync(
                resolve(`dist/vue-virtual-scroller.${suffix}`),
                'declare const css: string;\nexport default css;\n',
              )
            }
          },
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
