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
    const actualTimes = this.getActualWorkingTimes();
    let total = 0;

    for (let index = 0; index < actualTimes.length; index++) {
      const element = actualTimes[index];
      total += (classFee.normalCost / 8) * (element > 8 ? 8 : element);
    }

    return total;
  }

  // eslint-disable-next-line class-methods-use-this
  getActualWorkingTimes() {
    return this.workingTimes.map((item) => {
      const startTime = dayjs(item.startTime);
      const endTime = dayjs(item.endTime);

      return endTime.diff(startTime, 'hour', true);
    });
  }

  getFee(configuration, classFee, teamConfiguration) {
    const basicFee = this.getBasicFee(classFee);
    const workerFee = this.getWorkerFee(basicFee, configuration, teamConfiguration);

    return {
      workerFee: Math.ceil(workerFee / 1000) * 1000,
      customerFee: Math.ceil(workerFee / 1000) * 1000,
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

  getTotalFee(basicWorkerFee, configuration) {
    const workerFee = this.getTotalWorkerFee(basicWorkerFee, configuration);
    const customerFee = this.getTotalCustomerFee(basicWorkerFee, configuration);

    return {
      workerFee: Math.ceil(workerFee / 1000) * 1000,
      customerFee: Math.ceil(customerFee / 1000) * 1000,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  getTotalWorkerFee(basicWorkerFee, configuration) {
    return basicWorkerFee + basicWorkerFee * configuration.workerFee;
  }

  // eslint-disable-next-line class-methods-use-this
  getTotalCustomerFee(workerFee, configuration) {
    return workerFee * configuration.customerFee + workerFee;
  }
}
