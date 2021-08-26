import { withdrawStatus } from '../../constants';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('withdraw_requestion', {
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
      payment_method: {
        type: Sequelize.DataTypes.ENUM('cash', 'momo'),
        allowNull: false,
        defaultValue: 'cash',
      },
      currency: {
        type: Sequelize.ENUM('VND', 'USD'),
        allowNull: false,
        defaultValue: 'VND',
      },
      status: {
        type: Sequelize.ENUM(Object.values(withdrawStatus)),
        defaultValue: withdrawStatus.OPEN,
      },
      fail_reason: {
        type: Sequelize.TEXT,
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
    return queryInterface.dropTable('withdraw_requestion');
  },
};
