const RequestSupporting = require('../../models/requestSupporting');
const ReceiveIssue = require('../../models/receiveIssue');
const { issueStatus } = require('../../constants/issue');

module.exports = {
  up: async () => {
    const receiveIssues = await ReceiveIssue.findAll({
      where: {
        status: issueStatus.CANCELLED,
      },
    });

    for (let index = 0; index < receiveIssues.length; index++) {
      const receiveIssue = receiveIssues[index];
      // eslint-disable-next-line no-await-in-loop
      await RequestSupporting.destroy({
        where: {
          userId: receiveIssue.userId,
          issueId: receiveIssue.issueId,
        },
        force: true,
      });
    }
  },

  down: () => Promise.resolve(),
};
