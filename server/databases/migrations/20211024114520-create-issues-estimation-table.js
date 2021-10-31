import { issueType, unitTime } from '../../constants/issue';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable('issue_estimations', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.UUID,
      },
      receive_issue_id: {
        type: Sequelize.DataTypes.UUID,
        references: {
          model: 'receive_issues',
          key: 'id',
        },
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: issueType.HOTFIX,
      },
      total_time: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      unit_time: {
        type: Sequelize.STRING,
        defaultValue: unitTime.HOUR,
      },
      num_of_worker: {
        type: Sequelize.DataTypes.INTEGER,
        defaultValue: 1,
      },
      worker_fee: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      customer_fee: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 1,
      },
      working_times: {
        type: Sequelize.DataTypes.JSON,
        defaultValue: '[]',
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
    }),

  down: (queryInterface) => queryInterface.dropTable('issue_estimations'),
};
