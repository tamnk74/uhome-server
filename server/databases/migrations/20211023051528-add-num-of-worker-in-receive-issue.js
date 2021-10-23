module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('receive_issues', 'num_of_worker', {
      type: Sequelize.DataTypes.STRING,
      after: 'time',
      defaultValue: 1,
    }),

  down: (queryInterface) => queryInterface.removeColumn('receive_issues', 'num_of_worker'),
};
