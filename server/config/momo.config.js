require('dotenv').config();

const domainPrefix = process.env.NODE_ENV === 'production' ? '' : 'test-';

export const momoConfig = {
  partnerCode: process.env.MOMO_PARTNER_CODE || '',
  partnerRefId: process.env.MOMO_PARTNER_REF_ID || '',
  publicKeyFile: process.env.MOMO_PUBLIC_KEY_FILE || 'momo_public_key',
  requestPaymentUrl: `https://${domainPrefix}payment.momo.vn/pay/app`,
  confirmPaymentUrl: `https://${domainPrefix}payment.momo.vn/pay/confirm`,
};
