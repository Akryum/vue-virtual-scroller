import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import vue from 'rollup-plugin-vue'
import cjs from 'rollup-plugin-commonjs'
import replace from 'rollup-plugin-replace'
import fs from 'fs'
import path from 'path'
import CleanCSS from 'clean-css'

const config = require('../package.json')

export default {
  input: 'src/index.js',
  name: 'vue-virtual-scroller',
  plugins: [
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
    cjs(),
    vue({
      css (style) {
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
}
