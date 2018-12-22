import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import vue from 'rollup-plugin-vue'
import cjs from 'rollup-plugin-commonjs'
import replace from 'rollup-plugin-replace'
import eslint from 'rollup-plugin-eslint'
import fs from 'fs'
import CleanCSS from 'clean-css'

const config = require('../package.json')

export default {
  input: 'src/index.js',
  plugins: [
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
    cjs(),
    eslint(),
    vue({
      css (style) {
        const file = require.resolve('vue-resize/dist/vue-resize.css')
        style += fs.readFileSync(file, { encoding: 'utf8' })
        fs.writeFileSync('dist/vue-virtual-scroller.css', new CleanCSS().minify(style).styles)
      },
    }),
    babel({
      exclude: 'node_modules/**',
      'plugins': [
        'external-helpers',
      ],
    }),
    replace({
      VERSION: JSON.stringify(config.version),
    }),
  ],
  watch: {
    include: 'src/**',
  },
  external: [
    'vue',
  ],
}
