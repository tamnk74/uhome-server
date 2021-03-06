module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'device_tokens',
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
        token: {
          type: Sequelize.DataTypes.STRING(16),
          unique: true,
          allowNull: false,
        },
        type: {
          type: Sequelize.ENUM('IOS', 'ANDROID'),
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
    return queryInterface.dropTable('device_tokens');
  },
};
