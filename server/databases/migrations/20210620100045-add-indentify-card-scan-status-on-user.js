module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('users', 'id_card_status', {
      type: Sequelize.DataTypes.INTEGER,
      after: 'status',
      defaultValue: 0,
    }),

  down: (queryInterface) => queryInterface.removeColumn('users', 'id_card_status'),
};
