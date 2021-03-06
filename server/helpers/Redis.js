import Redis from 'ioredis';
import { redisConfig } from '../config';

const redis = new Redis({
  port: redisConfig.port,
  host: redisConfig.host,
  user: redisConfig.user,
  password: redisConfig.password,
  db: redisConfig.db,
});
const authPrefix = 'auth:';

export default class RedisService {
  static saveAccessToken(userId, token) {
    console.log(authPrefix + userId, token, Date.now());
    return redis.hset(authPrefix + userId, token, Date.now());
  }

  static isExistAccessToken(userId, token) {
    return redis.hexists(authPrefix + userId, token);
  }

  static removeAccessToken(userId, token) {
    return redis.hdel(authPrefix + userId, token);
  }
}
