import { issueStatus } from '../../constants';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('receive_issues', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      user_id: {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: 'users',
          key: 'id',
        },
        allowNull: false,
      },
      issue_id: {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: 'issues',
          key: 'id',
        },
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM(Object.values(issueStatus)),
        defaultValue: issueStatus.OPEN,
      },
      time: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      cost: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      reason: {
        type: Sequelize.STRING(2048),
      },
      created_at: {
        type: Sequelize.DATE,
        defautValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        defautValue: Sequelize.NOW,
      },
      deleted_at: {
        type: Sequelize.DATE,
      },
    });
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('receive_issues');
  },
};
