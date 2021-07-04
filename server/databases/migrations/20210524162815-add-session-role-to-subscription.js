module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('subscriptions', 'role', {
      type: Sequelize.ENUM('CUSTOMER', 'WORKER'),
      after: 'user_id',
      defaultValue: 'CUSTOMER',
    });
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('subscriptions', 'role');
  },
};
