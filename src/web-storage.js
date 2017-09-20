import executeInterceptors, {INTERCEPTORS} from './interceptors';
import {setProperty, checkEmpty, tryParse} from './utils';
import {isAvailable} from './is-available';
import {proxy} from './proxy-mechanism';

/**
 * @private
 *
 * Keeps WebStorage instances by type as singletons.
 *
 * @type {object}
 */
const INSTANCES = {};

/**
 * @private
 *
 * Keys not allowed for cookies.
 *
 * @type {RegExp}
 */
const BANNED_KEYS = /^(?:expires|max-age|path|domain|secure)$/i;

/**
 * @private
 *
 * Copies all existing keys in the storage.
 *
 * @param  {CookieStorage} instance: the object to where copy the keys
 * @param  {object} storage: the storage mechanism
 * @return {object}
 */
function copyKeys(instance, storage) {
  Object.keys(storage).forEach((key) => {
    instance[key] = tryParse(storage[key]);
  });
  return instance;
}

/**
 * @public
 *
 * Allows to validate if a storage mechanism is valid
 *
 * @type {object}
 */
const webStorageSettings = {
  default: null,
  isAvailable,
};

/**
 * @private
 *
 * Validates if the storage mechanism is available and can be used safely.
 *
 * @param  {string} storageType: it can be "localStorage", "sessionStorage", "cookieStorage", or "memoryStorage"
 * @return {string}
 */
function storageAvailable(storageType) {
  if (webStorageSettings.isAvailable[storageType]) return storageType;
  const fallback =
    storageType === 'sessionStorage' ? 'memoryStorage' : webStorageSettings.default;
  const msg = `${storageType} is not available. Falling back to ${fallback}`;
  console.warn(msg); // eslint-disable-line
  return fallback;
}

/**
 * @public
 *
 * Implementation of the Web Storage interface.
 * It saves and retrieves values as JSON.
 *
 * @see
 * https://developer.mozilla.org/en-US/docs/Web/API/Storage
 *
 * @type {class}
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
    if (!Object.prototype.hasOwnProperty.call(proxy, storageType)) {
      throw new Error(`Storage type "${storageType}" is not valid`);
    }
    // gets the requested storage mechanism
    const storage = proxy[storageType];
    // if the storage is not available, sets the default
    storageType = storageAvailable(storageType);
    // keeps only one instance by storageType (singleton)
    const cachedInstance = INSTANCES[storageType];
    if (cachedInstance) {
      return copyKeys(cachedInstance, storage);
    }
    setProperty(this, '__storage__', storageType);
    // copies all existing keys in the storage mechanism
    INSTANCES[storageType] = copyKeys(this, storage);
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
    const storageType = this.__storage__;
    if (storageType === 'cookieStorage' && BANNED_KEYS.test(key)) {
      throw new Error('The key is a reserved word, therefore not allowed');
    }
    const v = executeInterceptors('setItem', key, value, options);
    if (v !== undefined) value = v;
    this[key] = value;
    // prevents converting strings to JSON to avoid extra quotes
    if (typeof value !== 'string') value = JSON.stringify(value);
    proxy[storageType].setItem(key, value, options);
    // checks if the cookie was created, or delete it if the domain or path are not valid
    if (storageType === 'cookieStorage' && proxy[storageType].getItem(key) === null) {
      delete this[key];
    }
  }

  /**
   * Retrieves a value by its key name.
   *
   * @param  {string} key: keyname of the storage
   * @param  {boolean} noParse: if the value shoudn't be parsed with `JSON.parse`
   * @return {void}
   *
   * @memberOf WebStorage
   */
  getItem(key, noParse) {
    checkEmpty(key);
    let value = proxy[this.__storage__].getItem(key);
    if (value == null) { // null or undefined
      delete this[key];
      value = null;
    } else {
      if (noParse !== true) value = tryParse(value);
      this[key] = value;
    }
    const v = executeInterceptors('getItem', key, value);
    if (v !== undefined) value = v;
    return value;
  }

  /**
   * Deletes a key from the storage.
   *
   * @param  {string} key: keyname of the storage
   * @param  {object} options: additional options for cookieStorage
   * @return {void}
   *
   * @memberOf WebStorage
   */
  removeItem(key, options) {
    checkEmpty(key);
    executeInterceptors('removeItem', key, options);
    delete this[key];
    proxy[this.__storage__].removeItem(key, options);
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
    Object.keys(this).forEach((key) => {
      delete this[key];
    }, this);
    proxy[this.__storage__].clear();
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
   * Adds an interceptor to a WebStorage method.
   *
   * @param  {string} command: name of the API method to intercept
   * @param  {function} action: callback executed when the API method is called
   * @return {void}
   *
   * @memberOf WebStorage
   */
  static interceptors(command, action) {
    if (command in INTERCEPTORS && typeof action === 'function') {
      INTERCEPTORS[command].push(action);
    }
  }
}

/**
 * @public API
 */
export {WebStorage as default, webStorageSettings, proxy};
