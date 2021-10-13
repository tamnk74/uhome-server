import { chatMessageQueue } from '../../helpers/Queue';
import ChatService from '../service/chat';
import { twilioClient } from '../../helpers/Twilio';
import { twilioConfig, sentryConfig } from '../../config';

twilioClient
  .setWebhook({
    postWebhookUrl: twilioConfig.postWebhookUrl,
    preWebhookUrl: twilioConfig.preWebhookUrl,
  })
  .then(() => console.log(`Update twilio succeed`))
  .catch((err) => sentryConfig.Sentry.captureException(err));

chatMessageQueue.process('update_message', ChatService.updateMessage);
