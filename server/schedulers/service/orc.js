import { find, get } from 'lodash';
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
      const { data } = res;
      let dateFormat = 'DD-MM-YYYY';
      let cardFront = find(data, (o) => {
        return o.type === '9_id_card_front';
      });

      if (!cardFront) {
        cardFront = find(data, (o) => {
          return o.type === '12_id_card_front';
        });
        dateFormat = 'DD/MM/YYYY';
      }

      const informationFront = cardFront.info;

      user.idCardStatus = errorCode === '0' ? idCardStatus.VERIFIED : idCardStatus.FAIL_VERIFIED;
      await Promise.all([
        IdentifyCard.upsert({
          userId,
          idNum: informationFront.id,
          name: informationFront.name,
          dob: dayjs(informationFront.dob, dateFormat),
          hometown: informationFront.hometown,
          address: informationFront.address,
          raw: res,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        user.save(),
      ]);
      return done();
    } catch (error) {
      sentryConfig.Sentry.captureException(error);
      OrcService.handleError(userId, res);
      done(error);
    }
  }

  static async handleError(userId, res) {
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
        dob: get(identifyCard, 'dob', '123456789012'),
        address: get(identifyCard, 'address', '123456789012'),
        hometown: get(identifyCard, 'hometown', '123456789012'),
        raw: res,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]);
  }
}
