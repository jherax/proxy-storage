/**
 * Determines whether a value is a plain object.
 *
 * @param  {any} value: the object to test
 * @return {boolean}
 */
export function isObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

/**
 * Validates if the key is not empty.
 * (null, undefined or empty string)
 *
 * @param  {string} key: keyname of an element in the storage mechanism
 * @return {void}
 */
export function checkEmpty(key) {
  if (key == null || key === '') {
    throw new Error('The key provided can not be empty');
  }
}

/**
 * Creates a non-enumerable read-only property.
 *
 * @param  {object} obj: the object to add the property
 * @param  {string} name: the name of the property
 * @param  {any} value: the value of the property
 * @return {void}
 */
export function setProperty(obj, name, value) {
  const descriptor = {
    configurable: false,
    enumerable: false,
    writable: false,
  };
  if (typeof value !== 'undefined') {
    descriptor.value = value;
  }
  Object.defineProperty(obj, name, descriptor);
}

/**
 * Try to parse a value from JSON.
 *
 * @param  {string} value: the value to parse
 * @return {any}
 */
export function tryParse(value) {
  let parsed;
  try {
    parsed = JSON.parse(value);
  } catch (e) {
    parsed = value;
  }
  return parsed;
}
