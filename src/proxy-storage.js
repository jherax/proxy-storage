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
 * Proxy for the default cookie storage associated with the current document.
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
  cookieStorage: initApi(cookieStorage()),
  memoryStorage: initApi(memoryStorage()),
};

/**
 * @private
 *
 * Adds the current elements in the storage object
 *
 * @param  {object} api: the API to initialize
 * @return {object}
 */
function initApi(api) {
  // sets read-only and non-enumerable properties
  for (let prop in api) { // eslint-disable-line
    if (prop !== 'initialize')
      setProperty(api, prop);
  }
  api.initialize();
  // this method is removed after being invoked
  // because is not part of the Web Storage interface
  delete api.initialize;
  return api;
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
  let descriptor = {
    configurable: false,
    enumerable: false,
    writable: false,
  };
  if (typeof value !== 'undefined') {
    descriptor.value = value;
  }
  Object.defineProperty(obj, name, descriptor);
}

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
 * @private
 *
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
    // TODO: make singleton by storageType to access the same stored elements
    setProperty(this, '__storage__', storageType);
    // copies all existing elements in the storage
    Object.keys(_proxy[storageType]).forEach((key) => {
      let value = _proxy[storageType][key];
      try {
        this[key] = JSON.parse(value);
      } catch (e) {
        this[key] = value;
      }
    });
  }
  /**
   * Stores a value given a key name.
   *
   * @param  {string} key: keyname of the storage
   * @param  {any} value: data to save in the storage
   * @param  {object} options: additional options for cookieStorage
   * @return {void}
   *
   * @memberOf WebStorage
   */
  setItem(key, value, options) {
    checkEmpty(key);
    this[key] = value;
    executeInterceptors('setItem', key, value, options);
    value = JSON.stringify(value);
    _proxy[this.__storage__].setItem(key, value, options);
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
    const value = _proxy[this.__storage__].getItem(key);
    return JSON.parse(value);
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
    delete this[key];
    executeInterceptors('removeItem', key);
    _proxy[this.__storage__].removeItem(key);
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
    Object.keys(this).forEach((key) => delete this[key]);
    _proxy[this.__storage__].clear();
  }
  /**
   * Gets the number of data items stored in the Storage object.
   *
   * @readonly
   *
   * @memberOf WebStorage
   */
  get length() {
    return Object.keys(this).length;
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
 * @public
 *
 * Get/Set the storage mechanism to use by default.
 * @type {object}
 */
const configStorage = {
  get() {
    return storage.__storage__;
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
  },
};

/**
 * @private
 *
 * Determines whether a value is a plain object
 *
 * @param  {any} value: the object to test
 * @return {boolean}
 */
function isObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

/**
 * @private
 *
 * Allows add or subtract timestamps to the current date or to a specific date.
 * @param  {object} options: It contains the timestamps to add or remove to the date, and have the following properties:
 *         - {Date} date: if provided, the timestamps will affect this date, otherwise a new current date will be used.
 *         - {number} hours: hours to add/subtract
 *         - {number} days: days to add/subtract
 *         - {number} months: months to add/subtract
 *         - {number} years: years to add/subtract
 * @return {Date}
 */
function setTimestamp(options = {}) {
  const opt = Object.assign({}, options);
  let d = opt.date instanceof Date ? opt.date : new Date();
  if (+opt.hours) d.setHours(d.getHours() + opt.hours);
  if (+opt.days) d.setDate(d.getDate() + opt.days);
  if (+opt.months) d.setMonth(d.getMonth() + opt.months);
  if (+opt.years) d.setFullYear(d.getFullYear() + opt.years);
  return d;
}

/**
 * @private
 *
 * Builds the expiration part for the cookie
 *
 * @param  {Date|object} date: the expiration date. See `setTimestamp(options)`
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
 * Manages actions for creation/reading/deleting cookies.
 * Implements Web Storage interface methods.
 *
 * @return {object}
 */
function cookieStorage() {
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
      let value = void 0;
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

    initialize() {
      $cookie.get().split(';').forEach((cookie) => {
        const index = cookie.indexOf('=');
        const key = cookie.substring(0, index).trim();
        const value = cookie.substring(index + 1).trim();
        api[key] = decodeURIComponent(value);
      });
    },
  };
  return api;
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
      hashtable[key] = value;
      setStoreToWindow(hashtable);
    },
    getItem(key) {
      return hashtable[key];
    },
    removeItem(key) {
      delete hashtable[key];
      setStoreToWindow(hashtable);
    },
    clear() {
      Object.keys(hashtable).forEach((key) => delete hashtable[key]);
      setStoreToWindow(hashtable);
    },
    initialize() {
      Object.assign(api, hashtable);
    },
  };
  return api;
}

/**
 * @private
 *
 * Gets the hashtable-store from the current window.
 * @return {object}
 */
function getStoreFromWindow() {
  try {
    const store = JSON.parse(window.self.name);
    if (store && typeof store === 'object') return store;
  } catch (e) {
    return {};
  }
}

/**
 * @private
 *
 * Saves the hashtable-store in the current window.
 * @param  {object} hashtable: {key,value} pairs stored in memoryStorage
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
