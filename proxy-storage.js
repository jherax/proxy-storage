/* eslint-disable no-use-before-define, one-var, max-len */

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

/**
 * @private
 *
 * Proxy for Web Storage and Cookies.
 * All members implement the Web Storage interface.
 *
 * @Reference
 * https://developer.mozilla.org/en-US/docs/Web/API/Storage
 *
 * @type {Object}
 */
const proxy = {
  localStorage: window.localStorage,
  sessionStorage: window.sessionStorage,
  cookieStorage: cookieStorage(),
  memoryStorage: memoryStorage(),
};

/**
 * @private
 *
 * Validates if the key is not empty.
 * (null, undefined or empty string)
 * @param  {String} key
 */
function checkEmpty(key) {
  if (key == null || key === '') { // eslint-disable-line
    throw new Error('The key provided can not be empty');
  }
}

/**
 * @public
 *
 * Implementation of the Web Storage interface.
 * It saves and retrieves values as JSON.
 *
 * @Reference
 * https://developer.mozilla.org/en-US/docs/Web/API/Storage
 *
 * @type {Class}
 */
class WebStorage {
  // @param {String} storageType: it can be "localStorage", "sessionStorage", "cookieStorage", or "memoryStorage"
  constructor(storageType) {
    if (!proxy.hasOwnProperty(storageType)) {
      throw new Error(`Storage type "${storageType}" is not valid`);
    }
    Object.defineProperty(this, '__storage', {
      configurable: false,
      enumerable: false,
      writable: false,
      value: proxy[storageType],
    });
  }
  setItem(key, value) {
    checkEmpty(key);
    value = JSON.stringify(value);
    this.__storage.setItem(key, value);
  }
  getItem(key) {
    checkEmpty(key);
    const value = this.__storage.getItem(key);
    return JSON.parse(value);
  }
  removeItem(key) {
    checkEmpty(key);
    this.__storage.removeItem(key);
  }
  clear() {
    this.__storage.clear();
  }
}

/**
 * @public
 *
 * Determines which storage mechanisms are available.
 *
 * @type {Object}
 */
const isAvaliable = {
  localStorage: false,
  sessionStorage: false,
  cookieStorage: false,
  memoryStorage: true,
};

/**
 * @public
 *
 * Current storage mechanism.
 * @type {Object}
 */
let storage = null;
let currentStorageName = null;

/**
 * @public
 *
 * Get/Set the storage mechanism to use by default.
 *
 * @param {String} storageType: it can be "localStorage", "sessionStorage", "cookieStorage", or "memoryStorage"
 */
const configStorage = {
  get() {
    return currentStorageName;
  },
  set(storageType) {
    if (!proxy.hasOwnProperty(storageType)) {
      throw new Error(`Storage type "${storageType}" is not valid`);
    }
    storage = new WebStorage(storageType);
    currentStorageName = storageType;
  },
};

/**
 * @private
 *
 * Alias for the default cookie storage associated with the current document.
 *
 * @Reference
 * https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie
 *
 * @type {Object}
 */
const $cookie = {
  get: () => document.cookie,
  set: (value) => { document.cookie = value },
};

/**
 * @private
 *
 * Manages actions for creation/reading/deleting cookies.
 * Implements Web Storage interface methods.
 *
 * @return {Object}
 */
function cookieStorage() {
  const api = {
    setItem(key, value, days, path = '/') {
      let expires = '';
      if (days) {
        const date = new Date();
        days = days * 24 * 60 * 60 * 1000;
        date.setTime(date.getTime() + days);
        expires = `; expires=${date.toUTCString()}`;
      }
      $cookie.set(`${key}=${encodeURIComponent(value)}${expires}; path=${path}`);
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
      api.setItem(key, '', -1);
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
  };
  return api;
}

/**
 * @private
 *
 * Callback that finds an element in the array.
 * @param  {String} cookie: key=value
 * @return {Boolean}
 */
function findCookie(cookie) {
  const nameEQ = this.toString();
  // prevent leading spaces before the key
  return cookie.trim().indexOf(nameEQ) === 0;
}

/**
 * @private
 *
 * Callback that finds an element in the array.
 * @param  {Object} item: {key, value}
 * @return {Boolean}
 */
function findItem(item) {
  const key = this.toString();
  return item.key === key;
}

/**
 * @private
 *
 * Manages actions for creation/reading/deleting data in memory.
 * Implements Web Storage interface methods.
 * It also adds a hack to persist the store as a session in the current window.
 *
 * @return {Object}
 */
function memoryStorage() {
  const hashtable = getStoreFromWindow();
  const api = {
    setItem(key, value) {
      const item = hashtable.find(findItem, key);
      if (item) item.value = value;
      else hashtable.push({ key, value });
      setStoreToWindow(hashtable);
    },
    getItem(key) {
      const item = hashtable.find(findItem, key);
      if (item) return item.value;
      return null;
    },
    removeItem(key) {
      const index = hashtable.findIndex(findItem, key);
      if (index > -1) hashtable.splice(index, 1);
      setStoreToWindow(hashtable);
    },
    clear() {
      hashtable.length = 0;
      setStoreToWindow(hashtable);
    },
  };
  return api;
}

/**
 * @private
 *
 * Gets the hashtable store from the current window.
 * @return {Array}
 */
function getStoreFromWindow() {
  try {
    const store = JSON.parse(window.self.name);
    if (store instanceof Array) return store;
  } catch (e) {} // eslint-disable-line
  return []; /* {key,value} */
}

/**
 * @private
 *
 * Saves the hashtable store in the current window.
 */
function setStoreToWindow(hashtable) {
  const store = JSON.stringify(hashtable);
  window.self.name = store;
}

/**
 * @private
 *
 * Checks whether a storage mechanism is available.
 * @param {String} storageType: it can be "localStorage", "sessionStorage", "cookieStorage", or "memoryStorage"
 * @return {Boolean}
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
 * Sets the default storage mechanism available.
 * @param {String} storageType: it can be "localStorage", "sessionStorage", "cookieStorage", or "memoryStorage"
 * @return {Boolean}
 */
function storageAvaliable(storageType) {
  if (isAvaliable[storageType]) {
    configStorage.set(storageType);
  }
  return isAvaliable[storageType];
}

/**
 * @private
 *
 * Initializes the module.
 */
function init() {
  isAvaliable.localStorage = isStorageAvailable('localStorage');
  isAvaliable.sessionStorage = isStorageAvailable('sessionStorage');
  isAvaliable.cookieStorage = isStorageAvailable('cookieStorage');
  // sets the default storage mechanism available
  Object.keys(isAvaliable).some(storageAvaliable);
}

init();

// @public
export { storage as default, WebStorage, configStorage, isAvaliable };
