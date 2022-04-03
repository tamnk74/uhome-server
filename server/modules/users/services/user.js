import { v4 as uuidv4 } from 'uuid';
import { Sequelize, Op } from 'sequelize';
import { get } from 'lodash';
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
import { sendOTP } from '../../../helpers/SmsOTP';
import RedisService from '../../../helpers/Redis';
import AuthService from './auth';
import LatestIssueStatus from '../../../models/latestIssueStatus';

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
            'thumbnail',
            'createdAt',
            'updatedAt',
            'issueId',
            'path',
            'thumbnailPath',
            Attachment.buildUrlAttributeSelect(),
          ],
        },
        {
          model: ReceiveIssue,
          required: false,
          as: 'supporting',
          attributes: ['id', 'userId', 'issueId', 'time', 'discount', 'workerFee', 'customerFee'],
          include: [
            {
              model: User,
              required: false,
              attributes: ['id', 'avatar', 'name'],
            },
          ],
        },
        {
          model: User,
          require: true,
          as: 'creator',
          attributes: ['id', 'avatar', 'name', 'phone_number', 'gender', 'status'],
        },
      ],
      order: [
        ['msgAt', 'DESC'],
        ['updatedAt', 'DESC'],
      ],
      attributes: Issue.baseAttributes,
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
      supporting.setDataValue('name', user.name);
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
    options.where[Op.or] = [
      {
        userId,
      },
    ];
    options.order = [];

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
                'thumbnail',
                'createdAt',
                'updatedAt',
                'issueId',
                'path',
                'thumbnailPath',
                Attachment.buildUrlAttributeSelect(),
              ],
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
      order: [['updatedAt', 'DESC']],
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
    let idStatus = get(user, 'idCardStatus', 0);
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

  static async subscribe({ userId, token, deviceId, role }) {
    await Subscription.destroy({
      where: {
        deviceId,
      },
    });

    await Subscription.create({
      userId,
      token,
      role,
      deviceId,
    });

    return Fcm.subscribeNewIssue(token);
  }

  static async unsubscribe({ token, deviceId }) {
    await Subscription.destroy({
      where: { deviceId },
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

  static async changeSesionRole({ user, role, accessToken }) {
    await Promise.all([
      User.update(
        {
          sessionRole: role,
        },
        {
          where: {
            id: user.id,
          },
        }
      ),
      RedisService.saveAccessToken(user.id, accessToken, role),
    ]);

    return AuthService.getUserById(user.id, role);
  }

  static async getTransactionHistories({ user, query }) {
    const { limit, offset, from, to } = query;
    const options = TransactionHistory.buildOptionQuery(query);
    options.where.userId = user.id;
    options.include = [
      {
        model: Issue,
        attributes: ['id', 'location', 'title', 'createdBy'],
        required: true,
        include: [
          {
            model: Category,
            required: false,
            attributes: ['id', 'name'],
            as: 'categories',
          },
        ],
      },
      {
        model: User,
        attributes: ['id', 'name'],
        required: true,
      },
      {
        model: User,
        attributes: ['id', 'name'],
        as: 'actor',
        required: false,
      },
    ];

    if (from) {
      options.where.createdAt = {
        [Op.gte]: from,
      };
    }

    if (to) {
      options.where.createdAt = {
        ...get(options, 'where.createdAt', {}),
        [Op.lte]: to,
      };
    }

    const result = await TransactionHistory.findAndCountAll({
      ...options,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: 'id',
    });

    const rows = TransactionHistory.tranformResponseData(result.rows);
    result.rows = rows;

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

  static async getLatestIssueStatus(user) {
    const latestStatus = await LatestIssueStatus.findOne({
      attributes: [
        [Sequelize.literal('latest_issue_statuses.issue_id'), 'id'],
        'status',
        'updatedAt',
        'issueId',
      ],
      where: {
        userId: user.id,
      },
      order: [['updatedAt', 'DESC']],
    });

    if (!latestStatus) {
      return {};
    }

    const issue = await Issue.findByPk(latestStatus.issueId, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'phoneNumber', 'address', 'name', 'avatar', 'lon', 'lat'],
        },
        {
          model: ReceiveIssue,
          required: false,
          as: 'supporting',
          attributes: ['id', 'userId', 'issueId'],
          include: [
            {
              model: User,
              required: false,
              attributes: ['id', 'name', 'avatar'],
            },
          ],
        },
      ],
    });

    return {
      id: get(issue, 'id'),
      status: get(latestStatus, 'status'),
      issueId: get(issue, 'id'),
      creator: get(issue, 'creator'),
      supporting: get(issue, 'supporting'),
      updatedAt: get(latestStatus, 'updatedAt'),
    };
  }
}
