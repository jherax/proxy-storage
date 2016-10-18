# Proxy Storage

This library is intended to use as a proxy that implements a basic [Web Storage](https://developer.mozilla.org/en-US/docs/Web/API/Storage) interface, which is very useful to deal with [window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage), [window.sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) and [document.cookie](https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie) because of the lack of compatibility between these storage mechanisms.

It also provides a fallback that stores data in memory when all of above mechanisms are not available, for example in some browsers using private navigation. The behavior of memory storage is similar to session storage.

The exposed `webStorage` interface allow us saving data as JSON values, with the advantage that you can store `Object` and `Array<Any>` values, which are not allowed in `localStorage`, `sessionStorage` and `cookie` storages by default.

The library has been written as a **ES6** module and the exported API contains the following objects:

##webStorage
_@type_ `Object`. Defines the basic [Web Storage](https://developer.mozilla.org/en-US/docs/Web/API/Storage) interface that saves the data internally as JSON, which allows not only store **Primitive** values but also **Object** values. It contains the following methods:

- **`setItem`**`(key, value)`: stores a `value` given a `key` name.
- **`getItem`**`(key)`: retrieves a value by its `key` name.
- **`removeItem`**`(key)`: deletes a key from the storage.
- **`clear`**`()`: removes all keys from the storage.

##proxy
_@type_ `Object`. Defines a proxy object for the built-in storage mechanisms. It contains the following objects:

- **`localStorage`**: alias of the [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) object.
- **`sessionStorage`**: alias of the [sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) object.
- **`cookieStorage`**: proxy for [cookie](https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie) object. (Web Storage interface is implemented in order to provide consistency)
- **`memoryStorage`**: internal implementation of Web Storage interface that can be used as a fallback when none of the above mechanisms are available. The behavior of memory storage is similar to session storage.

##configStorage
_@type_ `Object`. Get and set the storage mechanism to use by default. It contains the following methods:

- **`get`**`()`: returns a `String` with the name of the current storage mechanism.
- **`set`**`(storageType)`: sets the current storage mechanism. `storageType` must be one of the following strings: `"localStorage"`, `"sessionStorage"`, `"cookieStorage"`, or `"memoryStorage"`

##isAvaliable
_@type_ `Object`. Determines which storage mechanisms are available. It contains the following flags:

- **`localStorage`**: is set to `true` if the local storage is available.
- **`sessionStorage`**: is set to `true` if the session storage is available.
- **`cookieStorage`**: is set to `true` if the cookie storage is available.
- **`memoryStorage`**: always is set to `true`

