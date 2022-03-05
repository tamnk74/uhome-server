module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'request_supportings',
      {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.DataTypes.UUID,
          defaultValue: Sequelize.UUIDV4,
        },
        user_id: {
          type: Sequelize.DataTypes.UUID,
          allowNull: false,
        },
        issue_id: {
          type: Sequelize.DataTypes.UUID,
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
      },
      {
        uniqueKeys: {
          unique_supporting: {
            fields: ['user_id', 'issue_id'],
          },
        },
      }
    );
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('request_supportings');
  },
};
