module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('transaction_histories', {
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
      amount: {
        type: Sequelize.DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      issue_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'issues',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'no action',
      },
      type: {
        type: Sequelize.DataTypes.ENUM('DEPOSIT', 'WITHDRAW', 'WAGE', 'PAY'),
      },
      method: {
        type: Sequelize.ENUM('system', 'momo'),
        allowNull: false,
        defaultValue: 'system',
      },
      currency: {
        type: Sequelize.ENUM('VND', 'USD'),
        allowNull: false,
        defaultValue: 'VND',
      },
      extra: {
        type: Sequelize.DataTypes.JSON,
        allowNull: false,
        defaultValue: {},
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
    return queryInterface.dropTable('transaction_histories');
  },
};
