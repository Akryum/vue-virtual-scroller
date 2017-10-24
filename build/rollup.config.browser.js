import base from './rollup.config.base'
import uglify from 'rollup-plugin-uglify'
import { minify } from 'uglify-es'

const config = Object.assign({}, base, {
  exports: 'named',
  output: {
    file: 'dist/vue-virtual-scroller.min.js',
    format: 'iife',
  },
  name: 'VueVirtualScroller',
})

config.plugins.push(uglify({}, minify))

export default config
