/**
 * @public
 *
 * Used to determine which storage mechanisms are available.
 *
 * @type {object}
 */
export const isAvailable = {
  localStorage: false,
  sessionStorage: false,
  cookieStorage: false,
  memoryStorage: true, // fallback storage
};
