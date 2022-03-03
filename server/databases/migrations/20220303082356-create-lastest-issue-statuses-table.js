const { issueStatus } = require('../../constants');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('latest_issue_statuses', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUID,
      },
      issue_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: true,
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
      status: {
        type: Sequelize.ENUM(
          issueStatus.OPEN,
          issueStatus.REQUESTING_SUPPORT,
          issueStatus.CHATTING,
          issueStatus.DONE
        ),
        allowNull: false,
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
    });

    return queryInterface.addIndex('latest_issue_statuses', ['user_id', 'issue_id'], {
      indexName: 'latest_issue_statuses_user_id_fk1',
      unique: true,
    });
  },

  down: (queryInterface) => queryInterface.dropTable('latest_issue_statuses'),
};
