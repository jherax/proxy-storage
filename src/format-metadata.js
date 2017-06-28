/**
 * @private
 *
 * Builds the string for the cookie metadata.
 *
 * @param  {string} key: name of the metadata
 * @param  {object} data: metadata of the cookie
 * @return {string}
 */
function buildMetadataFor(key, data) {
  if (!data[key]) return '';
  return `;${key}=${data[key]}`;
}

/**
 * Builds the whole string for the cookie metadata.
 *
 * @param  {object} data: metadata of the cookie
 * @return {string}
 */
export default function formatMetadata(data) {
  const expires = buildMetadataFor('expires', data);
  const domain = buildMetadataFor('domain', data);
  const path = buildMetadataFor('path', data);
  const secure = data.secure ? ';secure' : '';
  return `${expires}${domain}${path}${secure}`;
}
