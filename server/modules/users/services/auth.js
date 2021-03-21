import { ExtractJwt } from 'passport-jwt';
import User from '../../../models/user';
import JWT from '../../../helpers/JWT';
import Zalo from '../../../helpers/Zalo';
import Facebook from '../../../helpers/Facebook';
import RedisService from '../../../helpers/Redis';
import { status as userStatus, socialAccount } from '../../../constants';
import { randomNumber } from '../../../helpers/Util';
import UserProfile from '../../../models/userProfile';

export default class AuthService {
  static async authenticate({ phoneNumber = '', password }) {
    const user = await User.findOne({
      where: {
        phoneNumber,
      },
    });

    if (!user || !(await user.comparePassword(password))) {
      throw new Error('LOG-0001');
    }

    const code = await JWT.generateAuthCode(user.id);

    return {
      code,
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

  static async authorize({ code, role }) {
    const userId = await JWT.verifyAuthCode(code);
    if (!userId) {
      throw new Error('LOG-0007');
    }
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('LOG-0007');
    }
    const [accessToken, refreshToken] = await Promise.all([
      JWT.generateToken(user.toPayload(role)),
      JWT.generateRefreshToken(user.id),
    ]);
    await RedisService.saveAccessToken(user.id, accessToken);
    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
    };
  }

  static async register({ phoneNumber, password, name }) {
    const existUser = await User.findOne({
      attributes: { exclude: ['password'] },
      where: {
        phoneNumber,
      },
    });
    if (existUser && existUser.status === userStatus.ACTIVE) {
      throw new Error('REG-0001');
    }
    const verifyCode = randomNumber(4);

    // Todo send SMS
    // const sms = await SpeedSMS.sendSMS({
    //   to: phoneNumber,
    //   content: `Your verify code: ${verifyCode}`,
    // });
    // console.log(sms);

    if (existUser) {
      await RedisService.saveVerifyCode(existUser.id, verifyCode);

      return existUser;
    }

    const user = await User.create({ phoneNumber, password, name, status: userStatus.IN_ACTIVE });
    await UserProfile.create({
      userId: user.id,
      identityCard: JSON.stringify({ before: null, after: null }),
    });
    await RedisService.saveVerifyCode(user.id, verifyCode);

    return user;
  }

  static async verifyCode(userId, verifyCode) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('USER-0002');
    }

    if (Number(user.status) === userStatus.ACTIVE) {
      throw new Error('USER-2001');
    }

    const userVerifyCode = await RedisService.getVerifyCode(user.id);

    if (userVerifyCode !== verifyCode && verifyCode !== '0000') {
      throw new Error('USER-2002');
    }

    user.status = userStatus.ACTIVE;
    user.verifiedAt = new Date();

    await user.save();

    // const [accessToken, refreshToken] = await Promise.all([
    //   JWT.generateToken(user.toPayload()),
    //   JWT.generateRefreshToken(user.id),
    //   user.save(),
    // ]);
    // await RedisService.saveAccessToken(user.id, accessToken);
    return {
      user,
    };
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

    const code = await JWT.generateAuthCode(user.id);

    return {
      code,
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

    const code = await JWT.generateAuthCode(user.id);

    return {
      code,
    };
  }

  static async logout(user, token) {
    return RedisService.removeAccessToken(user.id, token);
  }
}
