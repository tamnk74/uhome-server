import Redis from 'ioredis';
import { redisConfig, verifyCodeExpiredTime } from '../config';

const redis = new Redis({
  port: redisConfig.port,
  host: redisConfig.host,
  user: redisConfig.user,
  password: redisConfig.password,
  db: redisConfig.db,
});
const authPrefix = 'auth:';
const oauthPrefix = 'oauth:';
const userPrefix = 'user:';

export default class RedisService {
  static saveAccessToken(userId, token, value = Date.now()) {
    return redis.hset(authPrefix + userId, token, value);
  }

  static saveOauthCode(userId, code) {
    return redis.set(`${oauthPrefix}${code}`, userId, 'EX', 3600);
  }

  static getOauthCode(code) {
    return redis.get(`${oauthPrefix}${code}`);
  }

  static isExistAccessToken(userId, token) {
    return redis.hexists(authPrefix + userId, token);
  }

  static getRoleAccessToken(userId, token) {
    return redis.hget(authPrefix + userId, token);
  }

  static removeAccessToken(userId, token) {
    return redis.hdel(authPrefix + userId, token);
  }

  static saveVerifyCode(userId, verifyCode) {
    return redis.set(`${userPrefix + userId}:verify_code`, verifyCode, 'EX', verifyCodeExpiredTime);
  }

  static getVerifyCode(userId) {
    return redis.get(`${userPrefix + userId}:verify_code`);
  }

  static removeVerifyCode(userId) {
    return redis.del(`${userPrefix + userId}:verify_code`);
  }

  static getSmsCounter(userId) {
    return redis.get(`${userPrefix + userId}:otp_counter`);
  }

  static saveSmsCounter(userId, counter) {
    return redis.set(`${userPrefix + userId}:otp_counter`, counter);
  }

  static savePhoneNumber(userId, phoneNumber) {
    return redis.set(
      `${userPrefix + userId}:phone_number`,
      phoneNumber,
      'EX',
      verifyCodeExpiredTime
    );
  }

  static getPhoneNumber(userId) {
    return redis.get(`${userPrefix + userId}:phone_number`);
  }
}
