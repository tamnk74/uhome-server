import axios from 'axios';
import { momoConfig } from '../../../config';
import { Momo } from '../../../helpers';

export class PaymentService {
  static async process(data) {
    const hashData = await Momo.encryptRSA({
      partnerCode: momoConfig.partnerCode,
      partnerRefId: momoConfig.partnerRefId,
      partnerTransId: '8374736463', // payment_id
      amount: data.amount, // payemnt amount
      description: 'Thanh toan dich vu uhome qua momo',
    });

    const payment = await axios.post(momoConfig.requestPaymentUrl, {
      partnerCode: momoConfig.partnerCode,
      partnerRefId: momoConfig.partnerRefId,
      customerNumber: data.phoneNumber,
      appData: data.token,
      hash: hashData,
      version: 2.0,
      payType: 3,
      description: 'Thanh toan dich vu uhome qua momo',
    });

    const res = await axios.post(momoConfig.confirmPaymentUrl, {
      partnerCode: momoConfig.partnerCode,
      partnerRefId: momoConfig.partnerRefId,
      transid: payment.transid,
      customerNumber: data.phoneNumber,
      appData: data.token,
      hash: hashData,
      version: 2.0,
      payType: 3,
      description: 'Thanh toan dich vu uhome qua momo',
    });

    return res.data;
  }
}
