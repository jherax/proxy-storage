import {proxy} from './proxy-mechanism';
import {setProperty, checkEmpty} from './utils';

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
    let transformed = action(key, val, ...args);
    if (transformed === undefined) return val;
    return transformed;
  }, value);
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
    if (!proxy.hasOwnProperty(storageType)) {
      throw new Error(`Storage type "${storageType}" is not valid`);
    }
    // keeps only one instance by storageType (singleton)
    if (_instances[storageType]) {
      return _instances[storageType];
    }
    setProperty(this, '__storage__', storageType);
    // copies all existing elements in the storage mechanism
    Object.keys(proxy[storageType]).forEach((key) => {
      let value = proxy[storageType][key];
      try {
        this[key] = JSON.parse(value);
      } catch (e) {
        this[key] = value;
      }
    }, this);
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
    let v = executeInterceptors('setItem', key, value, options);
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
    if (value === undefined) value = null;
    else value = JSON.parse(value);
    let v = executeInterceptors('getItem', key, value);
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
    if (command in _interceptors && typeof action === 'function')
      _interceptors[command].push(action);
  }
}

// @public API
export {WebStorage as default, proxy};
