import base from './rollup.config.base'

const config = Object.assign({}, base, {
  output: {
    name: 'vue-virtual-scroller',
    file: 'dist/vue-virtual-scroller.esm.js',
    format: 'es',
  },
  external: [
    'scrollparent',
    'vue-observe-visibility',
    'vue-resize',
  ],
})

export default config
