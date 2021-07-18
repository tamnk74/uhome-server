require('dotenv').config();

const domainPrefix = process.env.NODE_ENV === 'production' ? '' : 'test-';

export const momoConfig = {
  accessKey: process.env.MOMO_ACCESS_KEY || '',
  secretKey: process.env.MOMO_SECRET_KEY || '',
  partnerCode: process.env.MOMO_PARTNER_CODE || '',
  publicKeyFile: process.env.MOMO_PUBLIC_KEY_FILE || 'momo_public_key',
  requestPaymentUrl: `https://${domainPrefix}payment.momo.vn/pay/app`,
  confirmPaymentUrl: `https://${domainPrefix}payment.momo.vn/pay/confirm`,
};
