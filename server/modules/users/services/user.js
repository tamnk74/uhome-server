import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import { fileSystemConfig } from '../../../config';
import Issue from '../../../models/issue';
import Category from '../../../models/category';
import Attachment from '../../../models/attachment';
import ReceiveIssue from '../../../models/receiveIssue';
import ReceiveIssueComment from '../../../models/receiveIssueComment';
import User from '../../../models/user';
import UserProfile from '../../../models/userProfile';
import { fileType } from '../../../constants/user';

import Uploader from '../../../helpers/Uploader';
import Subscription from '../../../models/subscription';
import Fcm from '../../../helpers/Fcm';
import { idCardStatus } from '../../../constants';
import IdentifyCard from '../../../models/identifyCard';
import TransactionHistory from '../../../models/transactionHistory';
import { sendOTP } from '../../../helpers/Util';

export default class Userervice {
  static async getIssues(query) {
    const { limit, offset, user } = query;
    const options = Issue.buildOptionQuery(query);
    options.where.createdBy = user.id;
    const result = await Issue.findAndCountAll({
      ...options,
      include: [
        {
          model: Category,
          required: false,
          as: 'categories',
        },
        {
          model: Attachment,
          required: false,
          as: 'attachments',
          attributes: [
            'id',
            'size',
            'mimeType',
            'createdAt',
            'updatedAt',
            'issueId',
            'path',
            Attachment.buildUrlAttribuiteSelect(),
          ],
        },
        {
          model: ReceiveIssue,
          required: false,
          as: 'supporting',
          attributes: ['id', 'userId', 'issueId', 'time', 'workerFee', 'customerFee'],
          include: [
            {
              model: User,
              required: false,
              attributes: ['id', 'avatar'],
            },
          ],
        },
      ],
      attributes: Issue.baseAttibutes,
      limit,
      offset,
    });

    const rows = result.rows.map((issue) => {
      const { supporting = {} } = issue;

      if (!supporting) {
        return issue;
      }

      const { user = {} } = supporting;
      supporting.setDataValue('avatar', user.avatar);
      supporting.setDataValue('user', undefined);
      issue.supporting = supporting;

      return issue;
    });

    result.rows = rows;

    return result;
  }

  static async getReceiveIssues(query) {
    const { limit, offset, userId } = query;
    const options = ReceiveIssue.buildOptionQuery(query);
    options.where.userId = userId;
    return ReceiveIssue.findAndCountAll({
      ...options,
      include: [
        {
          model: Issue,
          required: true,
          include: [
            {
              model: Attachment,
              required: false,
              as: 'attachments',
              attributes: [
                'id',
                'size',
                'mimeType',
                'createdAt',
                'updatedAt',
                'issueId',
                'path',
                Attachment.buildUrlAttribuiteSelect(),
              ],
              order: [[Issue, 'created', 'DESC']],
            },
            {
              model: Category,
              as: 'categories',
            },
            {
              model: User,
              as: 'creator',
              attributes: ['id', 'phoneNumber', 'address', 'name', 'avatar', 'lon', 'lat'],
            },
          ],
        },
        {
          model: ReceiveIssueComment,
          required: false,
          include: [
            {
              model: User,
              required: false,
              attributes: ['id', 'name', 'avatar'],
            },
          ],
        },
      ],
      limit,
      offset,
    });
  }

  static async updateProfile(userId, { gender, birthday }) {
    await UserProfile.update(
      {
        gender,
        birthday,
      },
      {
        where: {
          userId,
        },
      }
    );
  }

  static async uploadFile(userId, { file, body: { type } }) {
    const id = uuidv4();
    const fileName = `${id}-${file.originalname}`;
    const path = `users/${type}_${fileName}`;
    const userProfile = await UserProfile.findOne({
      where: {
        userId,
      },
      include: [
        {
          model: User,
          required: false,
        },
      ],
    });
    const identityCard =
      userProfile && userProfile.identityCard
        ? userProfile.identityCard
        : { before: null, after: null };

    await Uploader.upload(file, {
      path,
      'x-amz-meta-mimeType': file.mimetype,
      'x-amz-meta-size': file.size.toString(),
    });
    const { user } = userProfile;
    let pathAvatar = user.avatar;
    let idStatus = 0;
    switch (type) {
      case fileType.AVATAR:
        pathAvatar = path;
        break;
      case fileType.IDENTITY_CARD_BEFORE:
        identityCard.before = path;
        idStatus = idCardStatus.WAITING_VERIFY_CARD;
        break;
      case fileType.IDENTITY_CARD_AFTER:
        identityCard.after = path;
        idStatus = idCardStatus.WAITING_VERIFY_CARD;
        break;
      default:
    }

    await Promise.all([
      UserProfile.update({ identityCard: JSON.stringify(identityCard) }, { where: { userId } }),
      User.update({ idCardStatus: idStatus, avatar: pathAvatar }, { where: { id: userId } }),
    ]);
    return `${fileSystemConfig.clout_front}/${path}`;
  }

  static async getUserById(userId) {
    const user = await User.findByPk(userId, {
      include: [
        {
          model: UserProfile,
          as: 'profile',
        },
        {
          model: Category,
          as: 'categories',
          required: false,
          through: { attributes: [] },
        },
        {
          model: IdentifyCard,
          attributes: ['id', 'idNum', 'dob', 'name', 'hometown', 'address'],
        },
      ],
      attributes: User.getAttributes(),
      nest: true,
    });
    if (!user.profile) {
      const profile = await user.createProfile({
        userId: user.id,
        identityCard: JSON.stringify({ before: null, after: null }),
      });
      user.profile = profile;
    } else {
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

  static async createOrUpdateSkills(userId, payload) {
    return User.updateSkills(userId, payload);
  }

  static async subscribe({ userId, token, role }) {
    await Subscription.destroy({
      where: {
        token,
      },
    });

    await Subscription.create({
      userId,
      token,
      role,
    });

    return Fcm.subscribeNewIssue(token);
  }

  static async unsubscribe({ userId, token }) {
    await Subscription.destroy({
      where: { userId, token },
    });
    return Fcm.unsubscribeNewIssue(token);
  }

  static async updateLatestLocation({ userId, data }) {
    await User.update(data, {
      where: {
        id: userId,
      },
    });
  }

  static async updatePassword({ userId, data }) {
    const { currentPassword, password } = data;
    const user = await User.findByPk(userId);
    const isValidCurrentPassword = user && (await user.comparePassword(currentPassword));

    if (!isValidCurrentPassword) {
      throw new Error('PW-0410');
    }

    return User.update(
      { password },
      {
        where: {
          id: userId,
        },
      }
    );
  }

  static async changeSesionRole({ user, role }) {
    await User.update(
      {
        sessionRole: role,
      },
      {
        where: {
          id: user.id,
        },
      }
    );

    user.sessionRole = role;

    return user;
  }

  static async getTransactionHistories({ user, query }) {
    const { limit, offset, from, to } = query;
    const options = TransactionHistory.buildOptionQuery(query);
    options.where.userId = user.id;
    options.include = [
      {
        model: User,
        attributes: ['id', 'name'],
        required: true,
      },
      {
        model: Issue,
        attributes: ['id', 'location', 'title'],
        required: false,
        include: [
          {
            model: Category,
            as: 'categories',
            attributes: ['id', 'name'],
          },
        ],
      },
    ];

    if (from) {
      options.where.createdAt = {
        [Op.gte]: from,
      };
    }

    if (to) {
      options.where.createdAt = {
        [Op.lte]: to,
      };
    }

    const result = await TransactionHistory.findAndCountAll({
      ...options,
      limit,
      offset,
    });

    return result;
  }

  static async reSendOTP(id) {
    const user = await User.findByPk(id);

    if (!user) {
      throw new Error('USER-0002');
    }

    const { phoneNumber } = user;

    await sendOTP(id, phoneNumber);
  }
}
