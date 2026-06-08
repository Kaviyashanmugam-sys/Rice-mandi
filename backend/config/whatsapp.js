const whatsappConfig = {
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
  webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
  apiVersion: process.env.WHATSAPP_API_VERSION || 'v19.0',
  get baseUrl() {
    return `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}`;
  },
  get messagesUrl() {
    return `${this.baseUrl}/messages`;
  }
};

module.exports = whatsappConfig;
