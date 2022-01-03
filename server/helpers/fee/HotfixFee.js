import dayjs from 'dayjs';
import { sum, get, sumBy, first, isEmpty } from 'lodash';
import isBetween from 'dayjs/plugin/isBetween';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { workingTime } from '../../constants';
import Fee from './Fee';

dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(timezone);

export default class HotfixFee extends Fee {
  constructor(workingTimes = [], totalTime = 0, numOfWorker = 1) {
    super();
    this.workingTimes = workingTimes;
    this.totalTime = totalTime;
    this.numOfWorker = numOfWorker;
  }

  // eslint-disable-next-line class-methods-use-this
  getBasicTime(configuration, classFee, workingType, hours) {
    const factor = get(configuration, workingType, 0);
    const fee1 = classFee.min / 8;

    if (hours <= 1) {
      return hours * (fee1 * factor + fee1);
    }

    const fee4 = classFee.max / 8;

    if (hours <= 4) {
      return hours * ((fee1 + fee4) / 2 + ((fee1 + fee4) * factor) / 2);
    }

    if (hours <= 8) {
      return hours * (fee4 * factor + fee4);
    }

    const fee16 = fee4 * configuration.experienceFee;

    if (hours <= 16) {
      return hours * (fee16 * factor + fee16);
    }

    const fee32 = fee16 * configuration.experienceFee;

    return hours * (fee32 * factor + fee32);
  }

  getBasicCost(configuration, classFee, starTime, endTime) {
    const workingTimes = this.getWorkingTimes(starTime, endTime);
    const totalWorkingTime = {};

    Object.keys(workingTime).forEach((key) => {
      totalWorkingTime[key] = sumBy(workingTimes, (o) => o[key]);
    });

    const fees = Object.keys(totalWorkingTime).map((key) => {
      return this.getBasicTime(configuration, classFee, key, totalWorkingTime[key]);
    });

    return this.numOfWorker * sum(fees);
  }

  getCost(configuration, classFee, teamConfiguration) {
    const workingTime = first(this.workingTimes);
    if (isEmpty(workingTime)) {
      return {
        worker: {
          cost: 0,
          fee: 0,
        },
        customer: {
          cost: 0,
          fee: 0,
        },
      };
    }

    const startTime = dayjs(workingTime.startTime).tz('Asia/Ho_Chi_Minh');
    const endTime = dayjs(startTime).add(this.totalTime, 'hour').tz('Asia/Ho_Chi_Minh');

    const basicCost = this.getBasicCost(configuration, classFee, startTime, endTime);

    return this.getCostInformation(basicCost, configuration, teamConfiguration, 0);
  }

  getWorkingTimes(startTime, endTime) {
    const workingTimes = this.generateMatrixWorkingTime(startTime, endTime);

    const workingRangeTimes = workingTimes.map((item) =>
      this.getWorkingTime(item.startTime, item.endTime)
    );

    return workingRangeTimes;
  }

  // eslint-disable-next-line class-methods-use-this
  getTotalTimeByWorkingType(type, starTime, endTime) {
    let tmpStartTime = starTime.clone();
    let tmpToTime = endTime.clone();
    const workingsTime = workingTime[type];
    const ranges = workingsTime.map((workHour) => {
      tmpStartTime = tmpStartTime.set('hour', workHour.from).startOf('hour');
      tmpToTime = tmpToTime.set('hour', workHour.to).startOf('hour');
      if (starTime.isBefore(tmpToTime, 'minute') && tmpStartTime.isBefore(endTime, 'minute')) {
        if (endTime.isBefore(tmpToTime, 'minute')) {
          tmpToTime = endTime;
        }

        if (starTime.isAfter(tmpStartTime, 'minute')) {
          tmpStartTime = starTime;
        }
        starTime = tmpToTime;
        return tmpToTime.diff(tmpStartTime, 'hour', true);
      }

      return 0;
    });

    return Math.ceil(sum(ranges).toFixed(1));
  }

  // eslint-disable-next-line class-methods-use-this
  generateMatrixWorkingTime(startTime, endTime) {
    const workingTimes = [];

    while (endTime.diff(startTime, 'hour', true) >= 0) {
      const workingDay = {
        startTime: startTime.clone(),
        endTime,
      };

      startTime = startTime.endOf('day');

      if (endTime.diff(startTime, 'hour', true) >= 0) {
        workingDay.endTime = startTime;
      }
      workingTimes.push(workingDay);
      startTime = startTime.add(1, 'day').startOf('day');
    }

    return workingTimes;
  }

  getWorkingTime(starTime, endTime) {
    const timeWorking = {};

    Object.keys(workingTime).forEach((key) => {
      timeWorking[key] = this.getTotalTimeByWorkingType(key, starTime, endTime);
    });

    return timeWorking;
  }
}
