const { issueStatus } = require('../../constants');

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('surveys', {
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
      issue_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'issues',
          key: 'id',
        },
      },
      user_id: {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: 'users',
          key: 'id',
        },
        allowNull: false,
      },
      message_sid: {
        type: Sequelize.DataTypes.STRING(128),
        unique: true,
      },
      status: {
        type: Sequelize.ENUM(issueStatus.APPROVAL, issueStatus.CANCELLED, issueStatus.OPEN),
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

  down: (queryInterface) => queryInterface.dropTable('surveys'),
};
