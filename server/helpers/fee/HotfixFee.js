import dayjs from 'dayjs';
import { sum, get, first, isEmpty } from 'lodash';
import isBetween from 'dayjs/plugin/isBetween';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { workingTime } from '../../constants';
import Fee from './Fee';

dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(timezone);

const getTimeSlotCost = (configuration, timeSlotConfigures, hours) => {
  if (hours <= 0) {
    return 0;
  }

  if (hours <= 8) {
    const timeSlot = timeSlotConfigures.find((item) => item.max >= hours);
    return hours * get(timeSlot, 'cost', 0);
  }

  const timeSlot = timeSlotConfigures.find((item) => item.min <= 1 && item.max >= 4);
  const fee4 = get(timeSlot, 'cost', 0);
  const fee16 = fee4 * configuration.experienceFee;

  if (hours <= 16) {
    return hours * fee16;
  }

  const fee32 = fee16 * configuration.experienceFee;

  return hours * fee32;
};

const generateMatrixWorkingTime = (startTime, endTime) => {
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
};

const buildFactorByType = (configuration, type, isHoliday) => {
  const factors = [1, get(configuration, type, 0)];

  if (isHoliday) {
    factors.push(get(configuration, 'holiday', 0));
  }

  return factors;
};

const getTimeSlot = (configuration, type, starTime, endTime, isHoliday) => {
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

      return tmpToTime.diff(tmpStartTime, 'minute', true) / 60;
    }

    return 0;
  });

  return {
    totalTime: sum(ranges),
    factors: buildFactorByType(configuration, type, isHoliday),
  };
};

const getWorkingTimeSlot = (configuration, starTime, endTime, isHoliday) => {
  const workingTimeSlots = [];

  Object.keys(workingTime).forEach((key) => {
    workingTimeSlots.push(getTimeSlot(configuration, key, starTime, endTime, isHoliday));
  });

  return workingTimeSlots;
};

const getWorkingTimeSlots = (configuration, startTime, endTime, holidays) => {
  const workingTimes = generateMatrixWorkingTime(startTime, endTime);

  const workingTimeSlots = workingTimes.map((item) => {
    const isHoliday = Fee.isInHoliday(item.startTime, item.endTime, holidays);
    return getWorkingTimeSlot(configuration, item.startTime, item.endTime, isHoliday);
  });

  return workingTimeSlots;
};

const getBasicTimeSlotCost = (configuration, classFee, workingsTimeSlot = []) => {
  const totals = workingsTimeSlot.map((items) => {
    const total = items.map((item) => {
      const timeSlotCost = getTimeSlotCost(configuration, classFee, item.totalTime);
      const factor = sum(item.factors);
      return timeSlotCost * factor;
    });

    return sum(total);
  });

  return sum(totals);
};

export default class HotfixFee extends Fee {
  constructor(workingTimes = [], totalTime = 0, numOfWorker = 1) {
    super();
    this.workingTimes = workingTimes;
    this.totalTime = totalTime;
    this.numOfWorker = numOfWorker;
  }

  getBasicCost(configuration, timeSlotConfigures, starTime, endTime, holidays) {
    const workingTimeSlots = getWorkingTimeSlots(configuration, starTime, endTime, holidays);
    const basicTimeSlotCost = getBasicTimeSlotCost(
      configuration,
      timeSlotConfigures,
      workingTimeSlots
    );

    return this.numOfWorker * basicTimeSlotCost;
  }

  getCost({ configuration, teamConfiguration, holidays, timeSlotConfigures }) {
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

    const basicCost = this.getBasicCost(
      configuration,
      timeSlotConfigures,
      startTime,
      endTime,
      holidays
    );

    return this.getCostInformation(basicCost, configuration, teamConfiguration, 0);
  }

  // eslint-disable-next-line class-methods-use-this
  getSurveyCost({ configuration, timeSlotConfigures, surveyTime = 0 }) {
    const cost = getTimeSlotCost(configuration, timeSlotConfigures, surveyTime);

    return Math.ceil(cost);
  }
}
