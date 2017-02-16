const path = require('path');

const dist = path.resolve(__dirname, '../dist');
const source = path.resolve(__dirname, '../src');
const jsSource = path.resolve(source, 'proxy-storage.js');
const jsDist = path.resolve(dist, 'proxy-storage.js');

module.exports = {
  dist: {
    folder: dist,
    js: jsDist,
  },
  source: {
    folder: source,
    js: jsSource,
  },
};
