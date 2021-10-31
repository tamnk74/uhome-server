import dayjs from 'dayjs';
import { get } from 'lodash';
import isBetween from 'dayjs/plugin/isBetween';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(timezone);

export default class NormalFee {
  constructor(workingTimes = [], totalTime = 0, numOfWorker = 1) {
    this.workingTimes = workingTimes;
    this.totalTime = totalTime;
    this.numOfWorker = numOfWorker;
  }

  // eslint-disable-next-line class-methods-use-this
  getBasicFee(classFee) {
    return classFee.normalCost * this.totalTime;
  }

  getFee(configuration, classFee, teamConfiguration) {
    const basicFee = this.getBasicFee(classFee);
    const workerFee = this.getWorkerFee(basicFee, configuration, teamConfiguration);
    const customerFee = this.getCustomerFee(workerFee, configuration);

    return {
      workerFee: Math.ceil(workerFee / 1000) * 1000,
      customerFee: Math.ceil(customerFee / 1000) * 1000,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  getWorkerFee(basicFee, configuration, teamConfiguration, distance = 0) {
    return (
      basicFee +
      basicFee * this.numOfWorker * get(teamConfiguration, 'fee', 0) +
      basicFee * distance * configuration.distance
    );
  }

  // eslint-disable-next-line class-methods-use-this
  getCustomerFee(workerFee, configuration) {
    return workerFee * configuration.customerFee + workerFee;
  }
}
