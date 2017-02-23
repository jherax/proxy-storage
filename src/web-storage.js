import {proxy} from './proxy-mechanism';
import {setProperty, checkEmpty} from './utils';
import {isAvailable} from './is-available';

/**
 * @private
 *
 * Keeps WebStorage instances by type as singletons.
 *
 * @type {object}
 */
const _instances = {};

/**
 * @private
 *
 * Stores the interceptors for WebStorage methods.
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
 * Executes the interceptors for a WebStorage method and
 * allows the transformation in chain of the value passed through.
 *
 * @param  {string} command: name of the method to intercept
 * @return {any}
 */
function executeInterceptors(command, ...args) {
  const key = args.shift();
  const value = args.shift();
  return _interceptors[command].reduce((val, action) => {
    const transformed = action(key, val, ...args);
    if (transformed === undefined) return val;
    return transformed;
  }, value);
}

/**
 * @private
 *
 * Try to parse a value
 *
 * @param  {string} value: the value to parse
 * @return {any}
 */
function tryParse(value) {
  let parsed;
  try {
    parsed = JSON.parse(value);
  } catch (e) {
    parsed = value;
  }
  return parsed;
}

/**
 * @private
 *
 * Copies all existing keys in the WebStorage instance.
 *
 * @param  {WebStorage} instance: the instance to where copy the keys
 * @param  {object} storage: the storage mechanism
 * @return {void}
 */
function copyKeys(instance, storage) {
  Object.keys(storage).forEach((key) => {
    instance[key] = tryParse(storage[key]);
  });
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
  console.warn(`${storageType} is not available. Falling back to ${webStorageSettings.default}`); // eslint-disable-line
  return webStorageSettings.default;
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
    const cachedInstance = _instances[storageType];
    if (cachedInstance) {
      copyKeys(cachedInstance, storage);
      return cachedInstance;
    }
    setProperty(this, '__storage__', storageType);
    // copies all existing keys in the storage mechanism
    copyKeys(this, storage);
    _instances[storageType] = this;
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
    const v = executeInterceptors('setItem', key, value, options);
    if (v !== undefined) value = v;
    this[key] = value;
    value = JSON.stringify(value);
    proxy[this.__storage__].setItem(key, value, options);
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
    let value = proxy[this.__storage__].getItem(key);
    if (value === undefined) {
      delete this[key];
      value = null;
    } else {
      value = tryParse(value);
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
   * @return {void}
   *
   * @memberOf WebStorage
   */
  removeItem(key) {
    checkEmpty(key);
    executeInterceptors('removeItem', key);
    delete this[key];
    proxy[this.__storage__].removeItem(key);
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
    if (command in _interceptors && typeof action === 'function') {
      _interceptors[command].push(action);
    }
  }
}

// @public API
export {WebStorage as default, webStorageSettings, proxy};
