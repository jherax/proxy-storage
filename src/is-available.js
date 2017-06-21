/**
 * @public
 *
 * Used to determine which storage mechanisms are available.
 *
 * @type {object}
 */
export const isAvailable = {
  localStorage: false,
  cookieStorage: false,
  sessionStorage: false,
  memoryStorage: true, // fallback storage
};
