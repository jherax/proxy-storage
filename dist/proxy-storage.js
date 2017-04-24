/*! proxyStorage@v2.1.3. Jherax 2017. Visit https://github.com/jherax/proxy-storage */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["proxyStorage"] = factory();
	else
		root["proxyStorage"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 6);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isObject = isObject;
exports.alterDate = alterDate;
exports.setProperty = setProperty;
exports.checkEmpty = checkEmpty;
/**
 * Determines whether a value is a plain object.
 *
 * @param  {any} value: the object to test
 * @return {boolean}
 */
function isObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

/**
 * Adds or subtracts date portions to the given date and returns the new date.
 *
 * @see https://gist.github.com/jherax/bbc43e479a492cc9cbfc7ccc20c53cd2
 *
 * @param  {object} options: It contains the date parts to add or remove, and can have the following properties:
 *         - {Date} date: if provided, this date will be affected, otherwise the current date will be used.
 *         - {number} minutes: minutes to add/subtract
 *         - {number} hours: hours to add/subtract
 *         - {number} days: days to add/subtract
 *         - {number} months: months to add/subtract
 *         - {number} years: years to add/subtract
 * @return {Date}
 */
function alterDate() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var opt = Object.assign({}, options);
  var d = opt.date instanceof Date ? opt.date : new Date();
  if (+opt.minutes) d.setMinutes(d.getMinutes() + opt.minutes);
  if (+opt.hours) d.setHours(d.getHours() + opt.hours);
  if (+opt.days) d.setDate(d.getDate() + opt.days);
  if (+opt.months) d.setMonth(d.getMonth() + opt.months);
  if (+opt.years) d.setFullYear(d.getFullYear() + opt.years);
  return d;
}

/**
 * Creates a non-enumerable read-only property.
 *
 * @param  {object} obj: the object to add the property
 * @param  {string} name: the name of the property
 * @param  {any} value: the value of the property
 * @return {void}
 */
function setProperty(obj, name, value) {
  var descriptor = {
    configurable: false,
    enumerable: false,
    writable: false
  };
  if (typeof value !== 'undefined') {
    descriptor.value = value;
  }
  Object.defineProperty(obj, name, descriptor);
}

/**
 * Validates if the key is not empty.
 * (null, undefined or empty string)
 *
 * @param  {string} key: keyname of an element in the storage mechanism
 * @return {void}
 */
function checkEmpty(key) {
  if (key == null || key === '') {
    throw new Error('The key provided can not be empty');
  }
}

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * @public
 *
 * Used to determine which storage mechanisms are available.
 *
 * @type {object}
 */
var isAvailable = exports.isAvailable = {
  localStorage: false,
  sessionStorage: false,
  cookieStorage: false,
  memoryStorage: true };

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.proxy = exports.webStorageSettings = exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _proxyMechanism = __webpack_require__(5);

var _utils = __webpack_require__(0);

var _isAvailable = __webpack_require__(1);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @private
 *
 * Keeps WebStorage instances by type as singletons.
 *
 * @type {object}
 */
var _instances = {};

/**
 * @private
 *
 * Stores the interceptors for WebStorage methods.
 *
 * @type {object}
 */
var _interceptors = {
  setItem: [],
  getItem: [],
  removeItem: [],
  clear: []
};

/**
 * @private
 *
 * Keys not allowed for cookies.
 *
 * @type {RegExp}
 */
var bannedKeys = /^(?:expires|max-age|path|domain|secure)$/i;

/**
 * @private
 *
 * Executes the interceptors for a WebStorage method and
 * allows the transformation in chain of the value passed through.
 *
 * @param  {string} command: name of the method to intercept
 * @return {any}
 */
function executeInterceptors(command) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  var key = args.shift();
  var value = args.shift();
  if (value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
    // clone the object to prevent mutations
    value = JSON.parse(JSON.stringify(value));
  }
  return _interceptors[command].reduce(function (val, action) {
    var transformed = action.apply(undefined, [key, val].concat(args));
    if (transformed == null) return val;
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
  var parsed = void 0;
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
  Object.keys(storage).forEach(function (key) {
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
var webStorageSettings = {
  default: null,
  isAvailable: _isAvailable.isAvailable
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
  console.warn(storageType + ' is not available. Falling back to ' + webStorageSettings.default); // eslint-disable-line
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

var WebStorage = function () {

  /**
   * Creates an instance of WebStorage.
   *
   * @param {string} storageType: it can be "localStorage", "sessionStorage", "cookieStorage", or "memoryStorage"
   *
   * @memberOf WebStorage
   */
  function WebStorage(storageType) {
    _classCallCheck(this, WebStorage);

    if (!Object.prototype.hasOwnProperty.call(_proxyMechanism.proxy, storageType)) {
      throw new Error('Storage type "' + storageType + '" is not valid');
    }
    // gets the requested storage mechanism
    var storage = _proxyMechanism.proxy[storageType];
    // if the storage is not available, sets the default
    storageType = storageAvailable(storageType);
    // keeps only one instance by storageType (singleton)
    var cachedInstance = _instances[storageType];
    if (cachedInstance) {
      copyKeys(cachedInstance, storage);
      return cachedInstance;
    }
    (0, _utils.setProperty)(this, '__storage__', storageType);
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


  _createClass(WebStorage, [{
    key: 'setItem',
    value: function setItem(key, value, options) {
      (0, _utils.checkEmpty)(key);
      var storageType = this.__storage__;
      if (storageType === 'cookieStorage' && bannedKeys.test(key)) {
        throw new Error('The key is a reserved word, therefore not allowed');
      }
      var v = executeInterceptors('setItem', key, value, options);
      if (v !== undefined) value = v;
      this[key] = value;
      // prevents converting strings to JSON to avoid extra quotes
      if (typeof value !== 'string') value = JSON.stringify(value);
      _proxyMechanism.proxy[storageType].setItem(key, value, options);
      // checks if the cookie was created, or delete it if the domain or path are not valid
      if (storageType === 'cookieStorage' && _proxyMechanism.proxy[storageType].getItem(key) === null) {
        delete this[key];
      }
    }

    /**
     * Retrieves a value by its key name.
     *
     * @param  {string} key: keyname of the storage
     * @return {void}
     *
     * @memberOf WebStorage
     */

  }, {
    key: 'getItem',
    value: function getItem(key) {
      (0, _utils.checkEmpty)(key);
      var value = _proxyMechanism.proxy[this.__storage__].getItem(key);
      if (value == null) {
        delete this[key];
        value = null;
      } else {
        value = tryParse(value);
        this[key] = value;
      }
      var v = executeInterceptors('getItem', key, value);
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

  }, {
    key: 'removeItem',
    value: function removeItem(key, options) {
      (0, _utils.checkEmpty)(key);
      executeInterceptors('removeItem', key, options);
      delete this[key];
      _proxyMechanism.proxy[this.__storage__].removeItem(key, options);
    }

    /**
     * Removes all keys from the storage.
     *
     * @return {void}
     *
     * @memberOf WebStorage
     */

  }, {
    key: 'clear',
    value: function clear() {
      var _this = this;

      executeInterceptors('clear');
      Object.keys(this).forEach(function (key) {
        delete _this[key];
      }, this);
      _proxyMechanism.proxy[this.__storage__].clear();
    }

    /**
     * Gets the number of data items stored in the Storage object.
     *
     * @readonly
     *
     * @memberOf WebStorage
     */

  }, {
    key: 'length',
    get: function get() {
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

  }], [{
    key: 'interceptors',
    value: function interceptors(command, action) {
      if (command in _interceptors && typeof action === 'function') {
        _interceptors[command].push(action);
      }
    }
  }]);

  return WebStorage;
}();

/**
 * @public API
 */


exports.default = WebStorage;
exports.webStorageSettings = webStorageSettings;
exports.proxy = _proxyMechanism.proxy;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = cookieStorage;

var _utils = __webpack_require__(0);

/**
 * @private
 *
 * Proxy for document.cookie
 *
 * @see
 * https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie
 *
 * @type {object}
 */
var $cookie = {
  get: function get() {
    return document.cookie;
  },
  set: function set(value) {
    document.cookie = value;
  },
  data: {} };

/**
 * @private
 *
 * Builds the expiration for the cookie.
 *
 * @see utils.alterDate(options)
 *
 * @param  {Date|object} date: the expiration date
 * @return {string}
 */
function buildExpirationString(date) {
  var expires = date instanceof Date ? (0, _utils.alterDate)({ date: date }) : (0, _utils.alterDate)(date);
  return expires.toUTCString();
}

/**
 * @private
 *
 * Builds the string for the cookie metadata.
 *
 * @param  {string} key: name of the metadata
 * @param  {object} data: metadata of the cookie
 * @return {string}
 */
function buildMetadataFor(key, data) {
  if (!data[key]) return '';
  return ';' + key + '=' + data[key];
}

/**
 * @private
 *
 * Builds the whole string for the cookie metadata.
 *
 * @param  {object} data: metadata of the cookie
 * @return {string}
 */
function formatMetadata(data) {
  var expires = buildMetadataFor('expires', data);
  var domain = buildMetadataFor('domain', data);
  var path = buildMetadataFor('path', data);
  var secure = data.secure ? ';secure' : '';
  return '' + expires + domain + path + secure;
}

/**
 * @private
 *
 * Finds an element in the array.
 *
 * @param  {string} cookie: key=value
 * @return {boolean}
 */
function findCookie(cookie) {
  var nameEQ = this.toString();
  // prevent leading spaces before the key
  return cookie.trim().indexOf(nameEQ) === 0;
}

/**
 * @public
 *
 * Create, read, and delete elements from document.cookie,
 * and implements the Web Storage interface.
 *
 * @return {object}
 */
function cookieStorage() {
  var api = {
    setItem: function setItem(key, value, options) {
      options = Object.assign({ path: '/' }, options);
      // keep track of the metadata associated to the cookie
      $cookie.data[key] = { path: options.path };
      var metadata = $cookie.data[key];
      if ((0, _utils.isObject)(options.expires) || options.expires instanceof Date) {
        metadata.expires = buildExpirationString(options.expires);
      }
      if (options.domain && typeof options.domain === 'string') {
        metadata.domain = options.domain.trim();
      }
      if (options.secure === true) metadata.secure = true;
      var cookie = key + '=' + encodeURIComponent(value) + formatMetadata(metadata);
      // TODO: should encodeURIComponent(key) ?
      $cookie.set(cookie);
    },
    getItem: function getItem(key) {
      var value = null;
      var nameEQ = key + '=';
      var cookie = $cookie.get().split(';').find(findCookie, nameEQ);
      if (cookie) {
        // prevent leading spaces before the key name
        value = cookie.trim().substring(nameEQ.length, cookie.length);
        value = decodeURIComponent(value);
      }
      if (value === null) delete $cookie.data[key];
      return value;
    },
    removeItem: function removeItem(key, options) {
      var metadata = Object.assign({}, $cookie.data[key], options);
      metadata.expires = { days: -1 };
      api.setItem(key, '', metadata);
      delete $cookie.data[key];
    },
    clear: function clear() {
      var key = void 0,
          indexEQ = void 0; // eslint-disable-line
      $cookie.get().split(';').forEach(function (cookie) {
        indexEQ = cookie.indexOf('=');
        if (indexEQ > -1) {
          key = cookie.substring(0, indexEQ);
          // prevent leading spaces before the key
          api.removeItem(key.trim());
        }
      });
    },
    initialize: function initialize() {
      // copies all existing elements in the storage
      $cookie.get().split(';').forEach(function (cookie) {
        var index = cookie.indexOf('=');
        var key = cookie.substring(0, index).trim();
        var value = cookie.substring(index + 1).trim();
        if (key) api[key] = decodeURIComponent(value);
      });
      // this method is removed after being invoked
      // because is not part of the Web Storage interface
      delete api.initialize;
    }
  };
  return api;
}

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = memoryStorage;
/**
 * @private
 *
 * Gets the hashtable-store from the current window.
 *
 * @return {object}
 */
function getStoreFromWindow() {
  // eslint-disable-line
  try {
    var store = JSON.parse(window.self.name);
    if (store && (typeof store === 'undefined' ? 'undefined' : _typeof(store)) === 'object') return store;
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
  var store = JSON.stringify(hashtable);
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
function memoryStorage() {
  var hashtable = getStoreFromWindow();
  var api = {
    setItem: function setItem(key, value) {
      hashtable[key] = value;
      setStoreToWindow(hashtable);
    },
    getItem: function getItem(key) {
      var value = hashtable[key];
      return value === undefined ? null : value;
    },
    removeItem: function removeItem(key) {
      delete hashtable[key];
      setStoreToWindow(hashtable);
    },
    clear: function clear() {
      Object.keys(hashtable).forEach(function (key) {
        return delete hashtable[key];
      });
      setStoreToWindow(hashtable);
    },
    initialize: function initialize() {
      // copies all existing elements in the storage
      Object.assign(api, hashtable);
      // this method is removed after being invoked
      // because is not part of the Web Storage interface
      delete api.initialize;
    }
  };
  return api;
}

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.proxy = undefined;

var _cookieStorage = __webpack_require__(3);

var _cookieStorage2 = _interopRequireDefault(_cookieStorage);

var _memoryStorage = __webpack_require__(4);

var _memoryStorage2 = _interopRequireDefault(_memoryStorage);

var _utils = __webpack_require__(0);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @private
 *
 * Copy the current items in the storage mechanism.
 *
 * @param  {object} api: the storage mechanism to initialize
 * @return {object}
 */
function initApi(api) {
  if (!api.initialize) return api;
  // sets API members to read-only and non-enumerable
  for (var prop in api) {
    // eslint-disable-line
    if (prop !== 'initialize') {
      (0, _utils.setProperty)(api, prop);
    }
  }
  api.initialize();
  return api;
}

/**
 * @public
 *
 * Proxy for the storage mechanisms.
 * All members implement the Web Storage interface.
 *
 * @see
 * https://developer.mozilla.org/en-US/docs/Web/API/Storage
 *
 * @type {object}
 */
var proxy = exports.proxy = {
  localStorage: window.localStorage,
  sessionStorage: window.sessionStorage,
  cookieStorage: initApi((0, _cookieStorage2.default)()),
  memoryStorage: initApi((0, _memoryStorage2.default)())
};

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isAvailable = exports.configStorage = exports.WebStorage = exports.default = undefined;

var _webStorage = __webpack_require__(2);

var _webStorage2 = _interopRequireDefault(_webStorage);

var _isAvailable = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @public
 *
 * Current storage mechanism.
 *
 * @type {object}
 */
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

var storage = null;

/**
 * @public
 *
 * Get/Set the storage mechanism to use by default.
 *
 * @type {object}
 */
var configStorage = {
  get: function get() {
    return storage.__storage__;
  },


  /**
   * Sets the storage mechanism to use by default.
   *
   * @param  {string} storageType: it can be "localStorage", "sessionStorage", "cookieStorage", or "memoryStorage"
   * @return {void}
   */
  set: function set(storageType) {
    if (!Object.prototype.hasOwnProperty.call(_webStorage.proxy, storageType)) {
      throw new Error('Storage type "' + storageType + '" is not valid');
    }
    exports.default = storage = new _webStorage2.default(storageType);
  }
};

/**
 * @private
 *
 * Checks whether a storage mechanism is available.
 *
 * @param  {string} storageType: it can be "localStorage", "sessionStorage", "cookieStorage", or "memoryStorage"
 * @return {boolean}
 */
function isStorageAvailable(storageType) {
  var storageObj = _webStorage.proxy[storageType];
  var data = '__proxy-storage__';
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
 * Sets the first or default storage available.
 *
 * @param  {string} storageType: it can be "localStorage", "sessionStorage", "cookieStorage", or "memoryStorage"
 * @return {boolean}
 */
function storageAvailable(storageType) {
  if (_isAvailable.isAvailable[storageType]) {
    _webStorage.webStorageSettings.default = storageType;
    configStorage.set(storageType);
  }
  return _isAvailable.isAvailable[storageType];
}

/**
 * @private
 *
 * Initializes the module.
 *
 * @return {void}
 */
function init() {
  _isAvailable.isAvailable.localStorage = isStorageAvailable('localStorage');
  _isAvailable.isAvailable.sessionStorage = isStorageAvailable('sessionStorage');
  _isAvailable.isAvailable.cookieStorage = isStorageAvailable('cookieStorage');
  _webStorage.webStorageSettings.isAvailable = _isAvailable.isAvailable;
  // sets the default storage mechanism available
  Object.keys(_isAvailable.isAvailable).some(storageAvailable);
}

init();

/**
 * @public API
 */
exports.default = storage;
exports.WebStorage = _webStorage2.default;
exports.configStorage = configStorage;
exports.isAvailable = _isAvailable.isAvailable;

/***/ })
/******/ ]);
});