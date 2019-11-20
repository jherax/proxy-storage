const {resolve} = require('path');

const dist = resolve(__dirname, '../dist');
const source = resolve(__dirname, '../src');

module.exports = {
  project: resolve(__dirname, '../'),
  dist: {
    folder: dist,
  },
  source: {
    folder: source,
    js: resolve(source, 'proxy-storage.js'),
    polyfill: resolve(source, 'polyfill.ts'),
  },
};
