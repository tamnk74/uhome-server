module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('chat_channels', 'issue_id', {
      type: Sequelize.DataTypes.UUID,
      references: {
        model: 'issues',
        key: 'id',
      },
      after: 'id',
      allowNull: true,
    });
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('chat_channels', 'issue_id');
  },
};
