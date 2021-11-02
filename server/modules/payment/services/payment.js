import axios from 'axios';
import { paymentMethod, paymentType, currencies } from 'constants/app';
import { momoConfig } from 'config';
import { Momo, paymentLogger } from 'helpers';
import Transaction from 'models/transaction';
import UserProfile from 'models/userProfile';
import UserEvent from 'models/userEvent';
import Event from 'models/event';
import TransactionHistory from 'models/transactionHistory';
import sequelize from 'databases/database';
import uuid, { v4 as uuidv4 } from 'uuid';
import { paymentStatus, eventStatuses, transactionType } from '../../../constants';

export class PaymentService {
  static async process(user, data) {
    const paymentReq = {
      partnerCode: momoConfig.partnerCode,
      partnerRefId: `${user.id}-${Date.now()}`,
      partnerTransId: user.id,
      amount: +data.amount,
    };
    const hashData = await Momo.encryptRSA(paymentReq);

    const { data: payment } = await axios.post(momoConfig.requestPaymentUrl, {
      partnerCode: paymentReq.partnerCode,
      partnerRefId: paymentReq.partnerRefId,
      customerNumber: data.phoneNumber,
      appData: data.token,
      description: 'Nạp tiền vào ví Uhome',
      hash: hashData,
      version: 2.0,
      payType: 3,
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

    return sequelize
      .transaction(async (t) => {
        await Transaction.create(
          {
            userId: user.id,
            type: paymentType.INBOUND,
            method: paymentMethod.MOMO,
            transid: payment.transid,
            amount: payment.amount,
            fee: 0,
            currency: currencies.VND,
            extra: payment,
          },
          { transaction: t }
        );
        await UserProfile.increment('accountBalance', {
          by: payment.amount,
          where: { userId: user.id },
          transaction: t,
        });
        await TransactionHistory.create(
          {
            id: uuidv4(),
            userId: user.id,
            amount: payment.amount,
            issueId: null,
            type: transactionType.DEPOSIT,
            method: paymentMethod.MOMO,
            currency: currencies.VND,
            extra: {
              ...payment,
              customerNumber: data.phoneNumber,
              payAt: new Date(),
            },
          },
          {
            transaction: t,
          }
        );
        const confirmResult = await PaymentService.confirmPayin(paymentReq, payment, data);
        paymentLogger.log({
          level: 'info',
          timestamp: new Date(),
          data: {
            paymentReq,
            confirmResult,
          },
        });
        const profile = await UserProfile.findOne({ where: { userId: user.id } });
        const event = await Event.findOne({
          where: {
            code: 'LIEN-KET-MOMO',
            status: eventStatuses.ACTIVE,
          },
          transaction: t,
        });
        if (event) {
          await UserEvent.findOrCreate({
            where: {
              userId: user.id,
              eventId: event.id,
            },
            defaults: {
              id: uuidv4(),
              userId: user.id,
              eventId: event.id,
              status: eventStatuses.INACTIVE,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            transaction: t,
          });
        }

        return {
          ...confirmResult.data,
          account_balance: profile.accountBalance,
        };
      })
      .catch(async (error) => {
        paymentLogger.log({
          level: 'error',
          timestamp: new Date(),
          data: {
            error,
            paymentReq,
          },
        });
        await PaymentService.cancelPayin(paymentReq, payment, data);
        throw error;
      });
  }

  static async confirmPayin(paymentReq, payment, data) {
    const confirmRequest = {
      partnerCode: momoConfig.partnerCode,
      partnerRefId: paymentReq.partnerRefId,
      requestType: 'capture',
      requestId: paymentReq.partnerRefId,
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

    return confirmResult;
  }

  static async cancelPayin(paymentReq, payment, data) {
    const confirmRequest = {
      partnerCode: momoConfig.partnerCode,
      partnerRefId: paymentReq.partnerRefId,
      requestType: 'revertAuthorize',
      requestId: paymentReq.partnerRefId,
      momoTransId: payment.transid,
    };
    const signature = Momo.createSignature(confirmRequest);
    await axios
      .post(momoConfig.confirmPaymentUrl, {
        ...confirmRequest,
        signature,
        customerNumber: data.phoneNumber,
      })
      .catch((confirmError) => {
        paymentLogger.log({
          level: 'error',
          timestamp: new Date(),
          data: {
            confirmError,
            paymentReq,
          },
        });
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
          extra: {},
        },
        { transaction: t }
      );
      const result = await UserProfile.increment('accountBalance', {
        by: -issue.payment.total,
        where: { userId: user.id },
        transaction: t,
      });

      console.log(result);
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

  static async withdraw(user, data) {
    const { amount, paymentMethod } = data;

    const userProfile = await UserProfile.findOne({
      where: {
        userId: user.id,
      },
    });

    if (userProfile.accountBalance < amount) {
      throw new Error('PAY-0411');
    }
    userProfile.accountBalance -= amount;

    return sequelize.transaction(async (t) => {
      await userProfile.save({ transaction: t });
      return TransactionHistory.create(
        {
          id: uuidv4(),
          amount,
          method: paymentMethod,
          userId: user.id,
          type: transactionType.WITHDRAW,
          status: paymentStatus.OPEN,
          currency: currencies.VND,
        },
        { transaction: t }
      );
    });
  }
}
