module.exports = {
  up: (queryInterface, Sequelize) =>
    Promise.all([
      queryInterface.addColumn('estimation_messages', 'data', {
        type: Sequelize.DataTypes.JSON,
        after: 'type',
        defaultValue: {},
      }),
      queryInterface.addColumn('estimation_messages', 'status', {
        type: Sequelize.ENUM('WAITING', 'APPROVED', 'CANCELED'),
        after: 'type',
        defaultValue: 'WAITING',
      }),
    ]),

  down: (queryInterface) =>
    Promise.all([
      queryInterface.removeColumn('estimation_messages', 'data'),
      queryInterface.removeColumn('estimation_messages', 'status'),
    ]),
};
