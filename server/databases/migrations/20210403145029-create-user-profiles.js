module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */

    return queryInterface.createTable('user_profiles', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      user_id: {
        type: Sequelize.DataTypes.UUID,
        allowNull: false,
      },
      reliability: {
        type: Sequelize.DataTypes.DECIMAL(12),
        defaultValue: 0,
      },
      total_issue_completed: {
        type: Sequelize.DataTypes.INTEGER,
        defaultValue: 0,
      },
      gender: {
        type: Sequelize.DataTypes.TINYINT,
      },
      birthday: {
        type: Sequelize.DATE,
      },
      identity_card: {
        type: Sequelize.DataTypes.JSON,
      },
      email: {
        type: Sequelize.DataTypes.STRING(127),
      },
      certificate: {
        type: Sequelize.DataTypes.TEXT,
      },
      year_experience: {
        type: Sequelize.DataTypes.INTEGER,
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
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return queryInterface.dropTable('user_profiles');
  },
};
