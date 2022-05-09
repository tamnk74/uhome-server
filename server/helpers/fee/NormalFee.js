import dayjs from 'dayjs';
import _, { sum } from 'lodash';
import isBetween from 'dayjs/plugin/isBetween';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import Fee from './Fee';

dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(timezone);

const buildFactor = (configuration, isHoliday) => {
  const factors = [1];

  if (isHoliday) {
    factors.push(_.get(configuration, 'holiday', 0));
  }

  return factors;
};

const getWorkingTimeSlots = (workingTimes = [], holidays = [], configuration) => {
  return workingTimes.map((item) => {
    const startTime = dayjs(item.startTime);
    const endTime = dayjs(item.endTime);
    const isHoliday = Fee.isInHoliday(startTime, endTime, holidays);

    return {
      totalTime: endTime.diff(startTime, 'hour', true),
      factors: buildFactor(configuration, isHoliday),
      isUrgentTime: isHoliday,
    };
  });
};

export default class NormalFee extends Fee {
  constructor(workingTimes = [], totalTime = 0, numOfWorker = 1) {
    super();
    this.workingTimes = workingTimes;
    this.totalTime = totalTime;
    this.numOfWorker = numOfWorker;
  }

  getBasicCost(configuration, classFee, holidays) {
    const workingTimeSlots = getWorkingTimeSlots(this.workingTimes, holidays, configuration);
    let isUrgentTime = false;

    const totals = workingTimeSlots.map((item) => {
      const timeSlotCost = (classFee.normalCost / 8) * (item.totalTime > 8 ? 8 : item.totalTime);
      const factor = sum(item.factors);
      isUrgentTime = item.isUrgentTime;

      return timeSlotCost * factor;
    });

    return {
      basicCost: this.numOfWorker * sum(totals),
      isUrgentTime,
    };
  }

  getCost({ configuration, classFee, teamConfiguration, holidays }) {
    const { basicCost, isUrgentTime } = this.getBasicCost(configuration, classFee, holidays);

    return {
      cost: this.getCostInformation(basicCost, configuration, teamConfiguration, 0),
      isUrgentTime,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  getSurveyCost({ classFee, surveyTime = 0 }) {
    const cost = (classFee.normalCost / 8) * (surveyTime > 8 ? 8 : surveyTime);

    return Math.ceil(cost);
  }
}
