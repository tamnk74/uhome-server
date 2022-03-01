module.exports = {
  up: (queryInterface, Sequelize) =>
    Promise.all([
      queryInterface.addColumn('request_supportings', 'lat', {
        type: Sequelize.DataTypes.FLOAT,
        after: 'message',
      }),
      queryInterface.addColumn('request_supportings', 'lon', {
        type: Sequelize.DataTypes.FLOAT,
        after: 'message',
      }),
      queryInterface.addColumn('request_supportings', 'distance', {
        type: Sequelize.DataTypes.FLOAT,
        after: 'message',
        defaultValue: 0,
      }),
      queryInterface.addColumn('request_supportings', 'distance_fee', {
        type: Sequelize.DataTypes.FLOAT,
        after: 'message',
        defaultValue: 0,
      }),
    ]),

  down: (queryInterface) =>
    Promise.all([
      queryInterface.removeColumn('request_supportings', 'lat'),
      queryInterface.removeColumn('request_supportings', 'lon'),
      queryInterface.removeColumn('request_supportings', 'distance'),
      queryInterface.removeColumn('request_supportings', 'distance_fee'),
    ]),
};
