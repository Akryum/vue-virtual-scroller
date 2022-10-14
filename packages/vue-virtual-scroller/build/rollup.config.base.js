import babel from 'rollup-plugin-babel'
import resolve from '@rollup/plugin-node-resolve'
import vue from 'rollup-plugin-vue'
import cjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import css from 'rollup-plugin-css-only'
import autoprefixer from 'autoprefixer'
import fs from 'fs-extra'
import CleanCSS from 'clean-css'

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
      output: styles => {
        fs.ensureDirSync('dist')
        const file = require.resolve('vue-resize/dist/vue-resize.css')
        styles += fs.readFileSync(file, { encoding: 'utf8' })
        fs.writeFileSync('dist/vue-virtual-scroller.css', new CleanCSS().minify(styles).styles)
      },
    }),
    babel({
      exclude: 'node_modules/**',
    }),
    cjs(),
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
