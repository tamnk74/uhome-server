import User from '../../../models/user';
import DeviceToken from '../../../models/deviceToken';
import JWT from '../../../helpers/JWT';
import { status as userStatus } from '../../../constants/user';

export default class AuthService {
  static async authenticate({ phoneNumber = '', password }) {
    const user = await User.findOne({
      where: {
        phoneNumber,
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

  static async register({ phoneNumber, password, name, deviceToken = null, type = null }) {
    const user = await User.findOne({
      where: {
        phoneNumber,
      },
    });

    if (user) {
      throw new Error('REG-0001');
    }

    const userCreated = await User.create({ phoneNumber, password, name });

    if (deviceToken) {
      DeviceToken.create({ token: deviceToken, type, userId: userCreated.id });
    }

    const [accessToken, refreshToken] = await Promise.all([
      JWT.generateToken(userCreated.toPayload()),
      JWT.generateRefreshToken(userCreated.id),
    ]);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
    };
  }
}
