import JsonWebToken from 'jsonwebtoken';
import { jwtExpireTime, jwtSecretKey, jwtRefreshKey, jwtRefreshExpireTime } from '../config';

export default class JWT {
  static getToken(req) {
    if (req.headers && req.headers.authorization) {
      const { authorization } = req.headers;
      if (authorization && authorization.startsWith('Bearer ')) {
        return authorization.slice(7, authorization.length);
      }
    }
    if (req.query && req.query.token) {
      return req.query.token;
    }
    if (req.socket && req.socket.handshake && req.socket.handshake.headers.authorization) {
      const { authorization } = req.socket.handshake.headers;
      if (authorization && authorization.startsWith('Bearer ')) {
        return authorization.slice(7, authorization.length);
      }
    }

    return null;
  }

  static generateToken(payload) {
    return JsonWebToken.sign(payload, jwtSecretKey, {
      expiresIn: jwtExpireTime,
    });
  }

  static generateRefreshToken(userId) {
    return JsonWebToken.sign({ userId }, jwtRefreshKey, {
      expiresIn: jwtRefreshExpireTime,
    });
  }

  static verifyRefreshToken(refreshToken) {
    return JsonWebToken.verify(refreshToken, jwtRefreshKey);
  }
}
