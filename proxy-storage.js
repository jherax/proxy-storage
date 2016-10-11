'use strict';

/**
 * @public
 *
 * Proxy for Web Storage and Cookies.
 *
 * Reference:
 * https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API
 *
 * @type {Object}
 */
const proxy = {
  localStorage: window.localStorage,
  sessionStorage: window.sessionStorage,
  cookie: cookieStorage()
};

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
  cookie: false
};

/**
 * Current storage mechanism.
 * @type {Object}
 */
let currentStorage = null;
let currentStorageName = null;

/**
 * @public
 *
 * WebStorage interface to export (basic API)
 * It saves the Object values as JSON.
 *
 * Reference:
 * https://developer.mozilla.org/en-US/docs/Web/API/Storage
 *
 * @type {Object}
 */
const webStorage = {
  setItem(key, value) {
    value = JSON.stringify(value);
    currentStorage.setItem(key, value);
  },
  getItem(key) {
    let value = currentStorage.getItem(key);
    return JSON.parse(value);
  },
  removeItem(key) {
    currentStorage.removeItem(key);
  }
};

/**
 * @public
 *
 * Get/Set the storage type to use by default.
 *
 * @param {String} storageType: it can be "localStorage", "sessionStorage", or "cookie"
 */
const configStorage = {
  get() {
    return currentStorageName;
  },
  set(storageType) {
    if (!proxy.hasOwnProperty(storageType))
      throw new Error(`Storage type "${storageType}" does not exist`);
    currentStorage = proxy[storageType];
    currentStorageName = storageType;
  }
};

/**
 * Alias for cookie object.
 *
 * Reference:
 * https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie
 *
 * @type {Object}
 */
const $cookie = {
  get: () => document.cookie,
  set: (value) => document.cookie = value
};

/**
 * Manages the creation/read/remove cookies.
 * Implements Web Storage interface methods.
 *
 * @type {Object}
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
      $cookie.set(`${key}=${value}${expires}; path=${path}`);
    },

    getItem(key) {
      const nameEQ = `${key}=`;
      let cookie = $cookie.get().split(';').find(findCookie, nameEQ);
      if (cookie) return cookie.substring(nameEQ.length, cookie.length);
      return null;
    },

    removeItem(key) {
      this.setItem(key, '', -1);
    }
  };
  return api;
}

/**
 * Callback running for each cookie in the array.
 * @param  {String} cookie: key/value
 * @return {String}
 */
function findCookie(cookie) {
  var nameEQ = this.toString();
  return cookie.trim().indexOf(nameEQ) === 0;
}

/**
 * Checks whether the storage type is available.
 * @param  {String} storageType: it can be "localStorage", "sessionStorage", or "cookie"
 * @return {Boolean}
 */
function storageAvailable(storageType) {
  let storage = proxy[storageType];
  let data = '__proxy-storage__';
  try {
    storage.setItem(data, data);
    storage.removeItem(data);
    return true;
  }
  catch(e) {
    return false;
  }
}

/**
 * Sets the default storage mechanism.
 * @param  {String} storageType: it can be "localStorage", "sessionStorage", or "cookie"
 * @return {Boolean}
 */
function isStorageAvaliable(storageType) {
  if (isAvaliable[storageType]) {
    configStorage.set(storageType);
  }
  return isAvaliable[storageType];
}

/**
 * Initializes the module.
 */
function init() {
  isAvaliable.localStorage = storageAvailable('localStorage');
  isAvaliable.sessionStorage = storageAvailable('sessionStorage');
  isAvaliable.cookie = storageAvailable('cookie');
  // sets the default storage mechanism
  if (!Object.keys(isAvaliable).some(isStorageAvaliable)) {
    // TODO: implement an internal session storage as fallback
  }
}

init();

// @public
export { webStorage as default, proxy, configStorage, isAvaliable };
