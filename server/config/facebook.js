require('dotenv').config();

export const facebookConfig = {
  appId: process.env.FACEBOOK_APP_ID || '',
  appSecret: process.env.FACEBOOK_APP_SECRET,
};
