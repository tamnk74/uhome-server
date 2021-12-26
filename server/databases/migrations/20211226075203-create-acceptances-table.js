const { issueStatus } = require('../../constants');

module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable('acceptances', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUID,
      },
      channel_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'chat_channels',
          key: 'id',
        },
      },
      receive_issue_id: {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: 'receive_issues',
          key: 'id',
        },
        allowNull: false,
      },
      message_sid: {
        type: Sequelize.DataTypes.STRING(128),
        unique: true,
      },
      status: {
        type: Sequelize.ENUM(
          issueStatus.WAITING_VERIFY,
          issueStatus.WAITING_PAYMENT,
          issueStatus.DONE,
          issueStatus.CANCELLED
        ),
        allowNull: false,
      },
      data: {
        type: Sequelize.DataTypes.JSON,
        defaultValue: '{}',
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      deleted_at: {
        type: Sequelize.DATE,
      },
    }),

  down: (queryInterface) => queryInterface.dropTable('acceptances'),
};
