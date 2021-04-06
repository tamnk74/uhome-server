module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('receive_issue_comments', {
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
      receive_issue_id: {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: 'receive_issues',
          key: 'id',
        },
        allowNull: false,
      },
      content: {
        type: Sequelize.TEXT,
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
    return queryInterface.dropTable('receive_issue_comments');
  },
};
