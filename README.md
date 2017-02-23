# Proxy Storage

<!-- markdownlint-disable MD014 MD025 MD033 MD034 MD036 -->

This library handles an adapter that implements the
[Web Storage](https://developer.mozilla.org/en-US/docs/Web/API/Storage) interface,
which is very useful to deal with the lack of compatibility between
[document.cookie](https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie) and
[localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) /
[sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) APIs.

It also provides a new [`memoryStorage`](#storage-or-default) mechanism that keeps the data
in memory even if a forced refresh is performed on the page. It could be used as a fallback
when the other storage mechanisms are not available, for example in some browsers navigating
in private mode. The behavior of _`memoryStorage`_ is similar to
[_sessionStorage_](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage).

The adapter let us to store data as **JSON**, allowing to save `Object` and
`Array<Any>` values, which is not possible when you are using native `localStorage`,
`sessionStorage` and `cookie` storages.

Another advantage with [`proxy-storage`](https://github.com/jherax/proxy-storage)
is that you can register [interceptors](#static-methods) for each of the
[Web Storage methods](#storage-or-default): `setItem`, `getItem`, `removeItem`, `clear`
and they will intercept the values before being returned by the intercepted method.
See documentation [here](#static-methods).

## Content

1. [Installing the library](#installing-the-library)
1. [Including the library](#including-the-library)
1. [API: storage/default](#storage-or-default)
1. [API: WebStorage](#webstorage)
1. [API: configStorage](#configstorage)
1. [API: isAvailable](#isavailable)
1. [Shimming](#shimming)
1. [Running the project](#running-the-project)

## Installing the library

To include this library into your package manager with `npm` or `yarn`

```shell
# with npm
$ npm install proxy-storage --save

# with yarn
$ yarn add proxy-storage
```

## Including the library

`proxy-storage` can be included directly from a CDN in your page:

```html
<script src="https://cdn.rawgit.com/jherax/proxy-storage/2.0.2/dist/proxy-storage.min.js"></script>
```

In the above case, [`proxyStorage`](#api) is included as a global object in the browser.

```javascript
// get the default storage mechanism
var storage = proxyStorage.default;

// or get the constructor
var cookieStore = new proxyStorage.WebStorage('cookieStorage');
```

As `proxy-storage` is built as an [UMD](http://davidbcalhoun.com/2014/what-is-amd-commonjs-and-umd/)
(Universal Module Definition), it can be included from a module loader as AMD, CommonJS, or
ES2015 Export.

### CommonJS

```javascript
// gets the default storage mechanism
var storage = require('proxy-storage').default;

// or get the constructor
var WebStorage = require('proxy-storage').WebStorage;
var cookieStore = new WebStorage('cookieStorage');
```

### ES2015 Export

```javascript
// gets the default storage mechanism
import storage from 'proxy-storage';

// or get some API members
import storage, { WebStorage, configStorage } from 'proxy-storage';
```

### AMD

```javascript
// using RequireJS
requirejs.config({
  paths: {
    // remove the extension .js
    'proxy-storage': '<PATH>/proxy-storage.min'
  }
});
require(['proxy-storage'], function(proxyStorage) {
  // localStorage usually is the default storage
  var storage = proxyStorage.default;
  // creates a new storage mechanism
  var sessionStore = new proxyStorage.WebStorage('sessionStorage');
});
```

See an example with RequireJS here: http://jsfiddle.net/FdKTn/67/

# API

The exposed Web Storage interface handles an adapter that allow us to store
data as **JSON**, letting to store `Object` and `Array<Any>` values. It also
provides a new `memoryStorage` mechanism that keeps the data in memory even
if a forced refresh is performed on the page.

The [`WebStorage`](#webstorage) class allows you to register
[`interceptors`](#static-methods) for each of the prototype methods:
`setItem`, `getItem`, `removeItem`, `clear`, in order to allow additional
actions to be performed before one of the methods finishes.

This library is exported as UMD and the API contains the following members:

## storage (or default)

_@type_ `Object`. This is the **default** module and is an instance of
[`WebStorage`](#webstorage). It saves and retrieves the data internally as JSON,
which allows not only store **Primitive** values but also **Object** values.
It inherits the following methods of the `WebStorage` prototype:

- **`setItem`**`(key, value [,options])`: stores a `value` given a `key` name.
  <br>`options` is an optional parameter and only works with `cookieStorage`.
  See [here](#setitem-for-cookiestorage) for more details.
- **`getItem`**`(key)`: retrieves a value by its `key` name.
- **`removeItem`**`(key)`: deletes a key from the storage.
- **`clear`**`()`: removes all keys from the storage.
- **`length`**: Gets the number of data items stored in the storage object.

By default this object is a proxy for the first storage mechanism available,
usually `localStorage`. The availability is determined in the following order:

1. **`localStorage`**: proxy for [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) object.
1. **`sessionStorage`**: proxy for [sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) object.
1. **`cookieStorage`**: proxy for [document.cookie](https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie) object and implements the Web Storage interface.
1. **`memoryStorage`**: internal storage mechanism that can be used as a **fallback** when none of the above mechanisms are available. The behavior of _`memoryStorage`_ is similar to _`sessionStorage`_

**TIP**: you can override the default storage mechanism by setting the new
storage type with [configStorage.set()](#configstorage)

**Example**

```javascript
import storage from 'proxy-storage';
// 'storage' is the default module

// use the default storage mechanism, usually localStorage
storage.setItem('qwerty', [{ some: 'object', garbage: true }]);
let data = storage.getItem('qwerty');
// [{ some: 'object', garbage: true }]

storage.setItem('o-really', { status: 'saved' });
storage.setItem('persisted', true);

storage.removeItem('qwerty');
data = storage.getItem('qwerty');
// null

//removes all data in the current storage
storage.clear();
data = storage.getItem('o-really');
// null
```

### setItem for cookieStorage

When you are working with an instance of `WebStorage` and set its mechanism to
`"cookieStorage"`, the API method `.setItem()` has a special behavior, allowing
you to set an expiration date and also to specify a path where the cookie will
be valid.

`setItem(key, value, options)` receives the optional parameter `options` which
is an object where you can specify the following properties:

- `path`_`{string}`:_ the relative path where the cookie will be valid. Its default value is `"/"`
- `expires`_`{Date, object}`:_ the expiration date of the cookie. Also you can provide an object to describe the expiration date:
  - `date`_`{Date}`:_ if provided, the timestamps will affect this date, otherwise a new current date will be used.
  - `hours`_`{number}`:_ hours to add / subtract
  - `days`_`{number}`:_ days to add / subtract
  - `months`_`{number}`:_ months to add / subtract
  - `years`_`{number}`:_ years to add / subtract

**Example**

```javascript
import { WebStorage } from 'proxy-storage';

const cookieStore = new WebStorage('cookieStorage');
let data = {
  start: new Date().toISOString(),
  sessionId: 'J34H5J34609-DSFG7BND98W3',
  platform: 'Linux x86_64',
};
let options = {
  path: '/jherax',
  expires: new Date('2017/03/06')
};

cookieStore.setItem('activity', data, options);
cookieStore.setItem('testing', true, { expires: {hours:1} });
```

### Getting all items stored

As this library implements the Web Storage interface, you can access to all
data items in the same way as `localStorage` or `sessionStorage`, thus you
can loop over the keys in the storage mechanism you are using
(`localStorage`, `sessionStorage`, `cookieStorage`, `memoryStorage`).

```javascript
const cookieStore = new WebStorage('cookieStorage');

cookieStore.setItem('test1', 1);
cookieStore.setItem('test2', 2);

// loop over the storage object
Object.keys(cookieStore).forEach((key) => {
  console.log(key, cookieStore[key]);
});
// or...
for (let key in cookieStore) {
  console.log(key, cookieStore[key]);
}
```

## WebStorage

_@type_ `Class`. This constructor implements the
[Web Storage](https://developer.mozilla.org/en-US/docs/Web/API/Storage) interface
and handles an adapter that allows to store values `Object` and `Array<Any>`.
It also lets you register [interceptors](#static-methods) for the methods
`setItem`, `getItem`, `removeItem` and `clear`.

You can create multiple instances of _`WebStorage`_ to handle different storage
mechanisms. It is very useful when you need to store data in more than one storage
mechanism at the same time, for example in `cookies` but also in `sessionStorage`.

**Example**

```javascript
import storage, { WebStorage } from 'proxy-storage';

// use the default storage mechanism, usually localStorage
storage.setItem('tv-show', { name: 'Regular Show' });

// saves also in sessionStorage
const sessionStore = new WebStorage('sessionStorage');
sessionStore.setItem('character', { name: 'Mordecai' });

// saves also in cookies
const options = { expires: {days:1} };
const cookieStore = new WebStorage('cookieStorage');
cookieStore.setItem('character', { name: 'Rigby' }, options);
```

**Clearing all data**

```javascript
import { WebStorage } from 'proxy-storage';

function clearDataFromStorage() {
  new WebStorage('localStorage').clear();
  new WebStorage('sessionStorage').clear();
  new WebStorage('cookieStorage').clear();
}
```

**NOTE**: If you request a new instance of a storage mechanism that are not
available, then you will get an instance of the first storage mechanism
available, allowing you to keep saving data to the store. This is useful
when you are relying on a specific storage mechanism. Let's see an example:

```javascript
import storage, * as proxyStorage from 'proxy-storage';

 // let's suppose sessionStorage is not available
 proxyStorage.isAvailable.sessionStorage = false;

 // saves data to the default storage mechanism (localStorage)
 storage.setItem('querty', 12345);

 const session = new proxyStorage.WebStorage('sessionStorage');
 session.setItem('asdfg', 67890);

 // as sessionStorage is not available, the instance obtained
 // is the first available storage mechanism: localStorage
 console.log(session);
```

### Static Methods

The **`WebStorage`** class provides the static method `interceptors` which
allows us to register callbacks for each of the prototype methods: `setItem`,
`getItem`, `removeItem`, `clear`. It is very useful when you need to perform
additional actions when accessing the `WebStorage` methods, or if you need to
transform the _value_ in `getItem` and `setItem` methods before they are
stored/retrieved in the storage mechanism.

- **`WebStorage.interceptors`**`(command, action)`: adds an interceptor to a `WebStorage` method.
  - `command`_`{string}`_ Name of the API method to intercept. It can be `setItem`, `getItem`, `removeItem`, `clear`.
  - `action`_`{function}`_ Callback executed when the API method is called.

**TIP**: interceptors are registered in chain, allowing the transformation
in chain of the value passed through.

**Example**

```javascript
import storage, { WebStorage } from 'proxy-storage';

// 1st interceptor for 'setItem'
WebStorage.interceptors('setItem', (key, value) => {
  if (key === 'storage-test') {
    // transform the 'id' property by encoding it to base64
    value.id = btoa(value.id);
  }
  return value;
});

// 2nd interceptor for 'setItem'
WebStorage.interceptors('setItem', (key, value) => {
  // does not apply any transformation
  console.info('setItem: See the localStorage in your browser');
  console.log(`${key}: ${JSON.stringify(value)}`);
});

WebStorage.interceptors('getItem', (key, value) => {
  if (key === 'storage-test') {
    // decodes from base64 the 'id' property
    value.id = +atob(value.id);
  }
  return value;
});

WebStorage.interceptors('removeItem', (key) => console.log(`removeItem: ${key}`));

// localStorage is the default storage mechanism
storage.setItem('storage-test', { id: 1040, data: 'it works!' });
storage.getItem('storage-test');
```

## configStorage

_@type_ `Object`. Gets and sets the storage mechanism to use by default.
It contains the following methods:

- **`get`**`()`: returns a `string` with the name of the current storage mechanism.
- **`set`**`(storageType)`: sets the current storage mechanism. `storageType` must be one of the following strings: `"localStorage"`, `"sessionStorage"`, `"cookieStorage"`, or `"memoryStorage"`.

**Example**

```javascript
import storage, { configStorage } from 'proxy-storage';

// gets the default storage mechanism
let storageName = configStorage.get();
console.log('Default:', storageName);

storage.setItem('defaultStorage', storageName);

// sets the new default storage mechanism
configStorage.set('cookieStorage');
storageName = configStorage.get();
console.log('Current:', storageName);

storage.setItem('currentStorage', storageName);
```

## isAvailable

_@type_ `Object`. Determines which storage mechanisms are available.
It contains the following flags:

- **`localStorage`**: is set to `true` if the local storage is available.
- **`sessionStorage`**: is set to `true` if the session storage is available.
- **`cookieStorage`**: is set to `true` if the cookie storage is available.
- **`memoryStorage`**: always is set to `true`.

**Example**

```javascript
import storage, * as proxyStorage from 'proxy-storage';
// * imports the entire module's members into proxyStorage.

const flags = proxyStorage.isAvailable;

if (!flags.localStorage && !flags.sessionStorage) {
  // forces the storage mechanism to memoryStorage
  proxyStorage.configStorage.set('memoryStorage');
}

let data = storage.getItem('hidden-data');

if (!data) {
  storage.setItem('hidden-data', {
    mechanism: 'memoryStorage',
    availability: 'Current page: you can refresh the page, data still remain'
  });
}

console.log('in memoryStorage', data);
```

## Shimming

In some cases may occur in old browsers that after including the library,
you could get error messages, e.g.<br>
`TypeError: undefined is not a function (evaluating 'Object.assign(t,e)')`

The reason is because this library use some of the new features in ES5-ES6.
To overcome this problem, you may include in your project the
[es6-shim](https://github.com/paulmillr/es6-shim) script before all scripts.

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/es6-shim/0.35.1/es6-shim.min.js"></script>
```

## Running the project

If you want to fork or build your own, you must run this project.

### Requirements

1. Git ([git-linux](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
   or [git-windows](https://git-for-windows.github.io/)).
1. [Node.js](https://nodejs.org/en/) (latest stable version v6+).<br>
   It is preferable install **[nvm](https://github.com/creationix/nvm)**
   (Node Version Manager).
1. [Yarn](https://yarnpkg.com/en/docs/cli/) installed as a global package.

**NOTE**: Consider install Node Version Manager (**nvm**) to upgrade easily the NodeJS version.
<br>Go to https://github.com/creationix/nvm and check the installation process for your OS.

If you are running Windows, you can install
[nvm-windows](https://github.com/coreybutler/nvm-windows#node-version-manager-nvm-for-windows).
Follow every step mentioned
[here](https://github.com/coreybutler/nvm-windows#installation--upgrades)
so that nvm will be correctly installed to manage multiple installations
of **node.js** (with **npm**) on a Windows computer.

### Building the project

Clone the repository:

```shell
$ git https://github.com/jherax/proxy-storage.git
```

If you don't have installed `yarn` as a global package, run this command:

```shell
$ npm install -g yarn
```

Now `yarn` will install dependencies in [`package.json`](package.json):

```shell
$ yarn
```

And finally execute the webpack task:

```shell
$ yarn run build
```

This command will lint the code with [ESLint](http://eslint.org/docs/user-guide/getting-started) and transpile the source files from `src/` to `dist/` as an [UMD](http://davidbcalhoun.com/2014/what-is-amd-commonjs-and-umd/) with [Babel](https://babeljs.io/). It also generates the minified and source map files.

## Versioning

This projects adopts the [Semantic Versioning](http://semver.org/)
(SemVer) guidelines:

```text
<MAJOR>.<MINOR>.<PATCH>
```

Given a version number MAJOR.MINOR.PATCH, increment the:

1. MAJOR version when you make incompatible API changes.
1. MINOR version when you add functionality in a backwards-compatible manner.
1. PATCH version when you make backwards-compatible bug fixes.

## Issues

To report an issue and keep traceability of bug-fixes, please report to:

- https://github.com/jherax/proxy-storage/issues

## Changelog

The change history for each version is documented [here](CHANGELOG.md).

## License

This project is released under the [MIT](https://opensource.org/licenses/MIT)
license. This license applies ONLY to the source of this repository and doesn't
extend to any other distribution, or any other 3rd party libraries used in a
repository. See [LICENSE](LICENSE) file for more information.
