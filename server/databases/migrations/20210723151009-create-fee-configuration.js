module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('fee_configurations', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      worker_fee: {
        type: Sequelize.DataTypes.FLOAT,
        defaultValue: 0,
      },
      customer_fee: {
        type: Sequelize.DataTypes.FLOAT,
        defaultValue: 0,
      },
      distance: {
        type: Sequelize.DataTypes.FLOAT,
        defaultValue: 0,
      },
      night_time: {
        type: Sequelize.DataTypes.FLOAT,
        defaultValue: 0,
      },
      urgent_time: {
        type: Sequelize.DataTypes.FLOAT,
        defaultValue: 0,
      },
      holiday: {
        type: Sequelize.DataTypes.FLOAT,
        defaultValue: 0,
      },
      experience_fee: {
        type: Sequelize.DataTypes.FLOAT,
        defaultValue: 0,
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
    return queryInterface.dropTable('fee_configurations');
  },
};
