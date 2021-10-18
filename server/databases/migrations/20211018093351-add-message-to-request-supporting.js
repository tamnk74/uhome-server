module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('request_supportings', 'message', {
      type: Sequelize.DataTypes.STRING,
      after: 'issue_id',
      allowNull: false,
    }),

  down: (queryInterface) => queryInterface.removeColumn('request_supportings', 'message'),
};
