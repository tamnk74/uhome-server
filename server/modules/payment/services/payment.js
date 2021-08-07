import axios from 'axios';
import { paymentMethod, paymentType, currencies } from 'constants/app';
import { momoConfig } from 'config';
import { Momo, paymentLogger } from 'helpers';
import Transaction from 'models/transaction';
import UserProfile from 'models/userProfile';
import sequelize from 'databases/database';
import uuid from 'uuid';
import { paymentStatus } from 'constants';

export class PaymentService {
  static async process(user, data) {
    const paymentReq = {
      partnerCode: momoConfig.partnerCode,
      partnerRefId: user.id,
      partnerTransId: user.id,
      amount: data.amount,
      description: 'Thanh toan dich vu uhome qua momo',
    };
    const hashData = await Momo.encryptRSA(paymentReq);

    const { data: payment } = await axios.post(momoConfig.requestPaymentUrl, {
      partnerCode: momoConfig.partnerCode,
      partnerRefId: user.id,
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
    const requestId = user.id;
    const confirmRequest = {
      partnerCode: momoConfig.partnerCode,
      partnerRefId: user.id,
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

    return sequelize
      .transaction(async (t) => {
        await Transaction.create(
          {
            userId: user.id,
            type: paymentType.INBOUND,
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
        await UserProfile.increment('accountBalance', {
          by: confirmResult.data.amount,
          where: { userId: user.id },
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
      })
      .catch((error) => {
        // Todo handle refund
        paymentLogger.log({
          level: 'error',
          timestamp: new Date(),
          data: {
            error,
            confirmRequest,
            paymentReq,
            confirmResult,
          },
        });

        return null;
      });
  }

  static async payment({ user, issue }) {
    return sequelize.transaction(async (t) => {
      const transaction = await Transaction.create(
        {
          userId: user.id,
          type: paymentType.OUTBOUND,
          method: paymentMethod.SYSTEM,
          transid: uuid(),
          amount: issue.payment.total,
          fee: 0,
          currency: currencies.VND,
          extra: JSON.stringify({}),
        },
        { transaction: t }
      );
      await UserProfile.increment('accountBalance', {
        by: -issue.payment.total,
        where: { userId: user.id },
        transaction: t,
      });
      await issue.payment.update(
        {
          status: paymentStatus.PAID,
        },
        { transaction: t }
      );

      return {
        transaction,
      };
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
