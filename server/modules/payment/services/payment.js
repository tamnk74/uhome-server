import axios from 'axios';
import { momoConfig } from '../../../config';
import { Momo, paymentLogger } from '../../../helpers';

export class PaymentService {
  static async process(receiveIssue, data) {
    const paymentReq = {
      partnerCode: momoConfig.partnerCode,
      partnerRefId: receiveIssue.id,
      partnerTransId: receiveIssue.id,
      amount: receiveIssue.payment.total,
      description: 'Thanh toan dich vu uhome qua momo',
    };
    const hashData = await Momo.encryptRSA(paymentReq);

    const { data: payment } = await axios.post(momoConfig.requestPaymentUrl, {
      partnerCode: momoConfig.partnerCode,
      partnerRefId: receiveIssue.id,
      customerNumber: data.phoneNumber,
      appData: data.token,
      hash: hashData,
      version: 2.0,
      payType: 3,
      description: 'Thanh toan dich vu uhome qua momo',
    });
    if (+payment.status !== 0) {
      paymentLogger.log({
        level: 'error',
        timestamp: new Date(),
        data: {
          paymentReq,
          payment,
        },
      });
      throw new Error('PAY-0001');
    }
    const requestId = receiveIssue.id;
    const confirmRequest = {
      partnerCode: momoConfig.partnerCode,
      partnerRefId: receiveIssue.id,
      requestType: 'capture',
      requestId,
      momoTransId: payment.transid,
    };
    const signature = Momo.createSignature(confirmRequest);
    const { data: confirmResult } = await axios.post(momoConfig.confirmPaymentUrl, {
      ...confirmRequest,
      signature,
      customerNumber: data.phoneNumber,
    });

    if (+confirmResult.status !== 0) {
      paymentLogger.log({
        level: 'error',
        timestamp: new Date(),
        data: {
          confirmRequest,
          confirmResult,
        },
      });
      throw new Error('PAY-0002');
    }
    await receiveIssue.payment.update({ status: 'PAID' });
    paymentLogger.log({
      level: 'infor',
      timestamp: new Date(),
      data: {
        confirmRequest,
        paymentReq,
        confirmResult,
      },
    });

    return confirmResult.data;
  }

  static confirmMomo(data) {
    // TODO verify data and check signature
    paymentLogger.log({
      level: 'infor',
      timestamp: new Date(),
      momo: data,
    });
    const momoResponse = {
      amount: data.amount,
      message: 'Thành công',
      momoTransId: data.momoTransId,
      partnerRefId: data.partnerRefId,
      status: 0,
    };
    const signature = Momo.createSignature(momoResponse);
    return {
      ...momoResponse,
      signature,
    };
  }
}
