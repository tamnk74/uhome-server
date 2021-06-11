import { find } from 'lodash';
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
      const res = ocrRes.data;
      const { errorCode } = res;
      const { data } = res;
      const cardFront = find(data, (o) => {
        return o.type === '9_id_card_front';
      });
      const informationFront = cardFront.info;

      user.idCardStatus = errorCode === '0' ? idCardStatus.VERIFIED : idCardStatus.FAIL_VERIFIED;
      await Promise.all([
        IdentifyCard.create({
          userId,
          idNum: informationFront.id,
          name: informationFront.name,
          dob: dayjs(informationFront.dob, 'DD-MM-YYYY'),
          hometown: informationFront.hometown,
          address: informationFront.address,
          raw: res,
        }),
        user.save(),
      ]);
      return done();
    } catch (error) {
      sentryConfig.Sentry.captureException(error);
      await User.update(
        { idCardStatus: idCardStatus.FAIL_VERIFIED },
        {
          where: {
            id: userId,
          },
        }
      );
      done(error);
    }
  }
}
