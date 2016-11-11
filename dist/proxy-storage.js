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
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
	 * Proxy for Web Storage and Cookies.
	 * All members implement the Web Storage interface.
	 *
	 * @Reference
	 * https://developer.mozilla.org/en-US/docs/Web/API/Storage
	 *
	 * @type {object}
	 */
	var _proxy = {
	  localStorage: window.localStorage,
	  sessionStorage: window.sessionStorage,
	  cookieStorage: cookieStorage(),
	  memoryStorage: memoryStorage()
	};

	/**
	 * @private
	 *
	 * Stores the interceptors for WebStorage methods
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
	 * Executes the interceptors of a WebStorage method
	 *
	 * @param  {string} command: name of the method to intercept
	 * @return {void}
	 */
	function executeInterceptors(command) {
	  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	    args[_key - 1] = arguments[_key];
	  }

	  _interceptors[command].forEach(function (action) {
	    return action.apply(undefined, args);
	  });
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
	  Object.defineProperty(obj, name, {
	    configurable: false,
	    enumerable: false,
	    writable: false,
	    value: value
	  });
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

	    if (!_proxy.hasOwnProperty(storageType)) {
	      throw new Error('Storage type "' + storageType + '" is not valid');
	    }
	    setProperty(this, '__storage', _proxy[storageType]);
	  }
	  /**
	   * Stores a value given a key name.
	   *
	   * @param  {string} key: keyname of the storage
	   * @param  {any} value: data to save in the storage
	   * @return {void}
	   *
	   * @memberOf WebStorage
	   */


	  _createClass(WebStorage, [{
	    key: 'setItem',
	    value: function setItem(key, value) {
	      checkEmpty(key);
	      executeInterceptors('setItem', key, value);
	      value = JSON.stringify(value);
	      this.__storage.setItem(key, value);
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
	      checkEmpty(key);
	      executeInterceptors('getItem', key);
	      var value = JSON.parse(this.__storage.getItem(key));
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
	      checkEmpty(key);
	      executeInterceptors('removeItem', key);
	      this.__storage.removeItem(key);
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
	      executeInterceptors('clear');
	      this.__storage.clear();
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

	  }], [{
	    key: 'interceptors',
	    value: function interceptors(command, action) {
	      if (command in _interceptors && typeof action === 'function') _interceptors[command].push(action);
	    }
	  }]);

	  return WebStorage;
	}();

	/**
	 * @public
	 *
	 * Determines which storage mechanisms are available.
	 *
	 * @type {object}
	 */


	var isAvaliable = {
	  localStorage: false,
	  sessionStorage: false,
	  cookieStorage: false,
	  memoryStorage: true
	};

	/**
	 * @public
	 *
	 * Current storage mechanism.
	 * @type {object}
	 */
	var storage = null;

	/**
	 * @private
	 *
	 * Current storage type
	 * @type {string}
	 */
	var _currentStorageName = null;

	/**
	 * @public
	 *
	 * Get/Set the storage mechanism to use by default.
	 * @type {object}
	 */
	var configStorage = {
	  get: function get() {
	    return _currentStorageName;
	  },


	  /**
	   * Sets the storage mechanism to use by default.
	   * @param  {string} storageType: it can be "localStorage", "sessionStorage", "cookieStorage", or "memoryStorage"
	   * @return {void}
	   */
	  set: function set(storageType) {
	    if (!_proxy.hasOwnProperty(storageType)) {
	      throw new Error('Storage type "' + storageType + '" is not valid');
	    }
	    exports.default = storage = new WebStorage(storageType);
	    _currentStorageName = storageType;
	  }
	};

	/**
	 * @private
	 *
	 * Alias for the default cookie storage associated with the current document.
	 *
	 * @Reference
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
	 * Manages actions for creation/reading/deleting cookies.
	 * Implements Web Storage interface methods.
	 *
	 * @return {object}
	 */
	function cookieStorage() {
	  var api = {
	    setItem: function setItem(key, value, days) {
	      var path = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '/';

	      var expires = '';
	      if (days) {
	        var date = new Date();
	        days = days * 24 * 60 * 60 * 1000;
	        date.setTime(date.getTime() + days);
	        expires = '; expires=' + date.toUTCString();
	      }
	      $cookie.set(key + '=' + encodeURIComponent(value) + expires + '; path=' + path);
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
	      api.setItem(key, '', -1);
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
	    }
	  };
	  return api;
	}

	/**
	 * @private
	 *
	 * Callback that finds an element in the array.
	 * @param  {string} cookie: key=value
	 * @return {boolean}
	 */
	function findCookie(cookie) {
	  var nameEQ = this.toString();
	  // prevent leading spaces before the key
	  return cookie.trim().indexOf(nameEQ) === 0;
	}

	/**
	 * @private
	 *
	 * Callback that finds an element in the array.
	 * @param  {object} item: {key, value}
	 * @return {boolean}
	 */
	function findItem(item) {
	  var key = this.toString();
	  return item.key === key;
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
	  var hashtable = getStoreFromWindow();
	  var api = {
	    setItem: function setItem(key, value) {
	      var item = hashtable.find(findItem, key);
	      if (item) item.value = value;else hashtable.push({ key: key, value: value });
	      setStoreToWindow(hashtable);
	    },
	    getItem: function getItem(key) {
	      var item = hashtable.find(findItem, key);
	      if (item) return item.value;
	      return null;
	    },
	    removeItem: function removeItem(key) {
	      var index = hashtable.findIndex(findItem, key);
	      if (index > -1) hashtable.splice(index, 1);
	      setStoreToWindow(hashtable);
	    },
	    clear: function clear() {
	      hashtable.length = 0;
	      setStoreToWindow(hashtable);
	    }
	  };
	  return api;
	}

	/**
	 * @private
	 *
	 * Gets the hashtable store from the current window.
	 * @return {array}
	 */
	function getStoreFromWindow() {
	  try {
	    var store = JSON.parse(window.self.name);
	    if (store instanceof Array) return store;
	  } catch (e) {} // eslint-disable-line
	  return []; /* {key,value} */
	}

	/**
	 * @private
	 *
	 * Saves the hashtable store in the current window.
	 * @param  {array} hashtable: list of objects stored in memoryStorage
	 * @return {void}
	 */
	function setStoreToWindow(hashtable) {
	  var store = JSON.stringify(hashtable);
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
	  var storageObj = _proxy[storageType];
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
	exports.default = storage;
	exports.WebStorage = WebStorage;
	exports.configStorage = configStorage;
	exports.isAvaliable = isAvaliable;

/***/ }
/******/ ])
});
;