module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('chat_users', 'total_channel', {
      type: Sequelize.DataTypes.INTEGER,
      after: 'friendly_name',
      defaultValue: 0,
    }),

  down: (queryInterface) => queryInterface.removeColumn('chat_users', 'total_channel'),
};
