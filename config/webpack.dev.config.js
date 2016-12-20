var merge = require('webpack-merge')
var base = require('./webpack.base.config')

module.exports = merge(base, {
  devtool: 'eval-source-map',
})
