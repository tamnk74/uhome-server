module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'social_accounts',
      {
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
        social_id: {
          type: Sequelize.DataTypes.STRING(16),
          unique: true,
          allowNull: false,
        },
        type: {
          type: Sequelize.ENUM('FACEBOOK', 'ZALO'),
          allowNull: false,
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
      },
      {}
    );
  },
  down: (queryInterface) => {
    return queryInterface.dropTable('social_accounts');
  },
};
