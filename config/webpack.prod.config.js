var webpack = require('webpack')
var merge = require('webpack-merge')
var base = require('./webpack.base.config')

module.exports = merge(base, {
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: true,
      },
      mangle: false,
    }),
  ],
})
