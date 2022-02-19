module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('chat_channels', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      channel_sid: {
        type: Sequelize.DataTypes.STRING(127),
        allowNull: false,
        unique: true,
      },
      friendly_name: {
        type: Sequelize.DataTypes.STRING(127),
        allowNull: true,
      },
      service_sid: {
        type: Sequelize.DataTypes.STRING(64),
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
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('chat_channels');
  },
};
