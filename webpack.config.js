const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const validate = require('webpack-validator');
const PATHS = require('./webpack/paths');

const config = {
  entry: {
    'proxy-storage': PATHS.source.js,
  },
  output: {
    path: PATHS.dist.folder,
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'proxyStorage',
  },
  module: {
    loaders: [{
      loaders: ['babel-loader', 'eslint-loader'],
      test: PATHS.source.folder,
    }],
  },
  // https://github.com/MoOx/eslint-loader
  eslint: {
    configFile: '.eslintrc.json',
    failOnError: true,
    emitError: true,
  },
  plugins: [
    new CleanWebpackPlugin([PATHS.dist.folder]),
    // Search for equal or similar files and deduplicate them in the output
    // https://webpack.github.io/docs/list-of-plugins.html#dedupeplugin
    // Note: Don’t use it in watch mode. Only for production builds.
    new webpack.optimize.DedupePlugin(),
  ],

};

module.exports = validate(config);
