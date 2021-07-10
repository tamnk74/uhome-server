module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('receive_issues', 'rating', {
      type: Sequelize.DataTypes.DECIMAL(2),
      after: 'cost',
      defaultValue: 0,
    }),

  down: (queryInterface) => queryInterface.removeColumn('receive_issues', 'rating'),
};
