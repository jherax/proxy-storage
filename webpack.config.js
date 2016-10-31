var webpack = require('webpack');
var path = require('path');

var dir_js = path.resolve(__dirname, 'src');
var file_js = path.resolve(dir_js, 'proxy-storage.js');
var dir_dist = path.resolve(__dirname, 'dist');

module.exports = {
  entry: {
    'proxy-storage': file_js,
    'proxy-storage.min': file_js,
  },
  output: {
    path: dir_dist,
    filename: '[name].js'
  },
  module: {
    loaders: [{
      loader: 'babel-loader',
      test: dir_js,
    }]
  },
  plugins: [
    // http://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
    new webpack.optimize.UglifyJsPlugin({
      test: /\.min.js($|\?)/i,
      minimize: true,
    }),
    new webpack.SourceMapDevToolPlugin({
      filename: '[file].map',
      exclude: [
        'proxy-storage.min.js'
      ]
    }),
  ],

};
