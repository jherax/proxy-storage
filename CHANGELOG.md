# 1.0.0

### Features

1. Added keys and `length` to the `WebStorage` instances.

### Breaking changes

The method `setItem` has changed its signature when the storage mechanism is set to `"cookieStorage"`
<br/>See more documentation [here](README.md#setitem-for-cookiestorage).

**New signature**

```javascript
setItem (key {string}, value {any}, options {object});
```

**Old signature**

```javascript
setItem (key {string}, value {any}, expires {number}, path {string});
```

# 0.3.0

### Features

1. Added the static method `WebStorage.interceptors()`

# 0.2.0

### Improvements

1. Added `eslint-config-google`
2. Added `eslint-loader` to webpack
3. Added `clean-webpack-plugin` to webpack

# 0.1.0

### Improvements

1. Added webpack as module bundler
2. Webpack outputs the library as UMD module (global: `proxyStorage`)
