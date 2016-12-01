/* eslint-disable no-invalid-this */
import {setTimestamp, isObject} from './utils';

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
};

/**
 * @private
 *
 * Builds the expiration part for the cookie.
 *
 * @see utils.setTimestamp(options)
 *
 * @param  {Date|object} date: the expiration date
 * @return {string}
 */
function buildExpirationString(date) {
  let expires = (date instanceof Date ?
    setTimestamp({date}) :
    setTimestamp(date)
  );
  return `; expires=${expires.toUTCString()}`;
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
      let expires = '', cookie;
      options = Object.assign({path: '/'}, options);
      if (isObject(options.expires) || options.expires instanceof Date) {
        expires = buildExpirationString(options.expires);
      }
      cookie = `${key}=${encodeURIComponent(value)}${expires}; path=${options.path}`;
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
      return value;
    },

    removeItem(key) {
      api.setItem(key, '', {expires: {days: -1}});
    },

    clear() {
      const eq = '=';
      let indexEQ, key;
      $cookie.get().split(';').forEach((cookie) => {
        indexEQ = cookie.indexOf(eq);
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
