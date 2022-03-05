module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('chat_members', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      channel_id: {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: 'chat_channels',
          key: 'id',
        },
        allowNull: false,
      },
      user_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      channel_sid: {
        type: Sequelize.DataTypes.STRING(127),
        allowNull: false,
      },
      identity: {
        type: Sequelize.DataTypes.STRING(127),
        allowNull: false,
      },
      friendly_name: {
        type: Sequelize.DataTypes.STRING(127),
        allowNull: true,
      },
      role_sid: {
        type: Sequelize.DataTypes.STRING(127),
        allowNull: false,
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

    return queryInterface.addIndex('chat_members', ['user_id', 'channel_id'], {
      indexName: 'chat_members_channel_id_user_id',
    });
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('chat_members');
  },
};
