/**
 * @private
 *
 * Gets the hashtable-store from the current window.
 *
 * @return {object}
 */
function getStoreFromWindow() { // eslint-disable-line
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

    initialize() {
      // copies all existing elements in the storage
      Object.assign(api, hashtable);
      // this method is removed after being invoked
      // because is not part of the Web Storage interface
      delete api.initialize;
    },
  };
  return api;
}
