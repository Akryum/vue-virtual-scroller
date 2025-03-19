import { terser } from 'rollup-plugin-terser'
import base from './rollup.config.base'

const config = Object.assign({}, base, {
  output: {
    exports: 'named',
    name: 'VueVirtualScroller',
    file: 'dist/vue-virtual-scroller.min.js',
    format: 'iife',
    sourcemap: true,
    globals: {
      vue: 'Vue',
    },
  },
})

config.plugins.push(terser())

export default config
