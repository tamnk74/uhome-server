module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('fee_categories', 'normal_cost', {
      type: Sequelize.DataTypes.INTEGER,
      after: 'max',
      defaultValue: 1,
    }),

  down: (queryInterface) => queryInterface.removeColumn('fee_categories', 'normal_cost'),
};
