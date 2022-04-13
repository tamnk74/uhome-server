const uuid = require('uuid');
const FeeConfiguration = require('../../models/feeConfiguration');

module.exports = {
  up: async () => {
    const configurations = [
      {
        provinceCode: 'Da Nang',
        workerFee: 0.1,
        customerFee: 0,
        distance: 2000,
        nightTime: 0.5,
        urgentTime: 1,
        holiday: 0.5,
        experienceFee: 0.95,
        maxDistanceFee: 50000,
        minDistance: 1,
      },
      {
        provinceCode: 'Ho Chi Minh City',
        workerFee: 0.1,
        customerFee: 0,
        distance: 2000,
        nightTime: 0.5,
        urgentTime: 1,
        holiday: 0.5,
        experienceFee: 0.95,
        maxDistanceFee: 50000,
        minDistance: 1,
      },
      {
        provinceCode: 'Quang Nam Province',
        workerFee: 0.1,
        customerFee: 0,
        distance: 2000,
        nightTime: 0.5,
        urgentTime: 1,
        holiday: 0.5,
        experienceFee: 0.95,
        maxDistanceFee: 50000,
        minDistance: 1,
      },
    ];
    for (let index = 0; index < configurations.length; index++) {
      const element = configurations[index];
      // eslint-disable-next-line no-await-in-loop
      await FeeConfiguration.upsert({
        id: uuid.v4(),
        ...element,
      });
    }

    return Promise.resolve();
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete('fee_configurations', null, {});
  },
};
