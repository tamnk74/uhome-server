import _ from 'lodash';

export default class Fee {
  // eslint-disable-next-line class-methods-use-this
  getWorkerFee(workerCost, configuration) {
    const fee = workerCost * configuration.workerFee;

    return Math.ceil(fee / 1000) * 1000;
  }

  // eslint-disable-next-line class-methods-use-this
  getCustomerFee(customerCost, configuration) {
    const fee = customerCost * configuration.customerFee;

    return Math.ceil(fee / 1000) * 1000;
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
        cost: Math.ceil(customerCost / 1000) * 1000,
        fee: Math.ceil(workerFee / 1000) * 1000,
      },
      customer: {
        cost: Math.ceil(customerCost / 1000) * 1000,
        fee: Math.ceil(customerFee / 1000) * 1000,
      },
    };
  }
}
