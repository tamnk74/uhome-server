module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('users', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      name: {
        type: Sequelize.DataTypes.STRING(255),
        allowNull: false,
      },
      phone_number: {
        type: Sequelize.DataTypes.STRING(16),
        unique: true,
      },
      birthday: {
        type: Sequelize.DataTypes.DATEONLY,
      },
      address: {
        type: Sequelize.DataTypes.STRING(255),
      },
      avatar: {
        type: Sequelize.DataTypes.STRING(1024),
      },
      password: {
        type: Sequelize.DataTypes.STRING(127),
        allowNull: false,
      },
      lon: {
        type: Sequelize.DataTypes.DECIMAL(9, 6),
      },
      lat: {
        type: Sequelize.DataTypes.DECIMAL(9, 6),
      },
      role: {
        type: Sequelize.ENUM('ADMIN', 'USER'),
        allowNull: false,
        defaultValue: 'USER',
      },
      status: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
  },
  down: (queryInterface) => {
    return queryInterface.dropTable('users');
  },
};
