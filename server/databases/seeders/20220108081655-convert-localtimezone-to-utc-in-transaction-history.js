const _ = require('lodash');
const dayjs = require('dayjs');
const TransactionHistory = require('../../models/transactionHistory');

const updateTheUTCTime = async (history) => {
  const extra = _.get(history, 'extra', {});
  const workingTimes = _.get(extra, 'workingTimes');
  if (!_.isEmpty(workingTimes)) {
    const utcTimes = workingTimes.map((item) => ({
      startTime: dayjs(item.startTime).toISOString(),
      endTime: dayjs(item.endTime).toISOString(),
    }));
    _.set(extra, 'workingTimes', utcTimes);

    await history.update({
      extra,
    });
  }
};

module.exports = {
  up: async () => {
    const histories = await TransactionHistory.findAll();
    for (let index = 0; index < histories.length; index++) {
      const history = histories[index];
      // eslint-disable-next-line no-await-in-loop
      await updateTheUTCTime(history);
    }
  },

  down: () => Promise.resolve(),
};
