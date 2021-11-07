require('dotenv').config();

export const twilioConfig = {
  accountId: process.env.TWILIO_ACCOUNT_SID || '',
  keyId: process.env.TWILIO_API_KEY || '',
  secret: process.env.TWILIO_API_SECRET || '',
  chatId: process.env.TWILIO_CHAT_SERVICE_SID || '',
  authToken: process.env.TWILIO_AUTH_TOKEN || '',
  messagingId: process.env.TWILIO_MESSAGING_SERVICE_SID || '',
  preWebhookUrl: process.env.TWILIO_PRE_WEBHOOK_URL || '',
  postWebhookUrl: process.env.TWILIO_POST_WEBHOOK_URL || '',
  maximumJoiningChannel: parseInt(process.env.TWILIO_MAXIMUM_JOINING_CHANNEL, 10) || 10,
};
