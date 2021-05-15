import Express from 'express';
import Morgan from 'morgan';
import passport from 'passport';
import CORS from 'cors';
import BodyParser from 'body-parser';
import Compress from 'compression';
import Path from 'path';
import i18n from 'i18n';
import { ApiRouter } from './routes';
import { env } from './config';
import { handleError } from './errors';
import { trimObject } from './helpers/Util';
import './config/passport';

i18n.configure({
  locales: ['vi'],
  directory: `${__dirname}/locales`,
  defaultLocale: 'vi',
  cookie: 'i18n',
  extension: '.json',
  objectNotation: true,
  register: global,
});
// Set up the express app
const app = Express();

// Allow cors
app.use(CORS());
app.use(i18n.init);
// Parse incoming requests data
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: false }));
app.use(Express.urlencoded({ extended: false }));
app.use(Compress());

app.use(passport.initialize());
app.use(passport.session());

app.use(
  Express.static(Path.resolve(__dirname, 'server', 'public'), {
    maxAge: 31557600000,
  })
);

if (env === 'development') {
  app.use(
    Morgan(
      ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'
    )
  );
}

app.set('views', Path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

// set path for static assets
app.use('/static', Express.static(Path.resolve(__dirname, 'public')));

app.use((req, res, next) => {
  // Trim all request body data
  trimObject(req.body);
  next();
});

app.get('/health-check', (req, res) => res.status(200).send('ok'));
app.use('/docs', (req, res) => {
  const allRoutes = ApiRouter.stack.map((moduleRoutes) =>
    moduleRoutes.handle.stack.map((route) =>
      Object.keys(route.route.methods).map((method) => ({
        method,
        path: route.route.path,
      }))
    )
  );
  return res.render('docs', {
    routes: allRoutes.flat(Infinity),
  });
});
app.use('/api', ApiRouter);

/**
 * Error Handler.
 */

app.use(handleError);

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
});

module.exports = app;
