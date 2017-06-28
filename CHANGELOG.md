# ProxyStorage

<!-- markdownlint-disable MD024 MD033 -->

## 2.3.0

### Improvements

1. Upgraded to Webpack 3, ESLint 4.
1. Refactored and decoupled inner modules.

## 2.2.0

### Improvements

1. Allow `memoryStorage` to be the default fallback for `sessionStorage`

---

## 2.1.3

### Improvements

1. Allow storing secure cookies (HTTPS). The property `secure` is available through the `options` parameter for `setItem()` and `removeItem()`

---

## 2.1.2

### Improvements

1. Added the `options` parameter to the API method `removeItem()`, in order to allow passing metadata to the cookie to delete.
   When using `"cookieStorage"` the new signature is: `instance.removeItem(key, options)`
1. When calling `setItem()`, checks if the cookie was created, or deletes it if the domain or path are not valid.

---

## 2.1.1

### Fixes

1. [#4](https://github.com/jherax/proxy-storage/issues/4): Removing cookies are failing when the `domain` or `path` were set in the cookie.
1. `setItem`: prevents converting strings values to JSON to avoid extra quotes.

---

## 2.1.0

### Features

1. Added the `domain` to the `cookieStorage` options.

---

## 2.0.2

### Improvements

1. Project migrated to Webpack 2.

---

## 2.0.1

### Fixes

1. [#3](https://github.com/jherax/proxy-storage/issues/3): Error trying to get an item from storage.

---

## 2.0.0

### Breaking changes

This version bumps to major because the old method `.isAvaliable` is renamed to `.isAvailable`

### Improvements

1. Validates the availability of the storage mechanism when a new instance is created. If the requested storage is not available, then the first available storage is used.

---

## 1.0.4

### Improvements

1. Interceptors now interact with the values in the API methods `setItem` and `getItem`. Read more about [interceptors](README.md#static-methods).

---

## 1.0.3

### Fixes

1. [#2](https://github.com/jherax/proxy-storage/issues/2): Getting an error when retrieving nonexistent item from `cookieStorage`

---

## 1.0.2

### Improvements

1. `WebStorage` instances are singletons by storage mechanism, in order to keep consistency of the data stored.

### Fixes

1. [#1](https://github.com/jherax/proxy-storage/issues/1): Storages have no existing elements when they are instantiated the first time.

---

## 1.0.0

### Features

1. Added keys and `length` to the `WebStorage` instances.

### Breaking changes

The method `setItem` has changed its signature when the storage mechanism is set to `"cookieStorage"`
<br/>See more documentation [here](README.md#setitem-for-cookiestorage).

#### New signature

```javascript
setItem (key: string, value: any, options: object) : void
```

#### Old signature

```javascript
setItem (key: string, value: any, expires: number, path: string) : void
```

---

## 0.3.0

### Features

1. Added the static method `WebStorage.interceptors()`

---

## 0.2.0

### Improvements

1. Added `eslint-config-google`.
1. Added `eslint-loader` to webpack.
1. Added `clean-webpack-plugin` to webpack.

---

## 0.1.0

### Improvements

1. Added webpack as module bundler
1. Webpack outputs the library as UMD module (global: `proxyStorage`)
