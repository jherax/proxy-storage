# Proxy Storage

<!-- markdownlint-disable MD014 MD025 MD033 MD034 MD036 -->

This library manages an adapter that implements an interface similar to
[Web Storage] to normalize the API for [document.cookie],
[window.localStorage] and [window.sessionStorage].

One of the advantages of this library is that the adapter stores the data
as **JSON**, allowing to save `Object` and `Array<Any>` values, which
is not the default behavior when using the native `window.localStorage`,
`window.sessionStorage` or `document.cookie` storages.

It also provides a new [`memoryStorage`](#storage-or-default) mechanism that
persists the data in memory (current browser tab), even if a forced refresh
is done on the page. It is a mimic of `sessionStorage` and it could be used
as fallback when the other storage mechanisms are not available, for example,
some browsers navigating in private mode.
Read more about [window.sessionStorage].

Another advantage with **proxy-storage** is that you can register
[interceptors](#interceptors) as callback functions on the prototype methods
`setItem`, `getItem`, `removeItem`, and `clear`, giving you the ability to
intercept and modify the values to read/write/delete.

## Content

1. [Installing the library](#installing-the-library)
1. [Including the library](#including-the-library)
1. [API: storage/default](#storage-or-default)
1. [API: WebStorage](#webstorage)
   1. [Handling cookies](#handling-cookies)
   1. [Looping the storage](#looping-the-storage)
   1. [Clearing data](#clearing-data)
   1. [Interceptors](#interceptors)
1. [API: configStorage](#configstorage)
1. [API: isAvailable](#isavailable)
1. [Shimming-polyfills](#shimming-polyfills)
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
<!-- from unpkg.com -->
<script src="https://unpkg.com/proxy-storage/dist/proxy-storage.min.js"></script>

<!-- or from rawgit.com -->
<script src="https://cdn.rawgit.com/jherax/proxy-storage/2.1.2/dist/proxy-storage.min.js"></script>
```

In the above case, [`proxyStorage`](#api) is included as a global object
in the browser, and you can use it like this:

```javascript
// gets the default storage mechanism (usually localStorage)
var storage = proxyStorage.default;

// or get an specific storage mechanism
var cookieStore = new proxyStorage.WebStorage('cookieStorage');
```

As `proxy-storage` is built as [UMD] _(Universal Module Definition)_,
it can be included from module loaders such as [CommonJS], [ES2015 Export]
or [AMD RequireJS].

### CommonJS

```javascript
// gets the default storage mechanism (usually localStorage)
var storage = require('proxy-storage').default;

// or get an specific storage mechanism
var WebStorage = require('proxy-storage').WebStorage;
var cookieStore = new WebStorage('cookieStorage');
```

### ES2015 Export

```javascript
// gets the default storage mechanism (usually localStorage)
import storage from 'proxy-storage';

// or get some API members
import storage, { WebStorage, configStorage } from 'proxy-storage';
const cookieStore = new WebStorage('memoryStorage');
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
  // gets the default storage mechanism (usually localStorage)
  var storage = proxyStorage.default;
  // or get an specific storage mechanism
  var sessionStore = new proxyStorage.WebStorage('sessionStorage');
});
```

See an example with RequireJS here: http://jsfiddle.net/FdKTn/67/

# API

The exposed interface manages an adapter that stores the data
as **JSON**, allowing to save `Object` and `Array<Any>` values, which
is not the default behavior when using the native `window.localStorage`,
`window.sessionStorage` and `document.cookie` storages. It also provides
a new storage mechanism called **`memoryStorage`** which persists the data
in memory (current browser tab), even if a forced refresh is done
(similar to `sessionStorage`).

The [`WebStorage`](#webstorage) class has a static member called
[`interceptors`](#interceptors) which lets you to register callback
functions on the prototype methods `setItem`, `getItem`, `removeItem`,
and `clear`, giving you the ability to intercept and modify the values
to read/write/delete.

This library is exported as [UMD] _(Universal Module Definition)_ and the API
contains the following members:

## storage (or default)

**_@type_ `Object`**

This is the **default** module and is an instance of
[`WebStorage`](#webstorage). It saves and retrieves the data internally as
**JSON**, allowing not only storing **primitive** values but also **Object**
values.

It inherits the following members from the `WebStorage` prototype:

- **`setItem`**`(key, value [,options])`: stores a `value` given a `key` name.
  <br>The `options` parameter is used only when you set `"cookieStorage"`.
  Read more details [here](#handling-cookies).
- **`getItem`**`(key)`: retrieves a value by its `key` name.
- **`removeItem`**`(key [,options])`: deletes an item from the storage.
  <br>The `options` parameter is used only when you set `"cookieStorage"`.
  Read more details [here](#handling-cookies).
- **`clear`**`()`: removes all items from the storage instance.
- **`length`**: gets the number of items stored in the storage instance.

The `storage` object is a proxy for the first storage mechanism available,
usually `localStorage`, which is established when the library is initialized.
The availability of the storage mechanisms is determined in the following order:

1. **`localStorage`**: adapter of the [window.localStorage] object.
1. **`sessionStorage`**: adapter of the [window.sessionStorage] object.
1. **`cookieStorage`**: adapter of the [document.cookie] object, and
   normalized with the [`WebStorage`](#webstorage) interface.
1. **`memoryStorage`**: internal storage mechanism that can be used as
   _fallback_ when none of the above mechanisms are available. The behavior
   of `memoryStorage` is similar to `sessionStorage`, which let you to persist
   data in the current session (browser tab)

As the `storage` object is a proxy of the first storage mechanism available,
that means if `localStorage` is available to set and retreive data, then the
`storage` object will be an instance of `WebStorage` handling `localStorage`,
otherwise, if `localStorage` is not available, but `sessionStorage` does, then
`storage` will be an instance of `WebStorage` handling `sessionStorage`, and
again, if `sessionStorage` is not available, but `cookieStorage` does, then
`storage` will be an instance of `WebStorage` handling `cookieStorage`.
Finally, if none of the previous mechanisms are available, then the `storage`
object will handle the `memoryStorage` as a fallback.

**Example**

```javascript
import storage from 'proxy-storage';
// 'storage' is the default module

// use the default storage mechanism, usually localStorage
storage.setItem('qwerty', [{ some: 'object', garbage: true }]);
console.log(storage.getItem('qwerty'));
// [{ some: 'object', garbage: true }]

storage.setItem('persisted', true);
storage.setItem('o-really', { status: 'saved' });
console.log(`items: ${storage.length}`);

storage.removeItem('qwerty');
console.log(storage.getItem('qwerty'));
// null

// removes all data in the current storage
storage.clear();
console.log(`items: ${storage.length}`);
console.log(storage.getItem('o-really'));
// null
```

**ProTip**: you can override the default storage mechanism by calling
the method [configStorage.set()](#configstorage)

## WebStorage

**_@type_ `Class`**

This constructor mimics the [Web Storage] interface and manages an adapter
that allows saving `Object` and `Array<Any>` values as **JSON**. It also
lets you register [interceptors](#interceptors) for the methods `setItem`,
`getItem`, `removeItem` and `clear`.

This is the signature:

```javascript
var instance = new WebStorage(storageType)
```

Where **`storageType`** is a `string` that describes the type of storage
to manage. It can be one of the following values: `"localStorage"`,
`"sessionStorage"`, `"cookieStorage"`, or `"memoryStorage"`.

Each instance handles an adapter with the following API:

- **`setItem`**`(key, value [,options])`: stores a `value` given a `key` name.
  <br>The `options` parameter is used only when you set `"cookieStorage"`.
  Read more details [here](#handling-cookies).
- **`getItem`**`(key)`: retrieves a value by its `key` name.
- **`removeItem`**`(key [,options])`: deletes an item from the storage.
  <br>The `options` parameter is used only when you set `"cookieStorage"`.
  Read more details [here](#handling-cookies).
- **`clear`**`()`: removes all items from the storage instance.
- **`length`**: gets the number of items stored in the storage instance.

You can create multiple instances of `WebStorage` to handle different storage
mechanisms. To store data in `cookies` and also in `sessionStorage`, you can
do as follow:

```javascript
import storage, { WebStorage } from 'proxy-storage';

// use the default storage mechanism, usually localStorage
storage.setItem('tv-show', { name: 'Regular Show' });

// store in sessionStorage
const sessionStore = new WebStorage('sessionStorage');
sessionStore.setItem('character', { name: 'Mordecai' });

// store in cookies
const options = { expires: {days: 1} };
const cookieStore = new WebStorage('cookieStorage');
cookieStore.setItem('character', { name: 'Rigby' }, options);
```

**Important**: If you request an instance of a storage mechanism that are not
available, you will get an instance of the first storage mechanism available,
this is in order to keep storing data. It is useful when you rely on a
specific storage mechanism. Let's see an example:

```javascript
import { WebStorage, isAvailable } from 'proxy-storage';

 // let's suppose the following storage is not available
 isAvailable.sessionStorage = false;

 const sessionStore = new WebStorage('sessionStorage');
 // sessionStorage is not available. Falling back to localStorage
 sessionStore.setItem('ulugrun', 3.1415926);

 // as sessionStorage is not available, the instance obtained
 // is the first storage mechanism available: localStorage
 console.dir(sessionStore);
```

### Handling cookies

When you create an instance of `WebStorage` for `"cookieStorage"`, the
method `setItem()` receives an optional argument as the last parameter,
that configures the way how the cookie is stored.

Signature of `setItem`:

```javascript
instance.setItem(key, value, options)
```

Where the **`options`** parameter is an `object` with the following properties:

- `domain`_`{string}`_: the domain or subdomain where the cookie will be valid.
- `path`_`{string}`_: relative path where the cookie is valid. _Default `"/"`_
- `expires`_`{Date, object}`_: the expiration date of the cookie.
  You can pass an object describing the expiration:
  - `date`_`{Date}`_: if provided, this date will be applied, otherwise the
    current date will be used.
  - `minutes`_`{number}`_: minutes to add / subtract
  - `hours`_`{number}`_: hours to add / subtract
  - `days`_`{number}`_: days to add / subtract
  - `months`_`{number}`_: months to add / subtract
  - `years`_`{number}`_: years to add / subtract

**Example**

```javascript
import { WebStorage } from 'proxy-storage';

const cookieStore = new WebStorage('cookieStorage');

let data = {
  start: new Date().toISOString(),
  sessionId: 'J34H5609-SG7BND98W3',
  platform: 'Linux x86_64',
};

cookieStore.setItem('activity', data, {
  expires: { minutes: 30 },
});

cookieStore.setItem('testing1', true, {
  path: '/profile',
  expires: new Date('2018/03/06'),
});

cookieStore.setItem('testing2', [1,4,7], {
  domain: '.wordpress.com',
  expires: { days: 1 },
});

cookieStore.setItem('testing3', 3, {
  expires: {
    date: new Date('2018/03/06'),
    hours: -6,
  },
});
```

**Important**: Take into account that if you want to modify or remove a cookie
that was created with a specific `path` or `domain` / subdomain, you need to
explicitate the domain attribute in the `options` when calling
`setItem(key, value, options)` or `removeItem(key, options)`.

![cookies](https://www.dropbox.com/s/wlvgm0t8xc07me1/cookies-metadata.gif?dl=1)

If you have created the cookie with **proxyStorage**, it will handle the
metadata internally, so that you can call `removeItem(key)` safely.

But if you want to modify / remove a cookie that was created from another page,
then you should provide the metadata as `path` or `domain` in order to match
the right cookie:

```javascript
// change the value of an external cookie in /answers
cookieStore.setItem('landedAnswers', 999, {
  path: '/answers',
});

// remove an external cookie in a subdomain
cookieStore.removeItem('optimizelyEndUserId', {
  domain: '.healthcare.org',
});
```

### Looping the storage

You can loop over the items in the storage instance, e.g.
`localStorage`, `sessionStorage`, `cookieStorage`, or `memoryStorage`,
but it is not a good practice, see the notes below.

```javascript
const sessionStore = new WebStorage('sessionStorage');

sessionStore.setItem('test1', 1);
sessionStore.setItem('test2', 2);

// loop over the storage object
Object.keys(sessionStore).forEach((key) => {
  console.log(key, sessionStore[key]);
});

// or...
for (let key in sessionStore) {
  console.log(key, sessionStore[key]);
}
```

**Important**: Although you can loop over the storage items, it is
recommended to use the API methods instead, this is because navigable
items in the storage instance are not synchronized for external changes,
e.g. a domain cookie was created from another page, or a cookie has expired.

```javascript
// not recommended, they are not synchronized
var title = cookieStorage['title'];
var session = cookieStorage.sessionId;
cookieStorage['sessionId'] = 'E6URTG5';

// the good way, it tracks external changes
var title = cookieStorage.getItem('title');
var session = cookieStorage.getItem('sessionId');
cookieStorage.setItem('sessionId', 'E6URTG5');
```

### Clearing data

You can use the `removeItem(key)` method to delete a specific item in
the storage instance, or use the `clear()` method to remove all items
in the storage instance.

```javascript
import { WebStorage } from 'proxy-storage';

function clearAllStorages() {
  new WebStorage('localStorage').clear();
  new WebStorage('sessionStorage').clear();
  new WebStorage('cookieStorage').clear();
}
```

### Interceptors

The [`WebStorage`](#webstorage) class exposes the static member `interceptors`
which lets you to register callback functions on the prototype methods
`setItem`, `getItem`, `removeItem`, and `clear`.
It is very useful when you need to take actions accessing the API methods,
giving you the ability to intercept and modify the values to read/write/delete.

- **`WebStorage.interceptors`**`(command, action)`: adds an interceptor to
  the API method.
  - `command`_`{string}`_: name of the API method to intercept. It can be
    `setItem`, `getItem`, `removeItem`, `clear`.
  - `action`_`{function}`_: callback executed when the API method is called.
    It **must** return the value in order to be processed by the API method.

**ProTip**: interceptors are registered in chain, allowing you to transform
the _value_ passed and returned in each callback.

```javascript
import storage, { WebStorage } from 'proxy-storage';

// adds first interceptor for 'setItem'
WebStorage.interceptors('setItem', (key, value/*, options*/) => {
  if (key === 'storage-test') {
    // transform the 'id' property by encoding it to base64
    value.id = btoa(value.id);
    return value;
  }
});

// adds second interceptor for 'setItem'
WebStorage.interceptors('setItem', (key, value) => {
  // does not apply any transformation
  console.info('setItem: See the application storage in your browser');
  console.log(`${key}: ${JSON.stringify(value)}`);
});

// adds first interceptor for 'getItem'
WebStorage.interceptors('getItem', (key, value) => {
  if (key === 'storage-test') {
    // decodes from base64 the 'id' property
    value.id = +atob(value.id);
  }
  return value;
});

WebStorage.interceptors('removeItem', (key/*, options*/) => {
  console.log(`removeItem: ${key}`);
});

// uses the default storage mechanism (usually localStorage)
storage.setItem('storage-test', { id: 1040, text: 'it works!' });
let data = storage.getItem('storage-test');
console.log(data);

// storage.removeItem('storage-test');
```

## configStorage

**_@type_ `Object`**

Gets and sets the storage mechanism to use by default.
It contains the following methods:

- **`get`**`()`: returns a `string` with the name of the current storage mechanism.
- **`set`**`(storageType)`: sets the current storage mechanism. `storageType`
  must be one of the following strings: `"localStorage"`, `"sessionStorage"`,
  `"cookieStorage"`, or `"memoryStorage"`.

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

// if you are running in the browser,
// you must update the alias of the storage:
// storage = proxyStorage.default;
storage.setItem('currentStorage', storageName);
```

## isAvailable

**_@type_ `Object`**

Determines which storage mechanisms are available to read/write/delete data.
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

## Shimming-polyfills

This library is written using some of the new ES6 features, e.g.
`Object.assign()`. If you have to support Non-standard-compliant browsers
(e.g. Internet Explorer), you can polyfill some of the ES2015 features with
the following alternatives:

**[es6-shim](https://github.com/paulmillr/es6-shim)**

```html
<!-- put this script FIRST, before all other scripts -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/es6-shim/0.35.3/es6-shim.min.js"></script>
```

**[polyfill.io](https://polyfill.io/v2/docs/)**

```html
<!-- put this script FIRST, before all other scripts -->
<script src="https://cdn.polyfill.io/v2/polyfill.min.js"></script>
```

[Polyfill.io](https://polyfill.io/v2/docs/examples) reads the `User-Agent`
header of each request and returns the polyfills that are suitable for the
requesting browser.

## Running the project

If you want to fork or build your own, you must run this project.

### Requirements

1. Git on [linux](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
   or [windows](https://git-for-windows.github.io/).
1. [Node.js](https://nodejs.org/en/) (latest stable version v6+).<br>
   It is preferable install [nvm](https://github.com/creationix/nvm)
   (node version manager).
1. [Yarn](https://yarnpkg.com/en/docs/cli/) installed as global package.

**NOTE**: Consider install Node Version Manager (**nvm**) to upgrade easily
the Node version.<br>Go to https://github.com/creationix/nvm and check the
installation process for your OS.

If you are running Windows, you can install [nvm-windows]. Follow every
step mentioned [here][nvm-windows-install] so that **nvm** will be correctly
installed to manage multiple installations of **Node** (with **npm**)
on a Windows computer.

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

This command will lint the code with
[ESLint](http://eslint.org/docs/user-guide/getting-started)
and transpile the source files from `src/` to `dist/` as an [UMD] with
[Babel](https://babeljs.io/). It also generates the minified and source map
files.

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

<!-- LINKS -->

[Web Storage]: https://developer.mozilla.org/en-US/docs/Web/API/Storage
[window.localStorage]: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
[window.sessionStorage]: https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
[document.cookie]: https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie
[UMD]: http://davidbcalhoun.com/2014/what-is-amd-commonjs-and-umd/
[CommonJS]: https://blog.risingstack.com/node-js-at-scale-module-system-commonjs-require/
[ES2015 Export]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export
[AMD RequireJS]: http://requirejs.org/docs/api.html#jsfiles
[nvm-windows]: https://github.com/coreybutler/nvm-windows#node-version-manager-nvm-for-windows
[nvm-windows-install]: https://github.com/coreybutler/nvm-windows#installation--upgrades
