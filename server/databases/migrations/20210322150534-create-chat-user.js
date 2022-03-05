module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('chat_users', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      user_sid: {
        type: Sequelize.DataTypes.STRING(127),
        allowNull: false,
        unique: true,
      },
      role_sid: {
        type: Sequelize.DataTypes.STRING(127),
        allowNull: false,
      },
      identity: {
        type: Sequelize.DataTypes.STRING(127),
        allowNull: false,
      },
      service_sid: {
        type: Sequelize.DataTypes.STRING(64),
        allowNull: false,
      },
      friendly_name: {
        type: Sequelize.DataTypes.STRING(127),
        allowNull: true,
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
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('chat_users');
  },
};
