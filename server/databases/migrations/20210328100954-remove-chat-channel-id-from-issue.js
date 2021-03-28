module.exports = {
  up: (queryInterface) => {
    return queryInterface.removeColumn('issues', 'chat_channel_id');
  },
  down: () => (queryInterface, Sequelize) => {
    return queryInterface.addColumn('issues', 'chat_channel_id', {
      allowNull: true,
      type: Sequelize.UUID,
      after: 'status',
      references: {
        model: 'chat_channels',
        key: 'id',
      },
    });
  },
};
