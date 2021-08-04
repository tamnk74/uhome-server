import fs from 'fs';
import util from 'util';
import SpeedSMS from './SpeedSMS';
import RedisService from './Redis';
import { otpLength } from '../config';

const { snakeCase, camelCase } = require('lodash');
const Sequelize = require('sequelize');

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
      result[camelKey] = obj[key].map((item) => {
        if (typeof item === 'string' || item instanceof Date) {
          return item;
        }
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          return objectToCamel(item);
        }
        return item;
      });
      return;
    }
    if (typeof obj[key] === 'string' || obj[key] instanceof Date) {
      result[camelKey] = obj[key];
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
  if (obj instanceof Sequelize.Model) {
    obj = obj.toJSON();
  }
  Object.keys(obj).forEach((key) => {
    const snakeKey = snakeCase(key);
    if (Array.isArray(obj[key])) {
      result[snakeKey] = obj[key].map((item) => objectToSnake(item));
      return;
    }
    if (obj[key] instanceof Date) {
      result[snakeKey] = obj[key];
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

export const randomNumber = (length = 6) => {
  const str = '0123456789';
  let result = '';
  for (let i = length; i > 0; --i) result += str[Math.floor(Math.random() * str.length)];
  return result;
};

export const toPlain = (response) => {
  const flattenDataValues = ({ dataValues }) => {
    const flattenedObject = {};

    Object.keys(dataValues).forEach((key) => {
      const dataValue = dataValues[key];

      if (
        Array.isArray(dataValue) &&
        dataValue[0] &&
        dataValue[0].dataValues &&
        typeof dataValue[0].dataValues === 'object'
      ) {
        flattenedObject[key] = dataValues[key].map(flattenDataValues);
      } else if (dataValue && dataValue.dataValues && typeof dataValue.dataValues === 'object') {
        flattenedObject[key] = flattenDataValues(dataValues[key]);
      } else {
        flattenedObject[key] = dataValues[key];
      }
    });

    return flattenedObject;
  };

  return Array.isArray(response) ? response.map(flattenDataValues) : flattenDataValues(response);
};

export const toRad = (value) => (value * Math.PI) / 180;

export const distance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const { sin, cos, atan2: atan, sqrt } = Math;
  const dLatR = toRad(lat2 - lat1);
  const dLonR = toRad(lon2 - lon1);
  const lat1R = toRad(lat1);
  const lat2R = toRad(lat2);
  const a =
    sin(dLatR / 2) * sin(dLatR / 2) + cos(lat1R) * cos(lat2R) * sin(dLonR / 2) * sin(dLonR / 2);
  const b = 2 * atan(sqrt(a), sqrt(1 - a));
  return R * b; // Km
};

export const readFile = util.promisify(fs.readFile);

export const sendOTP = async (id, phoneNumber) => {
  const verifyCode = randomNumber(otpLength);

  await RedisService.saveVerifyCode(id, verifyCode);

  await SpeedSMS.sendSMS({
    to: [phoneNumber],
    // eslint-disable-next-line no-undef
    content: __('otp.sms', { code: verifyCode }),
  });
};
