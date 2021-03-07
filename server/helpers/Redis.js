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
const userPrefix = 'user:';

export default class RedisService {
  static saveAccessToken(userId, token) {
    return redis.hset(authPrefix + userId, token, Date.now());
  }

  static isExistAccessToken(userId, token) {
    return redis.hexists(authPrefix + userId, token);
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
}
