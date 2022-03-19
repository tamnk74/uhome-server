import { find, get, isEmpty } from 'lodash';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import OcrService from '../../helpers/Ocr';
import User from '../../models/user';
import UserProfile from '../../models/userProfile';
import { fileSystemConfig, sentryConfig } from '../../config';
import IdentifyCard from '../../models/identifyCard';
import { idCardStatus } from '../../constants';

dayjs.extend(customParseFormat);
export default class OrcService {
  static async getIdentifyCard(job, done) {
    const { userId } = job.data;
    let res = null;
    try {
      const user = await User.findByPk(userId, {
        include: [
          {
            model: UserProfile,
            as: 'profile',
            required: true,
          },
        ],
      });

      if (!user) {
        return done();
      }

      const { profile } = user;
      const identifyCard = profile.identityCard;
      const frontSide = `${fileSystemConfig.clout_front}/${identifyCard.before}`;
      const backSide = `${fileSystemConfig.clout_front}/${identifyCard.after}`;

      const ocrRes = await OcrService.getIdentifyCard(frontSide, backSide);
      res = ocrRes.data;
      const { errorCode } = res;

      if (errorCode === '0') {
        const { data } = res;
        const cardFront = find(data, (o) => {
          return o.type.includes('card_front');
        });

        const informationFront = get(cardFront, 'info', {});

        user.idCardStatus = isEmpty(informationFront)
          ? idCardStatus.FAIL_VERIFIED
          : idCardStatus.VERIFIED;

        await Promise.all([
          IdentifyCard.upsert({
            userId,
            idNum: get(informationFront, 'id', '123456789012'),
            name: get(informationFront, 'name', '123456789012'),
            dob: get(informationFront, 'dob', dayjs().toISOString()),
            hometown: get(informationFront, 'hometown', '123456789012'),
            address: get(informationFront, 'address', '123456789012'),
            raw: res,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
          user.save(),
        ]);
      } else {
        OrcService.handleError(userId, res, {});
      }

      return done();
    } catch (error) {
      sentryConfig.Sentry.captureException(error);
      OrcService.handleError(userId, res, error);
      done(error);
    }
  }

  static async handleError(userId, res, error) {
    const identifyCard = await IdentifyCard.findOne({
      where: {
        userId,
      },
    });
    await Promise.all([
      User.update(
        { idCardStatus: idCardStatus.FAIL_VERIFIED },
        {
          where: {
            id: userId,
          },
        }
      ),
      IdentifyCard.upsert({
        userId,
        idNum: get(identifyCard, 'idNum', '123456789012'),
        name: get(identifyCard, 'name', '123456789012'),
        dob: dayjs().toISOString(),
        address: get(identifyCard, 'address', '123456789012'),
        hometown: get(identifyCard, 'hometown', '123456789012'),
        raw: res || error.message,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]);
  }
}
