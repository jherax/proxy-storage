const webpack = require('webpack');
const validate = require('webpack-validator');
const PATHS = require('./paths');

const config = {
  entry: {
    'proxy-storage.min': PATHS.dist.js,
  },
  output: {
    path: PATHS.dist.folder,
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'proxyStorage',
  },
  plugins: [
    // http://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
    new webpack.optimize.UglifyJsPlugin({
      test: /\.min.js($|\?)/i,
      minimize: true,
      // https://github.com/mishoo/UglifyJS2#compressor-options
      compress: {
        dead_code: true,
        drop_debugger: true,
        drop_console: false,
      },
      mangle: {
        except: ['WebStorage'],
      },
    }),
    // https://webpack.github.io/docs/list-of-plugins.html#sourcemapdevtoolplugin
    new webpack.SourceMapDevToolPlugin({
      filename: '[file].map',
      exclude: [
        'proxy-storage.js',
      ],
    }),
  ],

};

module.exports = validate(config);
