/* eslint-disable no-invalid-this */
import {alterDate, isObject} from './utils';

/**
 * @private
 *
 * Proxy for the default cookie storage associated with the current document.
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
 * Builds the expiration part for the cookie.
 *
 * @see utils.alterDate(options)
 *
 * @param  {Date|object} date: the expiration date
 * @return {string}
 */
function buildExpirationString(date) {
  const expires = (date instanceof Date ?
    alterDate({date}) :
    alterDate(date)
  );
  return expires.toUTCString();
}

/**
 * @private
 *
 * Builds the string for the cookie's metadata.
 *
 * @param  {string} key: name of the metadata
 * @param  {object} data: metadata of the cookie
 * @return {string}
 */
function buildMetadataFor(key, data) {
  if (!data[key]) return '';
  return `; ${key}=${data[key]}`;
}

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
 * Create, read, and delete elements from document cookies
 * and implements the Web Storage interface.
 *
 * @return {object}
 */
export default function cookieStorage() {
  const api = {
    setItem(key, value, options) {
      options = Object.assign({path: '/'}, options);
      // keep track of the metadata associated to the cookie
      $cookie.data[key] = {path: options.path};
      const metadata = $cookie.data[key];
      if (isObject(options.expires) || options.expires instanceof Date) {
        metadata.expires = buildExpirationString(options.expires);
      }
      if (options.domain && typeof options.domain === 'string') {
        metadata.domain = options.domain.trim();
      }
      const expires = buildMetadataFor('expires', metadata);
      const domain = buildMetadataFor('domain', metadata);
      const path = buildMetadataFor('path', metadata);
      const cookie = `${key}=${encodeURIComponent(value)}${expires}${domain}${path}`;
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

    removeItem(key, options) {
      const metadata = Object.assign({}, $cookie.data[key], options);
      metadata.expires = {days: -1};
      api.setItem(key, '', metadata);
      delete $cookie.data[key];
    },

    clear() {
      let key, indexEQ; // eslint-disable-line
      $cookie.get().split(';').forEach((cookie) => {
        indexEQ = cookie.indexOf('=');
        if (indexEQ > -1) {
          key = cookie.substring(0, indexEQ);
          // prevent leading spaces before the key
          api.removeItem(key.trim());
        }
      });
    },

    // this method will be removed after being invoked
    // because is not part of the Web Storage interface
    initialize() {
      $cookie.get().split(';').forEach((cookie) => {
        const index = cookie.indexOf('=');
        const key = cookie.substring(0, index).trim();
        const value = cookie.substring(index + 1).trim();
        // copies all existing elements in the storage
        if (key) api[key] = decodeURIComponent(value);
      });
    },
  };
  return api;
}
