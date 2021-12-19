require('dotenv').config();

export const appleConfig = {
  keyId: process.env.APPLE_KEY_ID || '',
  clientId: process.env.APPLE_CLIENT_ID || '',
  teamId: process.env.APPLE_TEAM_ID || '',
};
