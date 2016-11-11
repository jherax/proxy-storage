/* eslint-disable no-use-before-define, no-invalid-this */

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

// If you want to support all ES6 features, uncomment the next line
// import 'babel-polyfill';

/**
 * @private
 *
 * Proxy for Web Storage and Cookies.
 * All members implement the Web Storage interface.
 *
 * @Reference
 * https://developer.mozilla.org/en-US/docs/Web/API/Storage
 *
 * @type {object}
 */
const _proxy = {
  localStorage: window.localStorage,
  sessionStorage: window.sessionStorage,
  cookieStorage: cookieStorage(),
  memoryStorage: memoryStorage(),
};

/**
 * @private
 *
 * Stores the interceptors for WebStorage methods
 *
 * @type {object}
 */
const _interceptors = {
  setItem: [],
  getItem: [],
  removeItem: [],
  clear: [],
};

/**
 * Executes the interceptors of a WebStorage method
 *
 * @param  {string} command: name of the method to intercept
 * @return {void}
 */
function executeInterceptors(command, ...args) {
  _interceptors[command].forEach((action) => action(...args));
}

/**
 * @private
 *
 * Validates if the key is not empty.
 * (null, undefined or empty string)
 * @param  {string} key: keyname of the storage
 * @return {void}
 */
function checkEmpty(key) {
  if (key == null || key === '') {
    throw new Error('The key provided can not be empty');
  }
}

/**
 * @private
 *
 * Creates a non-enumerable read-only property.
 *
 * @param  {object} obj: the object to add the property
 * @param  {string} name: the name of the property
 * @param  {any} value: the value of the property
 * @return {void}
 */
function setProperty(obj, name, value) {
  Object.defineProperty(obj, name, {
    configurable: false,
    enumerable: false,
    writable: false,
    value: value,
  });
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
  /**
   * Creates an instance of WebStorage.
   *
   * @param {string} storageType: it can be "localStorage", "sessionStorage", "cookieStorage", or "memoryStorage"
   *
   * @memberOf WebStorage
   */
  constructor(storageType) {
    if (!_proxy.hasOwnProperty(storageType)) {
      throw new Error(`Storage type "${storageType}" is not valid`);
    }
    setProperty(this, '__storage', _proxy[storageType]);
  }
  /**
   * Stores a value given a key name.
   *
   * @param  {string} key: keyname of the storage
   * @param  {any} value: data to save in the storage
   * @return {void}
   *
   * @memberOf WebStorage
   */
  setItem(key, value) {
    checkEmpty(key);
    executeInterceptors('setItem', key, value);
    value = JSON.stringify(value);
    this.__storage.setItem(key, value);
  }
  /**
   * Retrieves a value by its key name.
   *
   * @param  {string} key: keyname of the storage
   * @return {void}
   *
   * @memberOf WebStorage
   */
  getItem(key) {
    checkEmpty(key);
    executeInterceptors('getItem', key);
    const value = JSON.parse(this.__storage.getItem(key));
    return value;
  }
  /**
   * Deletes a key from the storage.
   *
   * @param  {string} key: keyname of the storage
   * @return {void}
   *
   * @memberOf WebStorage
   */
  removeItem(key) {
    checkEmpty(key);
    executeInterceptors('removeItem', key);
    this.__storage.removeItem(key);
  }
  /**
   * Removes all keys from the storage.
   *
   * @return {void}
   *
   * @memberOf WebStorage
   */
  clear() {
    executeInterceptors('clear');
    this.__storage.clear();
  }
  /**
   * Adds an interceptor to a WebStorage method
   *
   * @param  {string} command: name of the API method to intercept
   * @param  {function} action: callback executed when the API method is called
   * @return {void}
   *
   * @memberOf WebStorage
   */
  static interceptors(command, action) {
    if (command in _interceptors && typeof action === 'function')
      _interceptors[command].push(action);
  }
}

/**
 * @public
 *
 * Determines which storage mechanisms are available.
 *
 * @type {object}
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
 * @type {object}
 */
let storage = null;

/**
 * @private
 *
 * Current storage type
 * @type {string}
 */
let _currentStorageName = null;

/**
 * @public
 *
 * Get/Set the storage mechanism to use by default.
 * @type {object}
 */
const configStorage = {
  get() {
    return _currentStorageName;
  },

  /**
   * Sets the storage mechanism to use by default.
   * @param  {string} storageType: it can be "localStorage", "sessionStorage", "cookieStorage", or "memoryStorage"
   * @return {void}
   */
  set(storageType) {
    if (!_proxy.hasOwnProperty(storageType)) {
      throw new Error(`Storage type "${storageType}" is not valid`);
    }
    storage = new WebStorage(storageType);
    _currentStorageName = storageType;
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
 * Manages actions for creation/reading/deleting cookies.
 * Implements Web Storage interface methods.
 *
 * @return {object}
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
 * @param  {string} cookie: key=value
 * @return {boolean}
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
 * @param  {object} item: {key, value}
 * @return {boolean}
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
 * @return {object}
 */
function memoryStorage() {
  const hashtable = getStoreFromWindow();
  const api = {
    setItem(key, value) {
      const item = hashtable.find(findItem, key);
      if (item) item.value = value;
      else hashtable.push({key, value});
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
 * @return {array}
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
 * @param  {array} hashtable: list of objects stored in memoryStorage
 * @return {void}
 */
function setStoreToWindow(hashtable) {
  const store = JSON.stringify(hashtable);
  window.self.name = store;
}

/**
 * @private
 *
 * Checks whether a storage mechanism is available.
 * @param  {string} storageType: it can be "localStorage", "sessionStorage", "cookieStorage", or "memoryStorage"
 * @return {boolean}
 */
function isStorageAvailable(storageType) {
  const storageObj = _proxy[storageType];
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
 * @param  {string} storageType: it can be "localStorage", "sessionStorage", "cookieStorage", or "memoryStorage"
 * @return {boolean}
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
 * @return {void}
 */
function init() {
  isAvaliable.localStorage = isStorageAvailable('localStorage');
  isAvaliable.sessionStorage = isStorageAvailable('sessionStorage');
  isAvaliable.cookieStorage = isStorageAvailable('cookieStorage');
  // sets the default storage mechanism available
  Object.keys(isAvaliable).some(storageAvaliable);
}

init();

// @public API
export {storage as default, WebStorage, configStorage, isAvaliable};
