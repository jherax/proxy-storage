import {setProperty} from './utils';

/**
 * @private
 *
 * Gets the hashtable-store from the current window.
 *
 * @return {object}
 */
function getStoreFromWindow() {
  let store;
  try {
    store = JSON.parse(window.self.name);
  } catch (e) {
    return {};
  }
  if (store && typeof store === 'object') return store;
  return {};
}

/**
 * @private
 *
 * Saves the hashtable-store in the current window.
 *
 * @param  {object} hashtable: {key,value} pairs stored in memoryStorage
 * @return {void}
 */
function setStoreToWindow(hashtable) {
  const store = JSON.stringify(hashtable);
  window.self.name = store;
}

/**
 * @public
 *
 * Create, read, and delete elements from memory, and implements
 * the Web Storage interface. It also adds a hack to persist
 * the storage in the session for the current tab (browser).
 *
 * @return {object}
 */
export default function memoryStorage() {
  const hashtable = getStoreFromWindow();
  const api = {

    setItem(key, value) {
      hashtable[key] = value;
      setStoreToWindow(hashtable);
    },

    getItem(key) {
      const value = hashtable[key];
      return value === undefined ? null : value;
    },

    removeItem(key) {
      delete hashtable[key];
      setStoreToWindow(hashtable);
    },

    clear() {
      Object.keys(hashtable).forEach(key => delete hashtable[key]);
      setStoreToWindow(hashtable);
    },
  };

  return initialize(api, hashtable);
}

/**
 * @private
 *
 * Copy the current items in the cookie storage.
 *
 * @param  {object} api: the storage mechanism to initialize
 * @param  {object} hashtable: store from the window tab
 * @return {object}
 */
function initialize(api, hashtable) {
  // sets API members to read-only and non-enumerable
  for (let prop in api) { // eslint-disable-line
    setProperty(api, prop);
  }
  // copies all existing elements in the storage
  Object.assign(api, hashtable);
  return api;
}
