import { I18n } from 'i18n';
import path from 'path';

export const i18n = new I18n({
  locales: ['vi'],
  directory: path.resolve(__dirname, '..', 'locales'),
  defaultLocale: 'vi',
  cookie: 'i18n',
  extension: '.json',
  objectNotation: true,
  register: global,
});
