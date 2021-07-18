import axios from 'axios';
import { paymentMethod, paymentType, currencies } from 'constants/app';
import { momoConfig } from 'config';
import { Momo, paymentLogger } from 'helpers';
import Transaction from 'models/transaction';
import UserProfile from 'models/userProfile';
import sequelize from 'databases/database';

export class PaymentService {
  static async process(issue, data, { user }) {
    console.log(issue);
    const paymentReq = {
      partnerCode: momoConfig.partnerCode,
      partnerRefId: issue.id,
      partnerTransId: issue.id,
      amount: issue.payment.total,
      description: 'Thanh toan dich vu uhome qua momo',
    };
    const hashData = await Momo.encryptRSA(paymentReq);

    const { data: payment } = await axios.post(momoConfig.requestPaymentUrl, {
      partnerCode: momoConfig.partnerCode,
      partnerRefId: issue.id,
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
    const requestId = issue.id;
    const confirmRequest = {
      partnerCode: momoConfig.partnerCode,
      partnerRefId: issue.id,
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

    return sequelize.transaction(async (t) => {
      await issue.payment.update({ status: 'PAID' }, { transaction: t });
      await Transaction.create(
        {
          paymentId: issue.payment.id,
          userId: user,
          type: paymentType.OUTBOUND,
          method: paymentMethod.MOMO,
          transid: confirmResult.data.momoTransId,
          amount: confirmResult.data.amount,
          fee: 0,
          currency: currencies.VND,
          extra: JSON.stringify({
            ...confirmResult.data,
          }),
        },
        { transaction: t }
      );
      await Transaction.create(
        {
          paymentId: issue.payment.id,
          userId: issue.supporting.userId,
          type: paymentType.INBOUND,
          method: paymentMethod.SYSTEM,
          transid: confirmResult.data.momoTransId,
          amount: confirmResult.data.amount,
          fee: 0,
          currency: currencies.VND,
          extra: JSON.stringify({
            ...confirmResult.data,
          }),
        },
        { transaction: t }
      );
      await UserProfile.increment('accountBalance', {
        by: confirmResult.data.amount,
        where: { userId: issue.supporting.userId },
        transaction: t,
      });
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
    });
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
