/**
 * Stores the interceptors for WebStorage methods.
 *
 * @type {object}
 */
export const INTERCEPTORS = {
  setItem: [],
  getItem: [],
  removeItem: [],
  clear: [],
};

/**
 * Executes the interceptors for a WebStorage method and allows
 * the transformation in chain of the value passed through.
 *
 * @param  {string} command: name of the method to intercept
 * @return {any}
 */
export default function executeInterceptors(command, ...args) {
  const key = args.shift();
  let value = args.shift();
  if (value && typeof value === 'object') {
    // clone the object to prevent mutations
    value = JSON.parse(JSON.stringify(value));
  }
  return INTERCEPTORS[command].reduce((val, action) => {
    const transformed = action(key, val, ...args);
    if (transformed == null) return val;
    return transformed;
  }, value);
}
