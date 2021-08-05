import dayjs from 'dayjs';
import SpeedSMS from './SpeedSMS';
import RedisService from './Redis';
import { otpLength, maximumReuestOtpPerDay, maximumReuestOtpPerHour } from '../config';
import { randomNumber } from './Util';

export const SmsCount = async (id) => {
  let counter = await RedisService.getSmsCounter(id);
  const now = dayjs();

  if (!counter) {
    return RedisService.saveSmsCounter(
      id,
      JSON.stringify({
        lastTime: now.toISOString(),
        perDay: 1,
        perHour: 1,
      })
    );
  }

  counter = JSON.parse(counter);
  const latestTime = dayjs(counter.lastTime);
  const date = now.format('DD-MM-YYYY');
  const lastdate = latestTime.format('DD-MM-YYYY');
  const hour = now.get('hour');
  const lastHour = latestTime.get('hour');

  if (
    date === lastdate &&
    (counter.perDay > maximumReuestOtpPerDay ||
      (hour === lastHour && counter.perHour > maximumReuestOtpPerHour))
  ) {
    throw new Error('USER-0429');
  }

  counter.lastTime = now.toISOString();

  if (date === lastdate) {
    counter.perDay += 1;

    if (hour === lastHour) {
      counter.perHour += 1;
    } else {
      counter.perHour = 1;
    }
  } else {
    counter.perDay = 1;
    counter.perHour = 1;
  }

  await RedisService.saveSmsCounter(id, JSON.stringify(counter));
};

export const sendOTP = async (id, phoneNumber) => {
  await SmsCount(id);
  const verifyCode = randomNumber(otpLength);

  await RedisService.saveVerifyCode(id, verifyCode);

  await SpeedSMS.sendSMS({
    to: [phoneNumber],
    // eslint-disable-next-line no-undef
    content: __('otp.sms', { code: verifyCode }),
  });
};
