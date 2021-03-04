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

export const snakeToCamel = (str) =>
  str
    .toLowerCase()
    .replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', ''));

export const objectToCamel = (obj) => {
  const result = {};
  Object.keys(obj).forEach((key) => {
    const camelKey = snakeToCamel(key);
    if (Array.isArray(obj[key])) {
      result[camelKey] = obj[key].map((item) => objectToCamel(item));
    }
    if (typeof obj[key] === 'object') {
      result[camelKey] = objectToCamel(obj[key]);
    }
    result[camelKey] = obj[key];
  });

  return result;
};

export const camelToSnakeCase = (str) =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

export const objectToSnake = (obj) => {
  const result = {};
  Object.keys(obj).forEach((key) => {
    const snakeKey = camelToSnakeCase(key);
    if (Array.isArray(obj[key])) {
      result[snakeKey] = obj[key].map((item) => objectToSnake(item));
    }
    if (typeof obj[key] === 'object') {
      result[snakeKey] = objectToSnake(obj[key]);
    }
    result[snakeKey] = obj[key];
  });

  return result;
};
