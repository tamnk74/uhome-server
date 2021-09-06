const TransactionHistory = require('../../models/transactionHistory');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const histories = await TransactionHistory.findAll({
      where: {
        issueId: {
          [Sequelize.Op.ne]: null,
        },
      },
      order: [['issueId', 'DESC']],
    });

    for (let index = 0; index < histories.length; index++) {
      const element1 = histories[index];
      const element2 = histories[++index];

      // eslint-disable-next-line no-await-in-loop
      await Promise.all([
        TransactionHistory.update(
          { actorId: element2.userId },
          {
            where: {
              id: element1.id,
            },
          }
        ),
        TransactionHistory.update(
          { actorId: element1.userId },
          {
            where: {
              id: element2.id,
            },
          }
        ),
      ]);
    }
  },

  down: () => Promise.resolve(),
};
