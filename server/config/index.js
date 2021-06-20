import DotENV from 'dotenv';
import databaseConfig from './database';

DotENV.config();

export * from './zalo';
export * from './speedsms';
export * from './facebook';
export * from './redis';
export * from './file_systems';
export * from './twilio';
export * from './sentry';
export * from './ocr';

export const env = process.env.NODE_ENV || 'development';
export const port = process.env.PORT || 'http://localhost:3000';
export const debug = process.env.DEBUG === 'true' || false;
export const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;
export const jwtSecretKey = process.env.JWT_SECRET_KEY || 'jwt_secret';
export const jwtRefreshKey = process.env.JWT_REFRESH_KEY || 'jwt_refresh';
export const jwtExpireTime = process.env.JWT_EXPIRE_TIME || '1h';
export const jwtRefreshExpireTime = process.env.JWT_REFRESH_EXPIRE_TIME || '30d';
export const googleClientId = process.env.GOOGLE_ID;
export const googleSecret = process.env.GOOGLE_SECRET;
export const dbConfig = databaseConfig;
export const verifyCodeExpiredTime = process.env.VERIFY_CODE_EXPIRE_TIME || '300';
