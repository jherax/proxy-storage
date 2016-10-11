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
  cookie: cookieStorage(),
  memory: memoryStorage()
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
  cookie: false,
  memory: true
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
    checkEmpty(key);
    value = JSON.stringify(value);
    currentStorage.setItem(key, value);
  },
  getItem(key) {
    checkEmpty(key);
    let value = currentStorage.getItem(key);
    return JSON.parse(value);
  },
  removeItem(key) {
    checkEmpty(key);
    currentStorage.removeItem(key);
  },
  clear() {
    currentStorage.clear();
  }
};


/**
 * Validates if the key value is not empty.
 * (null, undefined and empty string)
 * @param  {String} key
 */
function checkEmpty(key) {
  if (key == null || key === '')
    throw new Error('Key can not be empty');
}

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
      $cookie.set(`${key}=${value}${expires}; path=${path}`);
    },

    getItem(key) {
      const nameEQ = `${key}=`;
      let cookie = $cookie.get().split(';').find(findCookie, nameEQ);
      if (cookie) return cookie.trim().substring(nameEQ.length, cookie.length);
      return null;
    },

    removeItem(key) {
      api.setItem(key, '', -1);
    },

    clear() {
      let eq = '=', indexEQ, key;
      $cookie.get().split(';').forEach((cookie) => {
        indexEQ = cookie.indexOf(eq);
        if (indexEQ > -1) {
          key = cookie.substring(0, indexEQ);
          // prevent leading spaces before the key
          api.removeItem(key.trim());
        }
      });
    }
  };
  return api;
}

/**
 * Callback that finds an element in the array.
 * @param  {String} cookie: key/value
 * @return {Boolean}
 */
function findCookie(cookie) {
  let nameEQ = this.toString();
  // prevent leading spaces before the key
  return cookie.trim().indexOf(nameEQ) === 0;
}

/**
 * Callback that finds an element in the array.
 * @param  {Object} item: {key, value}
 * @return {Boolean}
 */
function findItem(item) {
  let key = this.toString();
  return item.key === key;
}

/**
 * Manages the creation/read/remove data in memory.
 * Implements Web Storage interface methods.
 *
 * @return {Object}
 */
function memoryStorage() {
  const hashtable = [/*{key,value}*/];
  const api = {
    setItem(key, value) {
      let item = hashtable.find(findItem, key);
      if (item) item.value = value;
      else hashtable.push({ key, value });
    },
    getItem(key) {
      let item = hashtable.find(findItem, key);
      if (item) return item.value;
      return null;
    },
    removeItem(key) {
      let index = hashtable.findIndex(findItem, key);
      if (index > -1) hashtable.splice(index, 1);
    },
    clear() {
      hashtable.length = 0;
    }
  };
  return api;
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
  // sets the default storage mechanism available
  Object.keys(isAvaliable).some(isStorageAvaliable);
}

init();

// @public
export { webStorage as default, proxy, configStorage, isAvaliable };
