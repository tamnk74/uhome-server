module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('notification_rounds', {
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
      user_id: {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: 'users',
          key: 'id',
        },
        allowNull: false,
      },
      round: {
        type: Sequelize.TINYINT,
        defaultValue: 0,
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

    return queryInterface.addIndex('notification_rounds', ['user_id', 'channel_id'], {
      indexName: 'notification_rounds_user_id_idx1',
      unique: true,
    });
  },

  down: (queryInterface) => queryInterface.dropTable('notification_rounds'),
};
