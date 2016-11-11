# Proxy Storage

This library is intended to use as a proxy that implements a basic 
[Web Storage](https://developer.mozilla.org/en-US/docs/Web/API/Storage) interface, 
which is very useful to deal with the lack of compatibility between 
[document.cookie](https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie) and 
[localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage), 
[sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage).

It also provides a fallback that stores the data in memory when all of above mechanisms are not available, 
for example in some browsers using private navigation. The behavior of the _`memoryStorage`_ is similar to 
[_sessionStorage_](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage).

The exposed Web Storage interface allow us saving data as **JSON**, with the advantage that you can store 
`Object` and `Array<Any>` values, which is not possible when you are using native `localStorage`, 
`sessionStorage` and `cookie` storages.

## Getting started

In order to generate the ES5 and minified files, you must build this project.

## Requirements

1. Git ([git-linux](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) or [git-windows](https://git-for-windows.github.io/)).
2. [Node.js](https://nodejs.org/en/) (latest stable version v6+).
3. Node Package Manager ([npm](https://docs.npmjs.com/) v3+), the one that comes with your **node.js** version.<br/>It is preferable to install Node Version Manager - **[nvm](https://github.com/creationix/nvm)**, it contains both **node.js** and **npm**.
4. [Yarn](https://yarnpkg.com/en/docs/cli/) installed as a global package.

**NOTE**: Consider to install Node Version Manager (**NVM**) to upgrade easily the Node.js version. Go to https://github.com/creationix/nvm and check the installation process for your OS.

## Running the project

Clone the repository:

```shell
$ git https://github.com/jherax/proxy-storage.git
```

If you dont have installed `yarn` as a global package, run this command:

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

This command will use [Babel](https://babeljs.io/) to transpile the ES2015 (ES6) Module in `src/` folder to an UMD ES5 Module in `dest/`  
and also it will generate the minified version and source maps.

## Including the library

`proxy-storage` can be included directly from a CDN in your page:

```html
<script src="https://cdn.rawgit.com/jherax/proxy-storage/<version>/dist/proxy-storage.min.js"></script>
``` 

In the above case, the [library](#api) is included into the namespace `proxyStorage` as a global object.

```javascript
// get the default storage mechanism
var storage = proxyStorage.default;

// or get the constructor
var cookieStore = new proxyStorage.WebStorage('cookieStorage');
```

As `proxy-storage` is built as an [UMD](http://davidbcalhoun.com/2014/what-is-amd-commonjs-and-umd/) 
(Universal Module Definition), it can be included from a module loader as AMD, CommonJS, or ES2015 Export.

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
define(['proxy-storage'], function(WebStorage){
    // here, the WebStorage constructor is available
    var sessionStore = new WebStorage('sessionStorage');
});
```

# API

The exposed Web Storage interface allow us saving data as **JSON**, with the advantage that you can store 
`Object` and `Array<Any>` values, which is not possible when you are using native `localStorage`, 
`sessionStorage` and `cookie` storages.

This library has been written as a **ES2015 module** and the exported API contains the following members:

## storage

_@type_ `Object`. This is the _(default module)_ and is an instance of [`WebStorage`](#webstorage). 
It saves and retrieves the data internally as JSON, which allow not only store **Primitive** values 
but also **Object** values. It contains the following methods:

- **`setItem`**`(key, value)`: stores a `value` given a `key` name.
- **`getItem`**`(key)`: retrieves a value by its `key` name.
- **`removeItem`**`(key)`: deletes a key from the storage.
- **`clear`**`()`: removes all keys from the storage.

By default this object handles and adapter for the first storage mechanism available. 
The availability is determined in the following order:

1. **`localStorage`**: proxy for [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) object.
2. **`sessionStorage`**: proxy for [sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) object.
3. **`cookieStorage`**: proxy for [document.cookie](https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie) object that implements Web Storage.
4. **`memoryStorage`**: internal storage mechanism that can be used as a fallback when none of the above mechanisms are available. 
The behavior of _memoryStorage_ is similar to _sessionStorage_.

#### Example

```javascript
import storage from 'proxy-storage';
// 'storage' is the default module

// use the default storage mechanism, usually localStorage
storage.setItem('qwerty', [{ some: 'object', garbage: true }]);
let data = storage.getItem('qwerty');
// [{ some: 'object', garbage: true }]

storage.setItem('o-really', { usual: 'nothing' });
storage.setItem('to-persist', false);

storage.removeItem('qwerty');
data = storage.getItem('qwerty');
// null

//removes all data in the current storage
storage.clear();
data = storage.getItem('o-really');
// null
```

## WebStorage

_@type_ `Class`. This constructor implements the Web Storage interface. You can create new instances 
of this `class` which will allow you manage different storage mechanisms. It is very useful when you need 
to store data in more than one storage mechanism at the same time.

#### Example

```javascript
import storage, { WebStorage } from 'proxy-storage';

// use the default storage mechanism, usually localStorage
storage.setItem('tv-show', { name: 'Regular Show' });

// saves also in sessionStorage
const sessionStore = new WebStorage('sessionStorage');
sessionStore.setItem('character', { name: 'Mordecai' });

// saves also in cookies
const expires = 1; // 1 day
const cookieStore = new WebStorage('cookieStorage');
cookieStore.setItem('character', { name: 'Rigby' }, expires);
```

#### Clearing all data

```javascript
import { WebStorage } from 'proxy-storage';

function clearDataFromStorage() {
  new WebStorage('localStorage').clear();
  new WebStorage('sessionStorage').clear();
  new WebStorage('cookieStorage').clear();
}
```

### Static Methods

**`WebStorage`** provides the static method `interceptors` which allows us to register callbacks that runs when an API method is invoked.
It is very useful when you need to perform some additional actions when accessing the `WebStorage` methods.

- **`WebStorage.interceptors`**`(command, action)`: adds an interceptor to a `WebStorage` method. 
  - `command` `{string}`. The name of the API method to intercept. It can be `setItem`, `getItem`, `removeItem`, `clear`
  - `action` `{function}`. Callback executed when the API method is called.

#### Example

```javascript
import storage, { WebStorage, isAvaliable } from 'proxy-storage';

// detect if we are in a private navigation session
// and we have no access to default storage mechanisms
if (!isAvaliable.localStorage && !isAvaliable.cookieStorage) {
  WebStorage.interceptors('setItem', (key, value) => console.log(`setItem: ${key}: ${value}`));
  WebStorage.interceptors('getItem', (key) => console.log(`getItem: ${key}`));
  WebStorage.interceptors('removeItem', (key) => console.log(`removeItem: ${key}`));
}

// memoryStorage is the fallback mechanism in 'storage'
storage.setItem('proxy-storage-test', {data: 'it works!'});
storage.getItem('proxy-storage-test');
```

## configStorage

_@type_ `Object`. Get and set the storage mechanism to use by default. It contains the following methods:

- **`get`**`()`: returns a `String` with the name of the current storage mechanism.
- **`set`**`(storageType)`: sets the current storage mechanism. `storageType` must be one of the 
following strings: `"localStorage"`, `"sessionStorage"`, `"cookieStorage"`, or `"memoryStorage"`

#### Example

```javascript
import storage, { configStorage } from 'proxy-storage';

// gets the default storage mechanism
let storageName = configStorage.get();
console.log('Default:', storageName);

storage.setItem('defaultStorage', storageName);

// sets the new default storage mechanism
configStorage.set('sessionStorage');
storageName = configStorage.get();
console.log('Current:', storageName);

storage.setItem('currentStorage', storageName);
```

## isAvaliable

_@type_ `Object`. Determines which storage mechanisms are available. It contains the following flags:

- **`localStorage`**: is set to `true` if the local storage is available.
- **`sessionStorage`**: is set to `true` if the session storage is available.
- **`cookieStorage`**: is set to `true` if the cookie storage is available.
- **`memoryStorage`**: always is set to `true`

#### Example

```javascript
import storage, * as storageApi from 'proxy-storage';
// * imports the entire module's members into storageApi.

console.info('Available storage mechanisms');
console.log(storageApi.isAvaliable);

function init() {
  // memoryStorage is always available
  storageApi.configStorage.set('memoryStorage');

  if (isSafariInPrivateMode(storageApi.isAvaliable)) {
    // do something additional...
  }

  storage.setItem('hidden-data', {
    mechanism: 'memoryStorage',
    availability: 'Browser-tab, you can refresh your window'
  });

  let data = storage.getItem('hidden-data');
  console.log('in memoryStorage', data);
}

function isSafariInPrivateMode(flags) {
  return !flags.localStorage && !flags.sessionStorage && !flags.cookieStorage;
}
```

<br>
## Versioning

This projects adopts the [Semantic Versioning](http://semver.org/) (SemVer) guidelines:

```
<MAJOR>.<MINOR>.<PATCH>
```

Given a version number MAJOR.MINOR.PATCH, increment the:

1. MAJOR version when you make incompatible API changes
2. MINOR version when you add functionality in a backwards-compatible manner
3. PATCH version when you make backwards-compatible bug fixes.

## Issues

To report an issue and keep traceability of bug-fixes, please report to:

* https://github.com/jherax/proxy-storage/issues

## Changelog

Details changes for each release are documented [here](CHANGELOG.md).

## License

This project has been released under the [MIT](https://opensource.org/licenses/MIT) license. 
This license applies ONLY to the source of this repository and does not extend to any other distribution, 
or any other 3rd party libraries used in a repository. See [LICENSE](LICENSE) file for more information.
