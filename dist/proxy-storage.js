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
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.isAvaliable = exports.configStorage = exports.WebStorage = exports.default = undefined;

	var _webStorage = __webpack_require__(1);

	var _webStorage2 = _interopRequireDefault(_webStorage);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// If you want to support all ES6 features, uncomment the next line
	// import 'babel-polyfill';

	/**
	 * @public
	 *
	 * Current storage mechanism.
	 *
	 * @type {object}
	 */
	var storage = null;

	/**
	 * @public
	 *
	 * Determines which storage mechanisms are available.
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

	var isAvaliable = {
	  localStorage: false,
	  sessionStorage: false,
	  cookieStorage: false,
	  memoryStorage: true };

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
	    if (!_webStorage.proxy.hasOwnProperty(storageType)) {
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
	 *
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
	exports.default = storage;
	exports.WebStorage = _webStorage2.default;
	exports.configStorage = configStorage;
	exports.isAvaliable = isAvaliable;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.proxy = exports.default = undefined;

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _proxyMechanism = __webpack_require__(2);

	var _utils = __webpack_require__(4);

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
	  return _interceptors[command].reduce(function (val, action) {
	    var transformed = action.apply(undefined, [key, val].concat(args));
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

	var WebStorage = function () {

	  /**
	   * Creates an instance of WebStorage.
	   *
	   * @param {string} storageType: it can be "localStorage", "sessionStorage", "cookieStorage", or "memoryStorage"
	   *
	   * @memberOf WebStorage
	   */
	  function WebStorage(storageType) {
	    var _this = this;

	    _classCallCheck(this, WebStorage);

	    if (!_proxyMechanism.proxy.hasOwnProperty(storageType)) {
	      throw new Error('Storage type "' + storageType + '" is not valid');
	    }
	    // keeps only one instance by storageType (singleton)
	    if (_instances[storageType]) {
	      return _instances[storageType];
	    }
	    (0, _utils.setProperty)(this, '__storage__', storageType);
	    // copies all existing elements in the storage mechanism
	    Object.keys(_proxyMechanism.proxy[storageType]).forEach(function (key) {
	      var value = _proxyMechanism.proxy[storageType][key];
	      try {
	        _this[key] = JSON.parse(value);
	      } catch (e) {
	        _this[key] = value;
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


	  _createClass(WebStorage, [{
	    key: 'setItem',
	    value: function setItem(key, value, options) {
	      (0, _utils.checkEmpty)(key);
	      var v = executeInterceptors('setItem', key, value, options);
	      if (v !== undefined) value = v;
	      this[key] = value;
	      value = JSON.stringify(value);
	      _proxyMechanism.proxy[this.__storage__].setItem(key, value, options);
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
	      if (value === undefined) value = null;else value = JSON.parse(value);
	      var v = executeInterceptors('getItem', key, value);
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

	  }, {
	    key: 'removeItem',
	    value: function removeItem(key) {
	      (0, _utils.checkEmpty)(key);
	      executeInterceptors('removeItem', key);
	      delete this[key];
	      _proxyMechanism.proxy[this.__storage__].removeItem(key);
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
	      var _this2 = this;

	      executeInterceptors('clear');
	      Object.keys(this).forEach(function (key) {
	        delete _this2[key];
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
	      if (command in _interceptors && typeof action === 'function') _interceptors[command].push(action);
	    }
	  }]);

	  return WebStorage;
	}();

	// @public API


	exports.default = WebStorage;
	exports.proxy = _proxyMechanism.proxy;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.proxy = undefined;

	var _cookieStorage = __webpack_require__(3);

	var _cookieStorage2 = _interopRequireDefault(_cookieStorage);

	var _memoryStorage = __webpack_require__(5);

	var _memoryStorage2 = _interopRequireDefault(_memoryStorage);

	var _utils = __webpack_require__(4);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * @private
	 *
	 * Adds the current elements in the storage object.
	 *
	 * @param  {object} api: the storage mechanism to initialize
	 * @return {object}
	 */
	function initApi(api) {
	  if (!api.initialize) return api;
	  // sets read-only and non-enumerable properties
	  for (var prop in api) {
	    // eslint-disable-line
	    if (prop !== 'initialize') (0, _utils.setProperty)(api, prop);
	  }
	  api.initialize();
	  // this method is removed after being invoked
	  // because is not part of the Web Storage interface
	  delete api.initialize;
	  return api;
	}

	/**
	 * @public
	 *
	 * Proxy for storage mechanisms.
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

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = cookieStorage;

	var _utils = __webpack_require__(4);

	/**
	 * @private
	 *
	 * Proxy for the default cookie storage associated with the current document.
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
	  }
	};

	/**
	 * @private
	 *
	 * Builds the expiration part for the cookie.
	 *
	 * @see utils.setTimestamp(options)
	 *
	 * @param  {Date|object} date: the expiration date
	 * @return {string}
	 */
	/* eslint-disable no-invalid-this */
	function buildExpirationString(date) {
	  var expires = date instanceof Date ? (0, _utils.setTimestamp)({ date: date }) : (0, _utils.setTimestamp)(date);
	  return '; expires=' + expires.toUTCString();
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
	 * Create, read, and delete elements from document cookies
	 * and implements the Web Storage interface.
	 *
	 * @return {object}
	 */
	function cookieStorage() {
	  var api = {
	    setItem: function setItem(key, value, options) {
	      var expires = '',
	          cookie = void 0;
	      options = Object.assign({ path: '/' }, options);
	      if ((0, _utils.isObject)(options.expires) || options.expires instanceof Date) {
	        expires = buildExpirationString(options.expires);
	      }
	      cookie = key + '=' + encodeURIComponent(value) + expires + '; path=' + options.path;
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
	      return value;
	    },
	    removeItem: function removeItem(key) {
	      api.setItem(key, '', { expires: { days: -1 } });
	    },
	    clear: function clear() {
	      var eq = '=';
	      var indexEQ = void 0,
	          key = void 0;
	      $cookie.get().split(';').forEach(function (cookie) {
	        indexEQ = cookie.indexOf(eq);
	        if (indexEQ > -1) {
	          key = cookie.substring(0, indexEQ);
	          // prevent leading spaces before the key
	          api.removeItem(key.trim());
	        }
	      });
	    },


	    // this method will be removed after being invoked
	    // because is not part of the Web Storage interface
	    initialize: function initialize() {
	      $cookie.get().split(';').forEach(function (cookie) {
	        var index = cookie.indexOf('=');
	        var key = cookie.substring(0, index).trim();
	        var value = cookie.substring(index + 1).trim();
	        // copies all existing elements in the storage
	        if (key) api[key] = decodeURIComponent(value);
	      });
	    }
	  };
	  return api;
	}

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.isObject = isObject;
	exports.setTimestamp = setTimestamp;
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
	 * Allows add or subtract timestamps to the current date or to a specific date.
	 *
	 * @param  {object} options: It contains the timestamps to add or remove to the date, and have the following properties:
	 *         - {Date} date: if provided, the timestamps will affect this date, otherwise a new current date will be used.
	 *         - {number} hours: hours to add/subtract
	 *         - {number} days: days to add/subtract
	 *         - {number} months: months to add/subtract
	 *         - {number} years: years to add/subtract
	 * @return {Date}
	 */
	function setTimestamp() {
	  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	  var opt = Object.assign({}, options);
	  var d = opt.date instanceof Date ? opt.date : new Date();
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
	 * (null, undefined either empty string)
	 *
	 * @param  {string} key: keyname of an element in the storage mechanism
	 * @return {void}
	 */
	function checkEmpty(key) {
	  if (key == null || key === '') {
	    throw new Error('The key provided can not be empty');
	  }
	}

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';

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
	 * Create, read, and delete elements from memory store and
	 * implements the Web Storage interface. It also adds a hack
	 * to persist the store in session for the current browser-tab.
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

	    // this method will be removed after being invoked
	    // because is not part of the Web Storage interface
	    initialize: function initialize() {
	      // copies all existing elements in the storage
	      Object.assign(api, hashtable);
	    }
	  };
	  return api;
	}

/***/ }
/******/ ])
});
;