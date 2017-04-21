/**
 * This library uses an adapter that implements the Web Storage interface,
 * which is very useful to deal with the lack of compatibility between
 * document.cookie and localStorage and sessionStorage.
 *
 * It also provides a memoryStorage fallback that stores the data in memory
 * when all of above mechanisms are not available.
 *
 * Author: David Rivera
 * Github: https://github.com/jherax
 * License: "MIT"
 *
 * You can fork this project on github:
 * https://github.com/jherax/proxy-storage.git
 */

import WebStorage, {proxy, webStorageSettings} from './web-storage';
import {isAvailable} from './is-available';

/**
 * @public
 *
 * Current storage mechanism.
 *
 * @type {object}
 */
let storage = null;

/**
 * @public
 *
 * Get/Set the storage mechanism to use by default.
 *
 * @type {object}
 */
const configStorage = {
  get() {
    return storage.__storage__;
  },

  /**
   * Sets the storage mechanism to use by default.
   *
   * @param  {string} storageType: it can be "localStorage", "sessionStorage", "cookieStorage", or "memoryStorage"
   * @return {void}
   */
  set(storageType) {
    if (!Object.prototype.hasOwnProperty.call(proxy, storageType)) {
      throw new Error(`Storage type "${storageType}" is not valid`);
    }
    storage = new WebStorage(storageType);
  },
};

/**
 * @private
 *
 * Checks whether a storage mechanism is available.
 *
 * @param  {string} storageType: it can be "localStorage", "sessionStorage", "cookieStorage", or "memoryStorage"
 * @return {boolean}
 */
function isStorageAvailable(storageType) {
  const storageObj = proxy[storageType];
  const data = '__proxy-storage__';
  try {
    storageObj.setItem(data, data);
    storageObj.removeItem(data);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * @private
 *
 * Sets the first or default storage available.
 *
 * @param  {string} storageType: it can be "localStorage", "sessionStorage", "cookieStorage", or "memoryStorage"
 * @return {boolean}
 */
function storageAvailable(storageType) {
  if (isAvailable[storageType]) {
    webStorageSettings.default = storageType;
    configStorage.set(storageType);
  }
  return isAvailable[storageType];
}

/**
 * @private
 *
 * Initializes the module.
 *
 * @return {void}
 */
function init() {
  isAvailable.localStorage = isStorageAvailable('localStorage');
  isAvailable.sessionStorage = isStorageAvailable('sessionStorage');
  isAvailable.cookieStorage = isStorageAvailable('cookieStorage');
  webStorageSettings.isAvailable = isAvailable;
  // sets the default storage mechanism available
  Object.keys(isAvailable).some(storageAvailable);
}

init();

// @public API
export {storage as default, WebStorage, configStorage, isAvailable};
