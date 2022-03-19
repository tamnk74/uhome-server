import _ from 'lodash';
import dayjs from 'dayjs';

export default class Fee {
  // eslint-disable-next-line class-methods-use-this
  getWorkerFee(workerCost, configuration) {
    const fee = workerCost * configuration.workerFee;

    return Math.ceil(fee);
  }

  // eslint-disable-next-line class-methods-use-this
  getCustomerFee(customerCost, configuration) {
    const fee = customerCost * configuration.customerFee;

    return Math.ceil(fee);
  }

  // eslint-disable-next-line class-methods-use-this
  getTotalWorkerCost(basicWorkerCost) {
    return basicWorkerCost;
  }

  // eslint-disable-next-line class-methods-use-this
  getTotalCustomerCost(workerCost, configuration) {
    return workerCost * configuration.customerFee + workerCost;
  }

  // eslint-disable-next-line class-methods-use-this
  getWorkerCost(basicCost, configuration, teamConfiguration, distance = 0) {
    return (
      basicCost +
      basicCost * _.get(teamConfiguration, 'fee', 0) +
      basicCost * distance * configuration.distance
    );
  }

  // eslint-disable-next-line class-methods-use-this
  getCustomerCost(workerCost, configuration) {
    return workerCost * configuration.customerFee + workerCost;
  }

  // eslint-disable-next-line class-methods-use-this
  getCostInformation(basicCost, configuration, teamConfiguration, distance = 0) {
    const basicWorkerCost = this.getWorkerCost(
      basicCost,
      configuration,
      teamConfiguration,
      distance
    );
    const workerFee = this.getWorkerFee(basicWorkerCost, configuration);
    const customerCost = this.getTotalCustomerCost(basicWorkerCost, configuration);
    const customerFee = this.getCustomerFee(customerCost, configuration);

    return {
      worker: {
        cost: Math.ceil(customerCost),
        fee: Math.ceil(workerFee),
      },
      customer: {
        cost: Math.ceil(customerCost),
        fee: Math.ceil(customerFee),
      },
    };
  }

  static isInHoliday = (starTime, endTime, holidays) => {
    for (let index = 0; index < holidays.length; index++) {
      const holiday = holidays[index];
      const holidayFrom = dayjs(holiday.from);
      if (starTime.isBefore(holiday.to, 'minute') && holidayFrom.isBefore(endTime, 'minute')) {
        return true;
      }
    }

    return false;
  };
}
