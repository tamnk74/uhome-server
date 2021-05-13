const Sentry = require('@sentry/node');

const env = process.env.NODE_ENV || 'development'; // development, testing, staging, production
const DSN = process.env.SENTRY_DNS || '';
const AppName = process.env.APP_NAME || 'Uhome-api';

if (process.env.NODE_ENV && env !== 'local') {
  Sentry.init({
    environment: env,
    dsn: DSN,
  });

  Sentry.configureScope((scope) => {
    scope.setTag('server_name', AppName);
  });
}

export const sentryConfig = {
  DSN,
  Sentry,
};
