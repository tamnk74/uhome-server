module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('issues', 'payment_method', {
      type: Sequelize.DataTypes.ENUM('cash', 'momo'),
      after: 'status',
      defaultValue: 'cash',
    }),

  down: (queryInterface) => queryInterface.removeColumn('issues', 'payment_method'),
};
