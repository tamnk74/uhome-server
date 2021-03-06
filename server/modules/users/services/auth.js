import User from '../../../models/user';
import DeviceToken from '../../../models/deviceToken';
import JWT from '../../../helpers/JWT';
import Zalo from '../../../helpers/Zalo';
import Facebook from '../../../helpers/Facebook';
import { status as userStatus } from '../../../constants';

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

  static updateUser(userId, data) {
    return User.update(data, {
      where: {
        id: userId,
      },
    });
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

  static async handleFacebookAuth(fbToken) {
    const fbUser = await Facebook.getUser(fbToken).catch(() => {
      throw new Error('LOG-0005');
    });
    const user = await User.findOne({
      include: [User.includeFacebookAccount(fbUser.id)],
    });

    if (!user) {
      throw new Error('LOG-0003');
    }

    if (user.status === userStatus.IN_ACTIVE) {
      throw new Error('LOG-0002');
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

  static async handleZaloAuth(zaloCode) {
    const zaloToken = await Zalo.getAccessToken(zaloCode);
    const zaloUser = await Zalo.getUser(zaloToken);
    console.log(zaloToken, zaloUser);
    const user = await User.findOne({
      include: [User.includeZaloAccount(zaloUser.id)],
    });

    if (!user) {
      throw new Error('LOG-0004');
    }

    if (user.status === userStatus.IN_ACTIVE) {
      throw new Error('LOG-0002');
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
}
