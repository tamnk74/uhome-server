import { sum, get, sumBy } from 'lodash';
import { workingTime } from '../constants';

export default class Fee {
  static getBasicTimeFee(configuration, classFee, workingType, hours) {
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

  static getBasicFee(configuration, classFee, starTime, endTime) {
    const workingTimes = Fee.getWorkingTimes(starTime, endTime);
    const totalWorkingTime = {};

    Object.keys(workingTime).forEach((key) => {
      totalWorkingTime[key] = sumBy(workingTimes, (o) => o[key]);
    });

    const fees = Object.keys(totalWorkingTime).map((key) => {
      return Fee.getBasicTimeFee(configuration, classFee, key, totalWorkingTime[key]);
    });

    return sum(fees);
  }

  static getFee(configuration, classFee, starTime, endTime, distance = 0) {
    const basicFee = Fee.getBasicFee(configuration, classFee, starTime, endTime);
    const workerFee = Fee.getWorkerFee(basicFee, configuration, distance);
    const customerFee = Fee.getCustomerFee(workerFee, configuration);

    return {
      workerFee: Math.round(workerFee),
      customerFee: Math.round(customerFee),
    };
  }

  static getWorkerFee(basicFee, configuration, distance = 0) {
    return (
      basicFee + basicFee * configuration.workerFee + basicFee * distance * configuration.distance
    );
  }

  static getCustomerFee(workerFee, configuration) {
    return workerFee * configuration.customerFee + workerFee;
  }

  static getWorkingTimes(startTime, endTime) {
    const workingTimes = Fee.generateMatrixWorkingTime(startTime, endTime);
    const workingRangeTimes = workingTimes.map((item) =>
      Fee.getWorkingTime(item.startTime, item.endTime)
    );

    return workingRangeTimes;
  }

  static getTotalTimeByWorkingType(type, starTime, endTime) {
    const workingsTime = workingTime[type];
    let fromTime = starTime.get('hour');
    const fromMinute = starTime.get('minute');
    let toTime = endTime.get('hour');
    const toMinute = endTime.get('minute');

    fromTime += fromMinute / 60;
    toTime += toMinute > 30 ? 1 : toMinute / 60;

    const ranges = workingsTime.map((workHour) => {
      if (workHour.from <= fromTime && fromTime < workHour.to) {
        return workHour.to <= toTime ? workHour.to - fromTime : toTime - fromTime;
      }

      if (toTime > workHour.from && fromTime < workHour.to) {
        const beginTime = workHour.from > fromTime ? workHour.from : fromTime;
        return workHour.to <= toTime ? workHour.to - beginTime : toTime - beginTime;
      }

      return 0;
    });

    return sum(ranges);
  }

  static generateMatrixWorkingTime(startTime, endTime) {
    const workingTimes = [];

    while (endTime.diff(startTime, 'hour') >= 0) {
      const workingDay = {
        startTime: startTime.clone(),
        endTime,
      };

      startTime = startTime.endOf('day');

      if (endTime.diff(startTime, 'hour') >= 0) {
        workingDay.endTime = startTime;
      }
      workingTimes.push(workingDay);
      startTime = startTime.add(1, 'day').startOf('day');
    }

    return workingTimes;
  }

  static getWorkingTime(starTime, endTime) {
    const timeWorking = {};

    Object.keys(workingTime).forEach((key) => {
      timeWorking[key] = Fee.getTotalTimeByWorkingType(key, starTime, endTime);
    });

    return timeWorking;
  }
}
