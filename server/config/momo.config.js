require('dotenv').config();

export const momoConfig = {
  partnerCode: process.env.MOMO_PARTNER_CODE || '',
  partnerRefId: process.env.MOMO_PARTNER_REF_ID || '',
  publicKeyFile: process.env.MOMO_PUBLIC_KEY_FILE || 'momo_public_key',
  requestPaymentUrl: process.env.MOMO_REQUEST_PAYMENT_URL || 'https://test-payment.momo.vn/pay/app',
};
