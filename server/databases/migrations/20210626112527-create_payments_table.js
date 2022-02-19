module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('payments', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      receive_issue_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'receive_issues',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'no action',
      },
      issue_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'issues',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'no action',
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
      total: {
        type: Sequelize.DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      total_cost: {
        type: Sequelize.DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      currency: {
        type: Sequelize.ENUM('VND', 'USD'),
        allowNull: false,
        defaultValue: 'VND',
      },
      status: {
        type: Sequelize.ENUM('OPEN', 'PAID'),
        allowNull: false,
        defaultValue: 'OPEN',
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
    return queryInterface.dropTable('payments');
  },
};
