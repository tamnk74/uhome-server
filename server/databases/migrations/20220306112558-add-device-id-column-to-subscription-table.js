module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('subscriptions', 'device_id', {
      type: Sequelize.DataTypes.STRING(127),
      after: 'token',
      defaultValue: null,
    }),

  down: (queryInterface) => queryInterface.removeColumn('subscriptions', 'device_id'),
};
