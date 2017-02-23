import cookieStorage from './cookie-storage';
import memoryStorage from './memory-storage';
import {setProperty} from './utils';

/**
 * @private
 *
 * Adds the current elements in the storage object.
 *
 * @param  {object} api: the storage mechanism to initialize
 * @return {object}
 */
function initApi(api) {
  if (!api.initialize) return api;
  // sets read-only and non-enumerable properties
  for (let prop in api) { // eslint-disable-line
    if (prop !== 'initialize') {
      setProperty(api, prop);
    }
  }
  api.initialize();
  // this method is removed after being invoked
  // because is not part of the Web Storage interface
  delete api.initialize;
  return api;
}

/**
 * @public
 *
 * Proxy for storage mechanisms.
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
