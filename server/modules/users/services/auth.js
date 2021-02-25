import { OAuth2Client } from 'google-auth-library';
import uuid from 'uuid';
import User from '../../../models/user';
import JWT from '../../../helpers/JWT';
import { status as userStatus } from '../../../constants/user';
import { googleClientId, googleSecret } from '../../../config';

export default class AuthService {
  static async authenticate({ email = '', password }) {
    const user = await User.findOne({
      where: {
        email,
        status: userStatus.ACTIVE,
      },
    });

    if (!user || !(await user.comparePassword(password))) {
      throw new Error('LOG-0001');
    }

    const [accessToken, refreshToken] = await Promise.all([
      JWT.generateToken(user.toPayload()),
      JWT.generateRefreshToken(user.id),
    ]);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
    };
  }

  static getUserById(userId) {
    return User.findByPk(userId);
  }
}
