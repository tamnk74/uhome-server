"use strict";

const env = process.env.NODE_ENV || "development"; // development, testing, staging, production
const DSN = process.env.SENTRY_DNS || "sentry_dns" ;
const AppName = process.env.APP_NAME || "Uhome-api";
const Sentry = require('@sentry/node');

if (process.env.NODE_ENV && process.env.NODE_ENV !== 'local') {
  Sentry.init({
    environment: env,
    dsn: DSN
  });

  Sentry.configureScope(scope => {
    scope.setTag("server_name", AppName);
  });
}

export const sentryConfig = {
  Sentry
}
