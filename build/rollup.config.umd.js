import base from './rollup.config.base'

const config = Object.assign({}, base, {
  output: {
    exports: 'named',
    name: 'vue-virtual-scroller',
    file: 'dist/vue-virtual-scroller.umd.js',
    format: 'umd',
  },
})

export default config
