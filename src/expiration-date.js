/**
 * @private
 *
 * Adds or subtracts date portions to the given date and returns the new date.
 * @see https://gist.github.com/jherax/bbc43e479a492cc9cbfc7ccc20c53cd2
 *
 * @param  {object} options: It contains the date parts to add or remove, and can have the following properties:
 *         - {Date} date: if provided, this date will be affected, otherwise the current date will be used.
 *         - {number} minutes: minutes to add/subtract
 *         - {number} hours: hours to add/subtract
 *         - {number} days: days to add/subtract
 *         - {number} months: months to add/subtract
 *         - {number} years: years to add/subtract
 * @return {Date}
 */
function alterDate(options = {}) {
  const opt = Object.assign({}, options);
  const d = opt.date instanceof Date ? opt.date : new Date();
  if (+opt.minutes) d.setMinutes(d.getMinutes() + opt.minutes);
  if (+opt.hours) d.setHours(d.getHours() + opt.hours);
  if (+opt.days) d.setDate(d.getDate() + opt.days);
  if (+opt.months) d.setMonth(d.getMonth() + opt.months);
  if (+opt.years) d.setFullYear(d.getFullYear() + opt.years);
  return d;
}

/**
 * Builds the expiration for the cookie.
 *
 * @param  {Date|object} date: the expiration date
 * @return {string}
 */
export default function buildExpiration(date) {
  const expires = (date instanceof Date ?
    alterDate({date}) :
    alterDate(date));
  return expires.toUTCString();
}
