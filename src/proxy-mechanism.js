import cookieStorage from './cookie-storage';
import memoryStorage from './memory-storage';

/**
 * @public
 *
 * Proxy for the storage mechanisms.
 * All members implement the Web Storage interface.
 *
 * @see
 * https://developer.mozilla.org/en-US/docs/Web/API/Storage
 *
 * @type {object}
 */
export const proxy = {
  localStorage: window.localStorage,
  sessionStorage: window.sessionStorage,
  cookieStorage: cookieStorage(),
  memoryStorage: memoryStorage(),
};
