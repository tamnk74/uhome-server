import { unitTime } from '../../constants/issue';

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.addColumn('receive_issues', 'time_unit', {
      type: Sequelize.DataTypes.STRING,
      before: 'time',
      defaultValue: unitTime.HOUR,
    }),

  down: (queryInterface) => queryInterface.removeColumn('receive_issues', 'time_unit'),
};
