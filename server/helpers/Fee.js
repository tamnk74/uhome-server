import { sum, get } from 'lodash';
import { workingTime } from '../constants';

export default class Fee {
  static getBasicTimeFee(configuration, classFee, workingHour) {
    const hours = workingHour.value;
    const typeWorkingTime = workingHour.type;
    const factor = get(configuration, typeWorkingTime, 0);
    const fee1 = classFee.min / 8;

    if (hours <= 1) {
      return fee1 * factor + fee1;
    }

    const fee4 = classFee.max / 8;

    if (hours <= 4) {
      return (fee1 + fee4) / 2 + ((fee1 + fee4) * factor) / 2;
    }

    if (hours <= 8) {
      return fee4 * factor + fee4;
    }

    const fee16 = fee4 * configuration.experienceFee;

    if (hours <= 16) {
      return fee16 * factor + fee16;
    }

    const fee32 = fee16 * configuration.experienceFee;

    return fee32 * factor + fee32;
  }

  static getBasicFee(configuration, classFee, starTime, endtime) {
    const rangesTime = Fee.getRangeTimes(starTime, endtime);

    const fees = rangesTime.map((range) => {
      return Fee.getBasicTimeFee(configuration, classFee, range);
    });

    return sum(fees);
  }

  static getFee(configuration, classFee, starTime, endtime, distance = 0) {
    const basicFee = Fee.getBasicFee(configuration, classFee, starTime, endtime);
    const workerFee = Fee.getWokerFee(basicFee, configuration, distance);
    const customerFee = Fee.getCustomerFee(workerFee, configuration);

    return {
      workerFee,
      customerFee,
    };
  }

  static getWokerFee(basicFee, configuration, distance = 0) {
    return (
      basicFee + basicFee * configuration.workerFee + basicFee * distance * configuration.distance
    );
  }

  static getCustomerFee(workerFee, configuration) {
    return workerFee * configuration.customerFee + workerFee;
  }

  static getRangeTimes(starTime, endtime) {
    return Object.keys(workingTime).map((key) =>
      Fee.getTotalTimeByWorkingType(key, starTime, endtime)
    );
  }

  static getTotalTimeByWorkingType(type, starTime, endtime) {
    const workingsTime = workingTime[type];
    const fromTime = starTime.get('hour');
    const toTime = endtime.get('hour');
    const ranges = workingsTime.map((workHour) => {
      if (workHour.from <= fromTime && fromTime < workHour.to) {
        return workHour.to <= toTime ? workHour.to - fromTime : toTime - fromTime;
      }

      if (toTime > workHour.from) {
        const beginTime = workHour.from > fromTime ? workHour.from : fromTime;
        return workHour.to <= toTime ? workHour.to - beginTime : toTime - beginTime;
      }

      return 0;
    });

    return {
      type,
      value: sum(ranges),
    };
  }
}
