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
 * Allows add or subtract timestamps to the current date or to a specific date.
 *
 * @param  {object} options: It contains the timestamps to add or remove to the date, and have the following properties:
 *         - {Date} date: if provided, the timestamps will affect this date, otherwise a new current date will be used.
 *         - {number} hours: hours to add/subtract
 *         - {number} days: days to add/subtract
 *         - {number} months: months to add/subtract
 *         - {number} years: years to add/subtract
 * @return {Date}
 */
export function setTimestamp(options = {}) {
  const opt = Object.assign({}, options);
  let d = opt.date instanceof Date ? opt.date : new Date();
  if (+opt.hours) d.setHours(d.getHours() + opt.hours);
  if (+opt.days) d.setDate(d.getDate() + opt.days);
  if (+opt.months) d.setMonth(d.getMonth() + opt.months);
  if (+opt.years) d.setFullYear(d.getFullYear() + opt.years);
  return d;
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
  let descriptor = {
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
 * Validates if the key is not empty.
 * (null, undefined either empty string)
 *
 * @param  {string} key: keyname of an element in the storage mechanism
 * @return {void}
 */
export function checkEmpty(key) {
  if (key == null || key === '') {
    throw new Error('The key provided can not be empty');
  }
}
