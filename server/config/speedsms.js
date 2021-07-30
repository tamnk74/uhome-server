require('dotenv').config();

export const speedSMSConfig = {
  accessToken: process.env.SPEED_SMS_ACCESS_TOKEN || '',
  branchName: process.env.SPEED_SMS_BRANCH_NAME || '',
};
