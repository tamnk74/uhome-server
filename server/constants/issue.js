export const issueStatus = Object.freeze({
  SYSTEM_VERIFYING: 'SYSTEM_VERIFYING',
  OPEN: 'OPEN',
  CHATTING: 'CHATTING',
  IN_PROGRESS: 'IN_PROGRESS',
  WAITING_VERIFY: 'WAITING_VERIFY',
  DONE: 'DONE',
  CANCELLED: 'CANCELLED',
});

export const workingTime = Object.freeze({
  normalTime: [
    {
      from: 8,
      to: 18,
    },
  ],
  nightTime: [
    {
      from: 18,
      to: 22,
    },
  ],
  urgentTime: [
    {
      from: 0,
      to: 8,
    },
    {
      from: 22,
      to: 24,
    },
  ],
});

export const transactionType = Object.freeze({
  DEPOSIT: 'DEPOSIT',
  WITHDRAW: 'WITHDRAW',
  WAGE: 'WAGE',
  PAY: 'PAY',
});
