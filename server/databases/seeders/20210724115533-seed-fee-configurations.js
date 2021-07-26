const FeeConfiguration = require('../../models/feeConfiguration');

module.exports = {
  up: async () => {
    const data = {
      workerFee: 0,
      customerFee: 0.1,
      distance: 0.1,
      nightTime: 0.5,
      urgentTime: 1,
      holiday: 1.5,
      experienceFee: 0.95,
    };

    const [feeConfiguration, created] = await FeeConfiguration.findOrCreate({
      where: {},
      defaults: data,
    });

    if (!created) {
      await feeConfiguration.update(data);
    }

    return Promise.resolve();
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete('fee_configurations', null, {});
  },
};
