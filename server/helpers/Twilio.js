import twilio from 'twilio';
import { twilioConfig } from '../config';

/* eslint-disable class-methods-use-this */
export default class Twilio {
  static client = null;

  constructor() {
    if (this.client) {
      return this;
    }

    this.client = twilio(twilioConfig.accountId, twilioConfig.authToken);
  }

  async createChannel(name) {
    return this.client.chat.services(twilioConfig.chatId).channels.create({
      friendlyName: name,
    });
  }

  async createUser(id) {
    return this.client.chat.services(twilioConfig.chatId).users.create({
      identity: id,
    });
  }

  async addMember(channelId, userId, attributes) {
    return this.client.chat
      .services(twilioConfig.chatId)
      .channels(channelId)
      .members.create({ identity: userId, attributes });
  }

  async sendMessage(channelId, data) {
    return this.client.chat.services(twilioConfig.chatId).channels(channelId).messages.create(data);
  }

  async getUsers(limit, page) {
    return this.client.chat.services(twilioConfig.chatId).users.list({
      limit,
      page,
    });
  }

  async getAccessToken(identity) {
    const { AccessToken } = twilio.jwt;
    const { ChatGrant } = AccessToken;
    const chatGrant = new ChatGrant({
      serviceSid: twilioConfig.chatId,
    });

    const token = new AccessToken(twilioConfig.accountId, twilioConfig.keyId, twilioConfig.secret, {
      identity,
    });

    token.addGrant(chatGrant);

    return token.toJwt();
  }

  async getMessage(channelId, id) {
    return this.client.chat.services(twilioConfig.chatId).channels(channelId).messages(id).fetch();
  }

  async updateMessage(id, channelId, data) {
    return this.client.chat
      .services(twilioConfig.chatId)
      .channels(channelId)
      .messages(id)
      .update(data);
  }

  async fetchMessage(id, channelId) {
    return this.client.chat.services(twilioConfig.chatId).channels(channelId).messages(id).fetch();
  }

  async setWebhook({ postWebhookUrl, preWebhookUrl, webhookMethod = 'POST' }) {
    return this.client.conversations
      .services(twilioConfig.chatId)
      .configuration.webhooks()
      .update({
        postWebhookUrl,
        preWebhookUrl,
        webhookMethod,
        webhookFilters: ['onMessageAdded'],
      });
  }
}

export const twilioClient = new Twilio();
