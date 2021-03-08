import User from '../../../models/user';
import DeviceToken from '../../../models/deviceToken';
import JWT from '../../../helpers/JWT';
import Zalo from '../../../helpers/Zalo';
import Facebook from '../../../helpers/Facebook';
import RedisService from '../../../helpers/Redis';
import SpeedSMS from '../../../helpers/SpeedSMS';
import { status as userStatus, socialAccount } from '../../../constants';
import { randomNumber } from '../../../helpers/Util';

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
    await RedisService.saveAccessToken(user.id, accessToken);
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

    const verifyCode = randomNumber();

    const foo = await SpeedSMS.sendSMS({
      to: phoneNumber,
      content: `Your verify code: ${verifyCode}`,
    });
    console.log('foo', foo);

    if (user) {
      throw new Error('REG-0001');
    }

    const userCreated = await User.create({ phoneNumber, password, name });

    if (deviceToken) {
      DeviceToken.create({ token: deviceToken, type, userId: userCreated.id });
    }

    await RedisService.saveVerifyCode(userCreated.id, verifyCode);

    const [accessToken, refreshToken] = await Promise.all([
      JWT.generateToken(userCreated.toPayload()),
      JWT.generateRefreshToken(userCreated.id),
    ]);
    await RedisService.saveAccessToken(userCreated.id, accessToken);
    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
    };
  }

  static async verifyCode(userId, verifyCode) {
    const user = await User.findByPk(userId);

    if (Number(user.status) === userStatus.ACTIVE) {
      throw new Error('USER-2001');
    }

    const userVerifyCode = await RedisService.getVerifyCode(user.id);
    if (userVerifyCode !== verifyCode) {
      throw new Error('USER-2002');
    }

    User.update(
      { status: userStatus.ACTIVE, verifiedAt: new Date() },
      {
        where: {
          id: user.id,
        },
      }
    );

    await RedisService.removeVerifyCode(user.id);
  }

  static async handleFacebookAuth(fbToken) {
    const fbUser = await Facebook.getUser(fbToken).catch(() => {
      throw new Error('LOG-0005');
    });
    let user = await User.findOne({
      include: [User.includeFacebookAccount(fbUser.id)],
    });

    if (!user) {
      user = await User.create(
        {
          name: fbUser.name,
          phoneNumber: null,
          avatar: fbUser.picture && fbUser.picture.data.url,
          password: fbToken,
          status: userStatus.ACTIVE,
          socialAccounts: {
            socialId: fbUser.id,
            type: socialAccount.FACEBOOK,
          },
        },
        {
          include: [User.includeFacebookAccount(fbUser.id)],
        }
      );
    }

    const [accessToken, refreshToken] = await Promise.all([
      JWT.generateToken(user.toPayload()),
      JWT.generateRefreshToken(user.id),
    ]);
    await RedisService.saveAccessToken(user.id, accessToken);
    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
    };
  }

  static async handleZaloAuth(zaloCode) {
    const zaloToken = await Zalo.getAccessToken(zaloCode);
    const zaloUser = await Zalo.getUser(zaloToken);
    let user = await User.findOne({
      include: [User.includeZaloAccount(zaloUser.id)],
    });

    if (!user) {
      user = await User.create(
        {
          name: zaloUser.name,
          phoneNumber: null,
          avatar: zaloUser.picture && zaloUser.picture.data.url,
          password: zaloToken,
          status: userStatus.ACTIVE,
          socialAccounts: {
            socialId: zaloUser.id,
            type: socialAccount.ZALO,
          },
        },
        {
          include: [User.includeZaloAccount(zaloUser.id)],
        }
      );
    }

    const [accessToken, refreshToken] = await Promise.all([
      JWT.generateToken(user.toPayload()),
      JWT.generateRefreshToken(user.id),
    ]);
    await RedisService.saveAccessToken(user.id, accessToken);
    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
    };
  }

  static async logout(user, token) {
    return RedisService.removeAccessToken(user.id, token);
  }
}
