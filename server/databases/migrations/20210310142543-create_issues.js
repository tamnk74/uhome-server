import { issueStatus } from '../../constants';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('issues', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      created_by: {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: 'users',
          key: 'id',
        },
        allowNull: false,
      },
      title: {
        type: Sequelize.DataTypes.STRING(2048),
        allowNull: false,
      },
      location: {
        type: Sequelize.DataTypes.STRING(1024),
      },
      lat: {
        type: Sequelize.DataTypes.DECIMAL(9, 6),
      },
      lon: {
        type: Sequelize.DataTypes.DECIMAL(9, 6),
      },
      status: {
        type: Sequelize.ENUM(Object.values(issueStatus)),
        defaultValue: issueStatus.OPEN,
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
    return queryInterface.dropTable('issues');
  },
};
