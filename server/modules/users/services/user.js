import { v4 as uuidv4 } from 'uuid';
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

export default class Userervice {
  static async getIssues(query) {
    const { limit, offset, user } = query;
    const options = Issue.buildOptionQuery(query);
    options.where.createdBy = user.id;
    return Issue.findAndCountAll({
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
      ],
      attributes: Issue.baseAttibutes,
      limit,
      offset,
    });
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
              attributes: [
                'id',
                'phoneNumber',
                'address',
                'name',
                'avatar',
                'longitude',
                'latitude',
              ],
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
    });
    const identityCard =
      userProfile && userProfile.identityCard
        ? userProfile.identityCard
        : { before: null, after: null };

    Uploader.upload(file, {
      path,
      'x-amz-meta-mimeType': file.mimetype,
      'x-amz-meta-size': file.size.toString(),
    });

    switch (type) {
      case fileType.AVATAR:
        User.update({ avatar: path }, { where: { id: userId } });
        break;
      case fileType.IDENTITY_CARD_BEFORE:
        identityCard.before = path;
        UserProfile.update({ identityCard: JSON.stringify(identityCard) }, { where: { userId } });
        break;
      case fileType.IDENTITY_CARD_AFTER:
        identityCard.after = path;
        UserProfile.update({ identityCard: JSON.stringify(identityCard) }, { where: { userId } });
        break;
      default:
      //
    }

    return `${fileSystemConfig.clout_front}/${path}`;
  }

  static getUserById(userId) {
    return User.findByPk(userId, {
      include: [
        {
          model: UserProfile,
          as: 'profile',
          required: true,
        },
        {
          model: Category,
          as: 'categories',
          required: false,
          through: { attributes: [] },
        },
      ],
      nest: true,
    });
  }

  static async createOrUpdateSkills(userId, payload) {
    return User.updateSkills(userId, payload);
  }

  static async subscribe({ userId, token }) {
    await Subscription.destroy({
      where: {
        token,
      },
    });
    await Subscription.create({
      userId,
      token,
    });
    return Fcm.subscribeNewIssue(token);
  }

  static async unsubscribe({ userId, token }) {
    await Subscription.destroy({
      where: { userId, token },
    });
    return Fcm.unsubscribeNewIssue(token);
  }
}
