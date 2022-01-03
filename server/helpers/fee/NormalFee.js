import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import Fee from './Fee';

dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(timezone);

export default class NormalFee extends Fee {
  constructor(workingTimes = [], totalTime = 0, numOfWorker = 1) {
    super();
    this.workingTimes = workingTimes;
    this.totalTime = totalTime;
    this.numOfWorker = numOfWorker;
  }

  // eslint-disable-next-line class-methods-use-this
  getBasicCost(classFee) {
    const actualTimes = this.getActualWorkingTimes();
    let total = 0;

    for (let index = 0; index < actualTimes.length; index++) {
      const element = actualTimes[index];
      total += (classFee.normalCost / 8) * (element > 8 ? 8 : element);
    }

    return total * this.numOfWorker;
  }

  // eslint-disable-next-line class-methods-use-this
  getActualWorkingTimes() {
    return this.workingTimes.map((item) => {
      const startTime = dayjs(item.startTime);
      const endTime = dayjs(item.endTime);

      return endTime.diff(startTime, 'hour', true);
    });
  }

  getCost(configuration, classFee, teamConfiguration) {
    const basicCost = this.getBasicCost(classFee);

    return this.getCostInformation(basicCost, configuration, teamConfiguration, 0);
  }
}
