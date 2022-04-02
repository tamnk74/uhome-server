module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('banners', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUID,
      },
      event_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'events',
          key: 'id',
        },
      },
      status: {
        type: Sequelize.DataTypes.TINYINT,
        defaultValue: 0,
      },
      image: {
        type: Sequelize.DataTypes.STRING(1024),
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
    }),

  down: (queryInterface) => queryInterface.dropTable('banners'),
};
