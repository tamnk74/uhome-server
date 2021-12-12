require('babel-core/register');
require('babel-polyfill');
const { i18n } = require('../config/i18n');

i18n.init();
require('./jobs/cleanAttachments');
require('./jobs/push_notification');
require('./jobs/verifyIdentifyCard');
require('./jobs/chat');
