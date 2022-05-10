export const issueStatus = Object.freeze({
  SYSTEM_VERIFYING: 'SYSTEM_VERIFYING',
  OPEN: 'OPEN',
  CHATTING: 'CHATTING',
  IN_PROGRESS: 'IN_PROGRESS',
  WAITING_VERIFY: 'WAITING_VERIFY',
  WAITING_PAYMENT: 'WAITING_PAYMENT',
  DONE: 'DONE',
  CANCELLED: 'CANCELLED',
  APPROVAL: 'APPROVAL',
  REQUESTING_SUPPORT: 'REQUESTING_SUPPORT',
});

export const workingTime = Object.freeze({
  normalTime: [
    {
      from: 4,
      to: 18,
    },
  ],
  nightTime: [
    {
      from: 18,
      to: 23,
    },
  ],
  urgentTime: [
    {
      from: 0,
      to: 4,
    },
    {
      from: 23,
      to: 24,
    },
  ],
});

export const transactionType = Object.freeze({
  DEPOSIT: 'DEPOSIT',
  WITHDRAW: 'WITHDRAW',
  WAGE: 'WAGE',
  PAY: 'PAY',
  BONUS: 'BONUS',
});

export const issueType = Object.freeze({
  HOTFIX: 'HOTFIX',
  NORMAL: 'NORMAL',
});

export const unitTime = Object.freeze({
  DAY: 'DAY',
  HOUR: 'HOUR',
});

export const TimeWorkingType = Object.freeze({
  urgentTime: 'URGENT',
  normalTime: 'NORMAL',
  nightTime: 'NIGHT',
  holiday: 'HOLIDAY',
});
