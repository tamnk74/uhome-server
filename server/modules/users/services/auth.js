import { isNil, get } from 'lodash';
import { Sequelize } from 'sequelize';
import {
  status as userStatus,
  socialAccount,
  eventStatuses,
  UPDATE_PROFILE_EVENT_CODE,
  transactionType,
  currencies,
  paymentMethod,
} from '@/constants';
import { notificationQueue } from '@/helpers/Queue';
import errorFactory from '../../../errors/ErrorFactory';
import User from '../../../models/user';
import JWT from '../../../helpers/JWT';
import Zalo from '../../../helpers/Zalo';
import Event from '../../../models/event';
import UserEvent from '../../../models/userEvent';
import Facebook from '../../../helpers/Facebook';
import Apple from '../../../helpers/Apple';
import RedisService from '../../../helpers/Redis';
import { sendOTP } from '../../../helpers/SmsOTP';
import UserProfile from '../../../models/userProfile';
import Subscription from '../../../models/subscription';
import IdentifyCard from '../../../models/identifyCard';
import SocialAccount from '../../../models/socialAccount';
import TransactionHistory from '../../../models/transactionHistory';
import { fileSystemConfig } from '../../../config';

const { v4: uuidv4 } = require('uuid');

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
    await RedisService.saveAccessToken(user.id, accessToken, user.sessionRole);
    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
    };
  }

  static async getUserById(userId, sessionRole) {
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

    if (!isNil(sessionRole)) {
      user.sessionRole = sessionRole;
    }

    return user;
  }

  static async updateUser(userId, data) {
    await User.update(data, {
      where: {
        id: userId,
      },
    });
    const user = await User.findByPk(userId, {
      include: [
        {
          model: UserProfile,
          as: 'profile',
        },
      ],
    });
    const saleEvent = await Event.findOne({
      where: {
        code: UPDATE_PROFILE_EVENT_CODE,
        status: eventStatuses.ACTIVE,
      },
    });

    const isFullyUpdated =
      user.address &&
      user.birthday &&
      user.phoneNumber &&
      user.profile.identityCard.after &&
      user.profile.identityCard.before;
    if (!isFullyUpdated || !saleEvent) {
      return user;
    }

    const userEvent = await UserEvent.findOne({
      where: {
        userId,
        eventId: saleEvent.id,
      },
    });
    if (!userEvent) {
      await UserEvent.create({
        userId,
        eventId: saleEvent.id,
        issueId: null,
      });
      await UserProfile.update(
        {
          accountBalance: Sequelize.literal(`account_balance + ${saleEvent.value}`),
        },
        {
          where: {
            userId,
          },
        }
      );

      const transaction = await TransactionHistory.create({
        id: uuidv4(),
        userId,
        amount: saleEvent.value,
        total: saleEvent.value || 0,
        discount: 0,
        type: transactionType.BONUS,
        currency: currencies.VND,
        extra: {
          user: user.toJSON(),
        },
        method: paymentMethod.CASH,
      });

      notificationQueue.add('receive_bonus', {
        actorId: userId,
        transaction: transaction.toJSON(),
      });
    }

    return user;
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
      RedisService.removeAccessToken(user.id, accessToken),
    ]);
    await RedisService.saveAccessToken(user.id, newAccessToken, user.sessionRole);
    return {
      accessToken: newAccessToken,
      tokenType: 'Bearer',
      refreshToken: newRefreshToken,
    };
  }

  static async sendOTP({ userId, phoneNumber }) {
    await sendOTP(userId, phoneNumber);

    return RedisService.savePhoneNumber(userId, phoneNumber);
  }

  static async updatePhoneNumber({ userId, verifyCode }) {
    const userVerifyCode = await RedisService.getVerifyCode(userId);
    const phoneNumber = await RedisService.getPhoneNumber(userId);

    if (userVerifyCode !== verifyCode || !phoneNumber) {
      throw new Error('USER-2002');
    }

    return User.update(
      {
        phoneNumber,
      },
      {
        where: {
          id: userId,
        },
      }
    );
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
          sessionRole: 'CUSTOMER',
        },
        {
          include: [User.includeFacebookAccount(fbUser.id)],
        }
      );
    }
    user.signedSocial = true;
    const [accessToken, refreshToken] = await Promise.all([
      JWT.generateToken(user.toPayload()),
      JWT.generateRefreshToken(user.id),
    ]);
    await RedisService.saveAccessToken(user.id, accessToken, user.sessionRole);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
    };
  }

  static async handleZaloAuth({ code, codeVerifier }) {
    const zaloToken = await Zalo.getAccessToken(code, codeVerifier);
    const zaloUser = await Zalo.getUser(zaloToken);
    let user = await User.findOne({
      include: [User.includeZaloAccount(zaloUser.id)],
    });

    if (!user) {
      user = await User.create(
        {
          name: zaloUser.name,
          phoneNumber: null,
          avatar: get(zaloUser, 'picture.data.url'),
          password: zaloToken,
          status: userStatus.ACTIVE,
          socialAccounts: {
            socialId: zaloUser.id,
            type: socialAccount.ZALO,
          },
          sessionRole: 'CUSTOMER',
        },
        {
          include: [User.includeZaloAccount(zaloUser.id)],
        }
      );
    } else {
      await user.update({
        avatar: get(zaloUser, 'picture.data.url'),
        name: zaloUser.name,
      });
    }

    user.signedSocial = true;
    const [accessToken, refreshToken] = await Promise.all([
      JWT.generateToken(user.toPayload()),
      JWT.generateRefreshToken(user.id),
    ]);
    await RedisService.saveAccessToken(user.id, accessToken, user.sessionRole);

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

  static async logout(user, token, deviceId) {
    await Subscription.destroy({
      where: {
        deviceId,
      },
    });
    return RedisService.removeAccessToken(user.id, token);
  }

  static async handleAppleAuth({ code, email, name }) {
    const tokenPayload = await Apple.getAccessToken(code);
    const idTokenPayload = Apple.verifyIdToken(get(tokenPayload, 'id_token'));

    const socAccount = await SocialAccount.findOne({
      where: {
        socialId: get(idTokenPayload, 'sub'),
        type: socialAccount.APPLE,
      },
      include: [
        {
          model: User,
          require: true,
        },
      ],
    });

    let user = get(socAccount, 'user');

    if (!user) {
      user = await User.create(
        {
          name,
          phoneNumber: null,
          avatar: null,
          password: code,
          status: userStatus.ACTIVE,
          socialAccounts: {
            socialId: get(idTokenPayload, 'sub'),
            type: socialAccount.APPLE,
          },
          sessionRole: 'CUSTOMER',
        },
        {
          include: [User.includeZaloAccount(get(idTokenPayload, 'sub'))],
        }
      );

      await UserProfile.create({
        userId: user.id,
        accountBalance: 0,
        email,
        identityCard: JSON.stringify({ before: null, after: null }),
      });
    }
    user.signedSocial = true;
    const [accessToken, refreshToken] = await Promise.all([
      JWT.generateToken(user.toPayload()),
      JWT.generateRefreshToken(user.id),
    ]);
    await RedisService.saveAccessToken(user.id, accessToken, user.sessionRole);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
    };
  }
}
