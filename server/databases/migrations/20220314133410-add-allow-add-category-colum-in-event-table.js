module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('events', 'allow_add_category', {
      type: Sequelize.DataTypes.BOOLEAN,
      after: 'status',
      defaultValue: false,
    }),

  down: (queryInterface) => queryInterface.removeColumn('events', 'allow_add_category'),
};
