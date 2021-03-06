import camelCase from 'lodash/camelCase';
import snakeCase from 'lodash/snakeCase';

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

export const objectToCamel = (obj) => {
  const result = {};
  Object.keys(obj).forEach((key) => {
    const camelKey = camelCase(key);
    if (Array.isArray(obj[key])) {
      result[camelKey] = obj[key].map((item) => objectToCamel(item));
      return;
    }
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      result[camelKey] = objectToCamel(obj[key]);
      return;
    }
    result[camelKey] = obj[key];
  });

  return result;
};

export const objectToSnake = (obj) => {
  const result = {};
  Object.keys(obj).forEach((key) => {
    const snakeKey = snakeCase(key);
    if (Array.isArray(obj[key])) {
      result[snakeKey] = obj[key].map((item) => objectToSnake(item));
      return;
    }
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      result[snakeKey] = objectToSnake(obj[key]);
      return;
    }
    result[snakeKey] = obj[key];
  });

  return result;
};
