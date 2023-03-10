const FeeConfiguration = require('../../models/feeConfiguration');

module.exports = {
  up: async () => {
    const data = {
      workerFee: 0.1,
      customerFee: 0,
      distance: 2000,
      nightTime: 0.5,
      urgentTime: 1,
      holiday: 0.5,
      experienceFee: 0.95,
      maxDistanceFee: 50000,
      minDistance: 1,
    };

    const feeConfiguration = await FeeConfiguration.findOne();

    if (feeConfiguration) {
      await feeConfiguration.update(data);
    } else {
      await FeeConfiguration.create(data);
    }

    return Promise.resolve();
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete('fee_configurations', null, {});
  },
};
