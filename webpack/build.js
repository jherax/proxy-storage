const CleanWebpackPlugin = require('clean-webpack-plugin');
const {version} = require('../package.json');
const webpack = require('webpack');
const PATHS = require('./paths');

const banner = `proxyStorage@v${version}. Jherax 2017. Visit https://github.com/jherax/proxy-storage`;
const test = /\.min.js($|\?)/i;

const config = {
  entry: {
    'proxy-storage': PATHS.source.js,
    'proxy-storage.min': PATHS.source.js,
  },
  output: {
    path: PATHS.dist.folder,
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'proxyStorage', // global var in the browser
  },
  module: {
    rules: [
      {
        test: PATHS.source.folder,
        loader: 'babel-loader',
      },
      {
        test: PATHS.source.folder,
        enforce: 'pre', // preLoaders
        loader: 'eslint-loader',
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin([PATHS.dist.folder], {
      root: PATHS.project,
      verbose: true,
      // exclude: [],
    }),
    // https://webpack.js.org/guides/migrating/#uglifyjsplugin-minimize-loaders
    new webpack.LoaderOptionsPlugin({
      debug: false,
      minimize: true,
      options: {
        eslint: {
          // https://github.com/MoOx/eslint-loader
          // https://survivejs.com/webpack/developing/linting/#configuring-eslint-further
          configFile: '.eslintrc.json',
          failOnWarning: false,
          failOnError: true,
        },
      },
    }),
    // http://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
    new webpack.optimize.UglifyJsPlugin({
      test,
      minimize: true,
      sourceMap: true, // map error message locations to modules
      // https://github.com/mishoo/UglifyJS2#compressor-options
      compress: {
        warnings: true,
        dead_code: true,
        drop_debugger: true,
        drop_console: false,
      },
      mangle: {
        except: ['WebStorage'],
      },
    }),
    new webpack.BannerPlugin({banner, raw: false, entryOnly: true}),
    // https://webpack.github.io/docs/list-of-plugins.html#sourcemapdevtoolplugin
    new webpack.SourceMapDevToolPlugin({
      test,
      filename: '[name].map',
      // loaders generate SourceMaps and the source code is used
      module: true,
    }),
  ],
};

module.exports = config;
