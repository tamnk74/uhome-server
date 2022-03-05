module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('transactions', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      user_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'no action',
      },
      type: {
        type: Sequelize.ENUM('INBOUND', 'OUTBOUND'),
        allowNull: false,
        defaultValue: 'INBOUND',
      },
      method: {
        type: Sequelize.ENUM('system', 'momo'),
        allowNull: false,
        defaultValue: 'system',
      },
      transid: {
        type: Sequelize.DataTypes.STRING(36),
        unique: true,
        allowNull: false,
      },
      amount: {
        type: Sequelize.DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      fee: {
        type: Sequelize.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      currency: {
        type: Sequelize.ENUM('VND', 'USD'),
        allowNull: false,
        defaultValue: 'VND',
      },
      extra: {
        type: Sequelize.DataTypes.JSON,
        allowNull: false,
        defaultValue: '{}',
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
    return queryInterface.dropTable('transactions');
  },
};
