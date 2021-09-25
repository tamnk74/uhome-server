const { command } = require('../../constants/chat');

module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.createTable(
      'estimation_messages',
      {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.DataTypes.UUID,
          defaultValue: Sequelize.UUID,
        },
        channel_id: {
          type: Sequelize.DataTypes.UUID,
          allowNull: false,
        },
        message_sid: {
          type: Sequelize.DataTypes.STRING(128),
          unique: true,
        },
        type: {
          type: Sequelize.ENUM(command.INFORM_MATERIAL_COST, command.SUBMIT_ESTIMATION_TIME),
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
          unique_estimation_messages: {
            customIndex: true,
            fields: ['channel_id', 'type'],
          },
        },
      }
    ),

  down: (queryInterface) => queryInterface.dropTable('estimation_messages'),
};
