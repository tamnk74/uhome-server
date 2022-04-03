const uuid = require('uuid');
const ReceiveIssue = require('../../models/receiveIssue');
const RequestSupporting = require('../../models/requestSupporting');
const { issueStatus } = require('../../constants');

const addMissedRequestSupportingData = async (receiveId) => {
  const receiveIssue = await ReceiveIssue.findByPk(receiveId);

  if (receiveIssue) {
    await RequestSupporting.findOrCreate({
      where: {
        issueId: receiveIssue.issueId,
        userId: receiveIssue.userId,
      },
      defaults: {
        id: uuid.v4(),
        issueId: receiveIssue.issueId,
        userId: receiveIssue.userId,
      },
    });
  }
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sql = `SELECT issues.id as issueId,
      receive_issues.id as receiveId
      FROM
        issues
          INNER JOIN
        receive_issues ON receive_issues.issue_id = issues.id
          LEFT JOIN
        request_supportings ON issues.id = request_supportings.issue_id
      where request_supportings.id is null and receive_issues.status != :status`;

    const results = await queryInterface.sequelize.query(sql, {
      replacements: { status: issueStatus.CANCELLED },
      type: Sequelize.QueryTypes.SELECT,
    });
    const promises = results.map((item) => addMissedRequestSupportingData(item.receiveId));

    return Promise.all(promises);
  },

  down: () => Promise.resolve(),
};
