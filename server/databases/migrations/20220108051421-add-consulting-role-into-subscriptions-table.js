module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('subscriptions', 'role', {
      type: Sequelize.ENUM('CUSTOMER', 'WORKER', 'CONSULTING', 'ADMIN', 'USER'),
      defaultValue: 'USER',
    });
  },

  down: () => Promise.resolve(),
};
