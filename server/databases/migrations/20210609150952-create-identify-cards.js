module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('identify_cards', {
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
      id_num: {
        type: Sequelize.DataTypes.STRING(12),
        allowNull: false,
      },
      name: {
        type: Sequelize.DataTypes.STRING(255),
        allowNull: false,
      },
      dob: {
        type: Sequelize.DataTypes.DATE,
        allowNull: false,
      },
      hometown: {
        type: Sequelize.DataTypes.STRING(255),
        allowNull: false,
      },
      address: {
        type: Sequelize.DataTypes.STRING(255),
        allowNull: false,
      },
      raw: {
        type: Sequelize.DataTypes.JSON,
        allowNull: false,
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
    return queryInterface.dropTable('identify_cards');
  },
};
