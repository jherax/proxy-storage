import cookieStorage from './cookie-storage';
import memoryStorage from './memory-storage';
import {setProperty} from './utils';

/**
 * @private
 *
 * Copy the current items in the storage mechanism.
 *
 * @param  {object} api: the storage mechanism to initialize
 * @return {object}
 */
function initApi(api) {
  if (!api.initialize) return api;
  // sets API members to read-only and non-enumerable
  for (let prop in api) { // eslint-disable-line
    if (prop !== 'initialize') {
      setProperty(api, prop);
    }
  }
  api.initialize();
  return api;
}

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
  cookieStorage: initApi(cookieStorage()),
  memoryStorage: initApi(memoryStorage()),
};
