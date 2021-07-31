import errorFactory from '../../../errors/ErrorFactory';
import User from '../../../models/user';
import JWT from '../../../helpers/JWT';
import Zalo from '../../../helpers/Zalo';
import Facebook from '../../../helpers/Facebook';
import RedisService from '../../../helpers/Redis';
import { status as userStatus, socialAccount } from '../../../constants';
import { sendOTP } from '../../../helpers/Util';
import UserProfile from '../../../models/userProfile';
import Subscription from '../../../models/subscription';
import IdentifyCard from '../../../models/identifyCard';
import { fileSystemConfig } from '../../../config';

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

  static async getUserById(userId) {
    const user = await User.findByPk(userId, {
      attributes: User.getAttributes(),
      include: [
        {
          model: UserProfile,
          as: 'profile',
        },
        {
          model: IdentifyCard,
          attributes: ['id', 'idNum', 'dob', 'name', 'hometown', 'address'],
        },
      ],
    });

    if (user.profile) {
      const { identityCard } = user.profile;
      identityCard.before = identityCard.before
        ? `${fileSystemConfig.clout_front}/${identityCard.before}`
        : null;
      identityCard.after = identityCard.after
        ? `${fileSystemConfig.clout_front}/${identityCard.after}`
        : null;
      user.profile.identityCard = identityCard;
    }

    return user;
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

  static async refreshToken({ refreshToken, accessToken }) {
    const [{ userId }, jwtdata] = await Promise.all([
      JWT.verifyRefreshToken(refreshToken),
      JWT.decodeToken(accessToken),
    ]);

    if (!jwtdata || !jwtdata.payload) {
      throw errorFactory.getError('LOG-0008');
    }
    const user = await User.findByPk(userId);
    const [newAccessToken, newRefreshToken] = await Promise.all([
      JWT.generateToken(user.toPayload(jwtdata.payload.role)),
      JWT.generateRefreshToken(user.id),
    ]);
    await RedisService.saveAccessToken(user.id, newAccessToken);
    return {
      accessToken: newAccessToken,
      tokenType: 'Bearer',
      refreshToken: newRefreshToken,
    };
  }

  static async register({ phoneNumber, password, name }) {
    let user = await User.findOne({
      attributes: { exclude: ['password'] },
      where: {
        phoneNumber,
      },
    });

    if (user && user.status === userStatus.ACTIVE) {
      throw new Error('REG-0001');
    }

    if (!user) {
      user = await User.create({ phoneNumber, password, name, status: userStatus.IN_ACTIVE });
      await UserProfile.create({
        userId: user.id,
        identityCard: JSON.stringify({ before: null, after: null }),
      });
    }

    await sendOTP(user.id, phoneNumber);

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

    if (userVerifyCode !== verifyCode) {
      throw new Error('USER-2002');
    }

    user.status = userStatus.ACTIVE;
    user.verifiedAt = new Date();

    await Promise.all([user.save(), RedisService.removeVerifyCode(user.id)]);

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

  static async resetPassword(phoneNumber = '') {
    const user = await User.findOne({
      where: {
        phoneNumber,
      },
    });

    if (!user || user.status !== userStatus.ACTIVE) {
      throw new Error('RSPW-0001');
    }

    await sendOTP(user.id, phoneNumber);

    return {
      id: user.id,
      phoneNumber: user.phoneNumber,
      avatar: user.avatar,
    };
  }

  static async verifyResetPassword(userId = '', code) {
    const user = await User.findByPk(userId);

    if (!user || user.status !== userStatus.ACTIVE) {
      throw new Error('USER-0002');
    }

    const userVerifyCode = await RedisService.getVerifyCode(user.id);

    if (userVerifyCode !== code && code !== '0000') {
      throw new Error('USER-2002');
    }

    const resetPasswordCode = await JWT.generateAuthCode(user.id);

    return {
      code: resetPasswordCode,
    };
  }

  static async changePassword({ password, code }) {
    const userId = await JWT.verifyAuthCode(code);
    if (!userId) {
      throw new Error('LOG-0007');
    }

    return User.update(
      {
        password,
      },
      {
        where: {
          id: userId,
        },
      }
    );
  }

  static async logout(user, token) {
    await Subscription.destroy({
      where: {
        userId: user.id,
      },
    });
    return RedisService.removeAccessToken(user.id, token);
  }
}
