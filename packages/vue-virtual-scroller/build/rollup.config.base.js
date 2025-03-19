import { babel } from '@rollup/plugin-babel'
import cjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import replace from '@rollup/plugin-replace'
import autoprefixer from 'autoprefixer'
import CleanCSS from 'clean-css'
import fs from 'fs-extra'
import css from 'rollup-plugin-css-only'
import vue from 'rollup-plugin-vue'

const config = require('../package.json')

export default {
  input: 'src/index.js',
  plugins: [
    resolve({
      mainFields: ['module', 'jsnext', 'main', 'browser'],
    }),
    vue({
      css: false,
      style: {
        postcssPlugins: [autoprefixer],
      },
    }),
    css({
      output: (styles) => {
        const file = require.resolve('vue-resize/dist/vue-resize.css')
        styles += fs.readFileSync(file, { encoding: 'utf8' })
        fs.ensureDirSync('dist')
        fs.writeFileSync('dist/vue-virtual-scroller.css', new CleanCSS().minify(styles).styles)
      },
    }),
    babel({
      exclude: 'node_modules/**',
    }),
    cjs({
      include: /node_modules/,
    }),
    replace({
      VERSION: JSON.stringify(config.version),
      preventAssignment: true,
    }),
  ],
  watch: {
    include: 'src/**',
  },
  external: [
    'vue',
  ],
}
