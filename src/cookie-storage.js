import {isObject, setProperty} from './utils';
import formatMetadata from './format-metadata';
import buildExpiration from './expiration-date';

/**
 * @private
 *
 * Proxy for document.cookie
 *
 * @see
 * https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie
 *
 * @type {object}
 */
const $cookie = {
  get: () => document.cookie,
  set: (value) => {
    document.cookie = value;
  },
  data: {}, // metadata associated to the cookies
};

/**
 * @private
 *
 * Finds an element in the array.
 *
 * @param  {string} cookie: key=value
 * @return {boolean}
 */
function findCookie(cookie) {
  const nameEQ = this.toString();
  // prevent leading spaces before the key
  return cookie.trim().indexOf(nameEQ) === 0;
}

/**
 * @public
 *
 * Create, read, and delete elements from document.cookie,
 * and implements the Web Storage interface.
 *
 * @return {object}
 */
function cookieStorage() {
  const api = {

    setItem(key, value, options) {
      options = Object.assign({path: '/'}, options);
      // keep track of the metadata associated to the cookie
      $cookie.data[key] = {path: options.path};
      const metadata = $cookie.data[key];
      if (isObject(options.expires) || options.expires instanceof Date) {
        metadata.expires = buildExpiration(options.expires);
      }
      if (options.domain && typeof options.domain === 'string') {
        metadata.domain = options.domain.trim();
      }
      if (options.secure === true) metadata.secure = true;
      const cookie = `${key}=${encodeURIComponent(value)}${formatMetadata(metadata)}`;
      // TODO: should encodeURIComponent(key) ?
      $cookie.set(cookie);
    },

    getItem(key) {
      let value = null;
      const nameEQ = `${key}=`;
      const cookie = $cookie.get().split(';').find(findCookie, nameEQ);
      if (cookie) {
        // prevent leading spaces before the key name
        value = cookie.trim().substring(nameEQ.length, cookie.length);
        value = decodeURIComponent(value);
      }
      if (value === null) delete $cookie.data[key];
      return value;
    },

    // TODO: Add the method getAll() to get all cookies
    // https://github.com/jherax/proxy-storage/issues/6

    removeItem(key, options) {
      const metadata = Object.assign({}, $cookie.data[key], options);
      metadata.expires = {days: -1};
      api.setItem(key, '', metadata);
      delete $cookie.data[key];
    },

    clear() {
      let key, indexEQ;
      $cookie.get().split(';').forEach((cookie) => {
        indexEQ = cookie.indexOf('=');
        if (indexEQ > -1) {
          key = cookie.substring(0, indexEQ);
          // prevent leading spaces before the key
          api.removeItem(key.trim());
        }
      });
    },
  };

  return initialize(api);
}

/**
 * @private
 *
 * Copy the current items in the cookie storage.
 *
 * @param  {object} api: the storage mechanism to initialize
 * @return {object}
 */
function initialize(api) {
  // sets API members to read-only and non-enumerable
  for (let prop in api) { // eslint-disable-line
    setProperty(api, prop);
  }
  // copies all existing elements in the storage
  $cookie.get().split(';').forEach((cookie) => {
    const index = cookie.indexOf('=');
    const key = cookie.substring(0, index).trim();
    const value = cookie.substring(index + 1).trim();
    if (key) api[key] = decodeURIComponent(value);
  });
  return api;
}

/**
 * @public API
 */
export default cookieStorage;
