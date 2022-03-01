module.exports = {
  up: (queryInterface, Sequelize) =>
    Promise.all([
      queryInterface.addColumn('fee_configurations', 'max_distance_fee', {
        type: Sequelize.DataTypes.FLOAT,
        after: 'experience_fee',
        defaultValue: 0,
      }),
      queryInterface.addColumn('fee_configurations', 'min_distance', {
        type: Sequelize.DataTypes.INTEGER,
        after: 'experience_fee',
        defaultValue: 0,
      }),
    ]),

  down: (queryInterface) =>
    Promise.all([
      queryInterface.removeColumn('fee_configurations', 'max_distance_fee'),
      queryInterface.removeColumn('fee_configurations', 'min_distance'),
    ]),
};
