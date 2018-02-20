# Proxy Storage

<!-- markdownlint-disable MD014 MD025 MD033 MD034 MD036 -->

This library manages an adapter that implements an interface similar to
[Web Storage] to normalize the API for [document.cookie] to be as
[window.localStorage] and [window.sessionStorage].

One of the advantages of this library is that the adapter stores the data
as **JSON**, allowing to store and retrieve values of type `Object` and
`Array<Any>` (not possible when using the native `localStorage`,
`sessionStorage` or `document.cookie` APIs).

It also provides a new mechanism —[`memoryStorage`](#storage-or-default)—,
that persists the data in memory (for current browser-tab), even if a forced
refresh is done on the page. It is a mimic of `sessionStorage` and it could
be used as fallback when the other storage mechanisms are not available, for
example, if the browser is navigating in private mode.
(Read more about [window.sessionStorage]).

Another advantage with **proxy-storage** is that you can register
[interceptors](#interceptors) as callbacks to intercept and modify the
values from `setItem`, `getItem`, `removeItem`, and `clear` methods.

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
1. [Polyfills](#polyfills)

## Installing the library

To include this library into your package manager with `npm` or `yarn`, run:

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
<script src="https://cdn.rawgit.com/jherax/proxy-storage/2.3.2/dist/proxy-storage.min.js"></script>
```

In the above case, [`proxyStorage`](#api) is included as a global object
in the browser, and you can use it like this:

### Browser

```javascript
// gets the default storage mechanism (usually localStorage)
var storage = proxyStorage.default;

// or get an specific storage mechanism
var cookieStore = new proxyStorage.WebStorage('cookieStorage');
```

As `proxy-storage` is built as [UMD] _(Universal Module Definition)_,
it can be included from module loaders such as [CommonJS], [ES2015 Imports]
or [AMD RequireJS].

### CommonJS

```javascript
// gets the default storage mechanism (usually localStorage)
var storage = require('proxy-storage').default;

// or get an specific storage mechanism
var WebStorage = require('proxy-storage').WebStorage;
var cookieStore = new WebStorage('cookieStorage');
```

### ES2015 Imports

```javascript
// gets the default storage mechanism (usually localStorage)
import storage from 'proxy-storage';

// or get some API members
import storage, { WebStorage, configStorage } from 'proxy-storage';
const cookieStore = new WebStorage('cookieStorage');
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

See an example with RequireJS here: http://jsfiddle.net/FdKTn/77/

[&#9751; Back to Index](#content)

# API

The exposed API manages an adapter that stores the data
as **JSON**, allowing to save and retrieve **primitive**,
`Object` and `Array<Any>` values, thanks to `JSON.stringify`.

It also provides a new storage mechanism called **`memoryStorage`**
which persists the data in memory (current tab in the browser), even
if a forced refresh is done on the page, as `sessionStorage` does.

The [`WebStorage`](#webstorage) class has a static member called
[`interceptors`](#interceptors) which lets you to register callback
functions upon the prototype methods `setItem`, `getItem`, `removeItem`,
and `clear`, giving you the ability to intercept and modify the values
to read, write, or delete.

This library is exported as [UMD] _(Universal Module Definition)_ and
the API contains the following members:

## storage (or default)

**_@type_ `Object`**

This is the **default** member of the library and is an instance of
[`WebStorage`](#webstorage). It inherits the following members from
the prototype:

- **`setItem`**`(key, value [,options])`: stores a `value` given a `key` name.
  <br>The `options` parameter is used only with instances of `cookieStorage`.
  Read more details [here](#handling-cookies).
- **`getItem`**`(key [, noParse])`: retrieves a value by its `key` name.
  <br>If `noParse` is `true` then the value retrieved is not parsed with `JSON.parse`.
- **`removeItem`**`(key [,options])`: deletes an item from the storage.
  <br>The `options` parameter is used only with instances of `cookieStorage`.
  Read more details [here](#handling-cookies).
- **`clear`**`()`: removes all items from the storage instance.
- **`length`**: gets the number of items stored in the instance.

The `storage` object is a proxy for the first storage mechanism available,
usually `localStorage`, which is established when the library is initialized.
The availability of the storage mechanisms is determined in the following order:

1. **`localStorage`**: adapter of the [window.localStorage] object.
1. **`cookieStorage`**: adapter of the [document.cookie] object, and
   normalized with the [`WebStorage`](#webstorage) interface.
1. **`sessionStorage`**: adapter of the [window.sessionStorage] object.
1. **`memoryStorage`**: internal storage mechanism that can be used as
   _fallback_ when none of the above mechanisms are available. The behavior
   of `memoryStorage` is similar to `sessionStorage`, which let you to persist
   data in the current session (browser tab)

**Important**: As the `storage` object is a proxy for the first storage
mechanism available, that means if `localStorage` is available to read and
write data, it will be used, otherwise, if `localStorage` is not available,
then `cookieStorage` will be used, and finally if none of the above are
available, `memoryStorage` will be the fallback mechanism.

**Example**

```javascript
import storage from 'proxy-storage';
// for browser: storage = proxyStorage.default;

// use the default storage mechanism, usually localStorage
storage.setItem('qwerty', [{ garbage: true, some: 'object' }]);
console.log(storage.getItem('qwerty'));
// [{ garbage: true, some: 'object' }]

console.log(storage.getItem('qwerty', true));
// '[{ "garbage": true, "some": "object" }]'

storage.setItem('persisted', true);
storage.setItem('o-really', { status: 'saved' });
console.log(`items: ${storage.length}`);

storage.removeItem('qwerty');
console.log(storage.getItem('qwerty'));
// null

// removes all data in the current storage
storage.clear();
console.log(`items: ${storage.length}`);
// items: 0
```

**ProTip**: you can override the default storage mechanism by calling
the method [configStorage.set()](#configstorage)

[&#9751; Back to Index](#content)

## WebStorage

**_@type_ `Class`**

This constructor mimics the [Web Storage] interface and manages an adapter
that allows saving `Object` and `Array<Any>` values as **JSON**. It also
lets you register [interceptors](#interceptors) for the methods `setItem`,
`getItem`, `removeItem` and `clear`.

This is the usage:

```javascript
var instance = new WebStorage(storageType)
```

Where **`storageType`** is a `string` that describes the type of storage
to manage. It can be one of the following values:

- `"localStorage"`
- `"cookieStorage"`
- `"sessionStorage"`
- `"memoryStorage"`

Each instance inherits the following properties:

- **`setItem`**`(key, value [,options])`: stores a `value` given a `key` name.
  <br>The `options` parameter is used only with instances of `cookieStorage`.
  Read more details [here](#handling-cookies).
- **`getItem`**`(key [, noParse])`: retrieves a value by its `key` name.
  <br>If `noParse` is `true` then the value retrieved is not parsed with `JSON.parse`.
- **`removeItem`**`(key [,options])`: deletes an item from the storage.
  <br>The `options` parameter is used only with instances of `cookieStorage`.
  Read more details [here](#handling-cookies).
- **`clear`**`()`: removes all items from the storage instance.
- **`length`**: gets the number of items stored in the instance.

You can create multiple instances of `WebStorage` to handle different
storage mechanisms. For example, to store data in `cookies` and also in
`sessionStorage`, you can do as follow:

```javascript
import storage, { WebStorage } from 'proxy-storage';
// for browser:
// var storage = proxyStorage.default;
// var WebStorage = proxyStorage.WebStorage;

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

**Important**: If you request an instance of a storage mechanism that is not
available, you will get an instance of the first storage mechanism available,
so you can continue storing data. It is useful when you rely on a
specific storage mechanism. Let's see an example:

```javascript
import { WebStorage, isAvailable } from 'proxy-storage';
// for browser:
// var WebStorage = proxyStorage.WebStorage;
// var isAvailable = proxyStorage.isAvailable;

 // let's suppose the following storage is not available
 isAvailable.sessionStorage = false;

 const sessionStore = new WebStorage('sessionStorage');
 // sessionStorage is not available. Falling back to memoryStorage
 sessionStore.setItem('ulugrun', 3.1415926);

 // as sessionStorage is not available, the instance
 // obtained is the fallback mechanism: memoryStorage
 console.dir(sessionStore);
```

[&#9751; Back to Index](#content)

### Handling cookies

When you create an instance of `WebStorage` with `cookieStorage`, the
method `setItem()` receives an optional argument as the last parameter
that configures the way how the cookie is stored.

Signature of `setItem`:

```javascript
instance.setItem(key: String, value: Any, options: Object) : void
```

Where the **`options`** parameter is an `object` with the following properties:

- `domain`_`{string}`_: the domain or subdomain where the cookie will be valid.
- `path`_`{string}`_: relative path where the cookie is valid. _Default `"/"`_
- `secure`_`{boolean}`_: if provided, creates a secure cookie over HTTPS.
- `expires`_`{Date, object}`_: the cookie expiration date.
  You can pass an object describing the expiration:
  - `date`_`{Date}`_: if provided, this date will be applied, otherwise the
    current date is used.
  - `minutes`_`{number}`_: minutes to add / subtract
  - `hours`_`{number}`_: hours to add / subtract
  - `days`_`{number}`_: days to add / subtract
  - `months`_`{number}`_: months to add / subtract
  - `years`_`{number}`_: years to add / subtract

**Example**

```javascript
import { WebStorage } from 'proxy-storage';
// for browser: WebStorage = proxyStorage.WebStorage;

const cookieStore = new WebStorage('cookieStorage');

let data = {
  start: new Date().toISOString(),
  sessionId: 'J34H5609-SG7ND98W3',
  platform: 'Linux x86_64',
};

cookieStore.setItem('activity', data, {
  expires: { minutes: 30 },
});

cookieStore.setItem('testing1', true, {
  secure: true,
  path: '/jherax',
  expires: new Date('2017/12/31'),
});

cookieStore.setItem('testing2', [1,4,7], {
  domain: '.github.com',
  expires: { days: 1 },
});

cookieStore.setItem('testing3', 3, {
  expires: {
    date: new Date('2018/03/06'),
    hours: -6,
  },
});
```

**Important**: Take into account that if you want to **modify** or **remove**
a cookie that was created under specific `path` or `domain` (subdomain), you
need to specify the `domain` or `path` attributes in the `options` parameter
when calling `setItem(key, value, options)` or `removeItem(key, options)`.

If you have created the cookie with **proxyStorage**, it will handle the
metadata internally, so that you can call `removeItem(key)` with no more
arguments. Otherwise you will need to provide the metadata **`path`** or
**`domain`**:

![cookies-metadata](https://assets.healthcare.com/static/docs/img/cookies-metadata.png)

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

[&#9751; Back to Index](#content)

### Looping the storage

You can loop over the items in the `storage` instance,
but it is not recommended to rely on it because navigable
items in the `storage` instance are not synchronized with
external changes, for example, a cookie has expired, or a
cookie/localStorage element was created/deleted from another
page with the same domain/subdomain.

```javascript
const sessionStore = new WebStorage('sessionStorage');

sessionStore.setItem('test1', 1);
sessionStore.setItem('test2', 2);

// loop over the storage object (not recommended)
Object.keys(sessionStore).forEach((key) => {
  console.log(key, sessionStore[key]);
});

// or this way (not recommended either)
for (let key in sessionStore) {
  console.log(key, sessionStore[key]);
}
```

It is also applied not only when reading, but also when writing to storage:

```javascript
// not recommended: not synchronized with the real storage
var title = cookieStorage['title'];
var session = cookieStorage.sessionId;
cookieStorage['sessionId'] = 'E6URTG5';

// good practice: it is synchronized for external changes
var title = cookieStorage.getItem('title');
var session = cookieStorage.getItem('sessionId');
cookieStorage.setItem('sessionId', 'E6URTG5');
```

[&#9751; Back to Index](#content)

### Clearing data

You can use the `removeItem(key)` method to delete a specific item in
the storage instance, or use the `clear()` method to remove all items
in the storage instance, e.g.

```javascript
import { WebStorage } from 'proxy-storage';
// for browser: WebStorage = proxyStorage.WebStorage;

function clearAllStorages() {
  new WebStorage('localStorage').clear();
  new WebStorage('sessionStorage').clear();
  new WebStorage('cookieStorage').clear();
}
```

**Important**: When handling `cookieStorage`, the method `clear()` only will
remove the cookies with no metadata or those created through **proxyStorage**.
Take into account that if you want to remove a cookie that was created from
another page, you need to set the `domain` or `path` attributes in the
`options` parameter when calling `removeItem(key, options)`.<br>
See [handling-cookies](#handling-cookies).

[&#9751; Back to Index](#content)

### Interceptors

The [`WebStorage`](#webstorage) class exposes the static member `interceptors`
which lets you to register callback functions upon the prototype methods
`setItem`, `getItem`, `removeItem`, and `clear`. It is very useful when you
need to perform an action to intercept the value to read, write, or delete.

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
// for browser:
// var storage = proxyStorage.default;
// var WebStorage = proxyStorage.WebStorage;

// adds first interceptor for 'setItem'
WebStorage.interceptors('setItem', (key, value/*, options*/) => {
  if (key === 'storage-test') {
    // encodes the 'id' to base64
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
    // decodes from base64
    value.id = +atob(value.id);
  }
  return value;
});

WebStorage.interceptors('removeItem', (key/*, options*/) => {
  console.log(`removeItem: ${key}`);
});

// uses the default storage mechanism (usually localStorage)
storage.setItem('storage-test', {id: 1040, text: 'it works!'});
let data = storage.getItem('storage-test');
console.log(data);

// storage.removeItem('storage-test');
```

[&#9751; Back to Index](#content)

## configStorage

**_@type_ `Object`**

Sets the [default storage](##storage-or-default) mechanism, or get the current
default storage mechanism. This object contains the following methods:

- **`get`**`()`: returns a `string` with the name of the current storage mechanism.
- **`set`**`(storageType)`: sets the default storage mechanism. `storageType`
  must be one of the following strings: `"localStorage"`, `"sessionStorage"`,
  `"cookieStorage"`, or `"memoryStorage"`. If the storage type provided is
  not valid, it will throw an exception.

**Example**

```javascript
import storage, { configStorage } from 'proxy-storage';
// for browser:
// var storage = proxyStorage.default;
// var configStorage = proxyStorage.configStorage;

// gets the default storage mechanism
let storageName = configStorage.get();
console.log('Default:', storageName);

storage.setItem('defaultStorage', storageName);

// sets the new default storage mechanism
configStorage.set('cookieStorage');
storageName = configStorage.get();
console.log('Current:', storageName);

// if you are running in the browser,
// you MUST update the alias of the storage:
// storage = proxyStorage.default;
storage.setItem('currentStorage', storageName);
```

[&#9751; Back to Index](#content)

## isAvailable

**_@type_ `Object`**

Determines which storage mechanisms are available to _read, write,_
or _delete_ data.

It contains the following flags:

- **`localStorage`**: is set to `true` if the local storage is available.
- **`cookieStorage`**: is set to `true` if the document cookies are available.
- **`sessionStorage`**: is set to `true` if the session storage is available.
- **`memoryStorage`**: always is set to `true`.

**Example**

```javascript
import storage, * as proxyStorage from 'proxy-storage';
// * imports the entire module's members into proxyStorage.

const flags = proxyStorage.isAvailable;

if (!flags.sessionStorage) {
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

[&#9751; Back to Index](#content)

## Polyfills

This library is written using some of the new ES5/ES6 features. If you have
to support Non-standard-compliant browsers like Internet Explorer, you can
polyfill some of the missing features with the following alternatives:

**Using [es6-shim](https://github.com/paulmillr/es6-shim)**

```html
<!-- put this script FIRST, before all other scripts -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/es6-shim/0.35.3/es6-shim.min.js"></script>
```

**Using [polyfill.io](https://polyfill.io/v2/docs/)**

```html
<!-- put this script FIRST, before all other scripts -->
<script src="https://cdn.polyfill.io/v2/polyfill.min.js?features=default-3.3"></script>
```

[Polyfill.io](https://polyfill.io/v2/docs/examples) reads the `User-Agent`
header of each request and returns the polyfills that are suitable for the
requesting browser.

If you want to request specific polyfills, you can pass a query parameter
to the url, for example:

```html
<!--[if IE]>
<script src="https://polyfill.io/v2/polyfill.min.js?features=default-3.3&flags=always"></script>
<![endif]-->
```

Read the list of available features:
[Features and Browsers Supported](https://polyfill.io/v2/docs/features/).

[&#9751; Back to Index](#content)

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

[&#9751; Back to Index](#content)

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
[document.cookie]: https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie
[window.localStorage]: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
[window.sessionStorage]: https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage
[UMD]: http://davidbcalhoun.com/2014/what-is-amd-commonjs-and-umd/
[CommonJS]: https://blog.risingstack.com/node-js-at-scale-module-system-commonjs-require/
[ES2015 Imports]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import
[AMD RequireJS]: http://requirejs.org/docs/api.html#jsfiles
