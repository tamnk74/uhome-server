import { issueStatus } from '../../constants';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('issues', 'status', {
      type: Sequelize.ENUM(Object.values(issueStatus)),
    });
    await queryInterface.changeColumn('receive_issues', 'status', {
      type: Sequelize.ENUM(Object.values(issueStatus)),
    });
  },

  down: () => Promise.resolve(),
};
