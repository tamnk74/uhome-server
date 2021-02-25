exports.mapKeys = (mapKeys, obj) => {
  const result = {};
  Object.keys(obj).forEach((key) => {
    if (mapKeys.includes(key)) {
      result[mapKeys[key]] = obj[key];
    }
  });

  return result;
};

/**
 * Deeply trim space for all properties of an object
 *
 * @param {Object} obj
 * @returns {Object} obj
 */
export const trimObject = function trimObject(obj) {
  if (!obj) return;
  Object.keys(obj).forEach((key) => {
    if (typeof obj[key] === 'string') {
      obj[key] = obj[key].trim().replace(/\s\s+/g, ' ');
    }
    if (typeof obj[key] === 'object') {
      obj[key] = trimObject(obj[key]);
    }
  });

  return obj;
};

/**
 * Remove diacritic in vietnamese
 *
 * @param {String} str
 * @returns {String} str
 */
exports.removeDiacritic = (str) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
};

export const convertToSlug = (str) =>
  str
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
