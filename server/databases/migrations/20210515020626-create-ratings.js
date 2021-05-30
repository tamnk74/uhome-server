module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('ratings', {
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
      issue_id: {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: 'issues',
          key: 'id',
        },
        allowNull: false,
      },
      rate: {
        type: Sequelize.DataTypes.DECIMAL(2),
      },
      comment: {
        type: Sequelize.STRING(2048),
      },
    });
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('ratings');
  },
};
