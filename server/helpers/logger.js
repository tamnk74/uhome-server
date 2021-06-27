const { createLogger, transports } = require('winston');

export const paymentLogger = createLogger({
  transports: [new transports.Console(), new transports.File({ filename: 'payment.log' })],
});
