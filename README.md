# Proxy Storage

This library is intended to use as a proxy that implements a basic [Web Storage](https://developer.mozilla.org/en-US/docs/Web/API/Storage) interface, which is very useful to deal with [window.localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage), [window.sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) and [document.cookie](https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie) because of the lack of compatibility between these storage mechanisms.

_(TODO):_
_It also provides a fallback that stores data in memory when all of above mechanisms are not available, for example in some browsers using private navigation._

The exposed `webStorage` interface allow us saving data as JSON values, with the advantage that now you can store `Object` and `Array<Any>` values, which are not allowed in the default `localStorage`, `sessionStorage` and `cookie` storages.

The library has been written in **ES6** and the exported API contains the following objects:

##webStorage
_@type_ `Object`. Defines the basic [Web Storage](https://developer.mozilla.org/en-US/docs/Web/API/Storage) interface that saves the data internally as JSON, which allows not only store **Primitive** values but also **Object** values. It contains the following methods:

- **`setItem`**`(key, value)`: stores a `value` given a `key` name.
- **`getItem`**`(key)`: retrieves a _value_ by its `key` name.
- **`removeItem`**`(key)`: deletes a _value_ from the storage by its `key` name.

##proxy
_@type_ `Object`. Defines a proxy object for the built-in storage mechanisms. It contains the following objects:

- **`localStorage`**: alias of the [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) object.
- **`sessionStorage`**: alias of the [sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage) object.
- **`cookie`**: proxy for [cookie](https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie) object. (Web Storage interface is implemented in order to provide consistency)

##configStorage
_@type_ `Object`. Get and set the storage mechanism to use by default. It contains the following methods:

- **`get`**`()`: retrieves the `String` name of the current storage mechanism used.
- **`set`**`(storageType)`: sets the current storage mechanism. `storageType` must be one of the following strings: `"localStorage"`, `"sessionStorage"`, or `"cookie"`

##isAvaliable
_@type_ `Object`. Determines which storage mechanisms are available. It contains the following flags:

- **`localStorage`**: is set to `true` if the _localStorage_ is available.
- **`sessionStorage`**: is set to `true` if the _sessionStorage_ is available.
- **`cookie`**: is set to `true` if the _cookie_ storage is available.

