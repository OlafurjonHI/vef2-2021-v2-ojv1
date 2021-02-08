import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import validator from 'express-validator';
import { RetrieveSignatures, InsertSignatures } from './db.js';

const { body, validationResult } = validator;

dotenv.config();
const {
  PORT: port = 3001,
} = process.env;

const toNormalDate = (date) => `${date.getDate()}.${(date.getMonth() + 1)}.${date.getFullYear()}`;

const dirname = path.resolve();
const app = express();

app.set('view engine', 'ejs');
app.use(express.static(path.join(dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use('/', (req, res, next) => {
  if (res.statusCode === 500) {
    res.render('error');
  } else next();
});
app.locals.errorLocation = [];
app.locals.list = [];
app.locals.normalDate = toNormalDate;
app.get('/', async (req, res) => {
  app.locals.errorLocation = [];
  const {
    name = '',
    ssn = '',
    comment = '',
    anon,
  } = req.body;
  app.locals.name = name;
  app.locals.ssn = ssn;
  app.locals.comment = comment;
  app.locals.anon = anon;
  await RetrieveSignatures().then((d) => {
    app.locals.list = d.rows;
  });
  res.render('index', { errorMessages: null, data: app.locals });
});
app.post(
  '/',
  body('name')
    .isLength({ min: 1 })
    .withMessage('Nafn má ekki vera tómt'),
  body('name')
    .isLength({ max: 128 })
    .withMessage('Nafn má að hámarki vera 128 stafir'),
  body('ssn')
    .isLength({ min: 1 })
    .withMessage('Kennitala má ekki vera tóm'),
  body('ssn')
    .isLength({ min: 10, max: 11 })
    .withMessage('Kennitala verður að vera á formi 000000-0000 eða 0000000000'),
  body('comment')
    .isLength({ max: 400 })
    .withMessage('Athugasemd má að hámarki vera 400 stafir'),
  // eslint-disable-next-line consistent-return
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const {
        name,
        ssn,
        comment,
        anon,
      } = req.body;
      app.locals.name = name;
      app.locals.ssn = ssn;
      app.locals.comment = comment;
      app.locals.anon = anon;
      app.locals.errorLocation = errors.array().map((i) => i.param);
      await RetrieveSignatures().then((d) => {
        app.locals.list = d.rows;
      });
      const errorMessages = errors.array().map((i) => i.msg);
      return res.render('index', { errorMessages, data: app.locals });
    }
    app.locals.errorLocation = [];
    next();
  },
  body('name').trim().escape(),
  body('ssn').blacklist('-'),
  body('comment').trim().escape(),
  async (req, res) => {
    const {
      name,
      ssn,
      comment,
      anon,
    } = req.body;
    app.locals.name = '';
    app.locals.ssn = '';
    app.locals.comment = '';
    app.locals.anon = undefined;
    const letAnon = anon !== undefined;
    await InsertSignatures([name, ssn, comment, letAnon]).then(async () => {
      await RetrieveSignatures().then((d) => {
        app.locals.list = d.rows;
      }).then(() => {
        res.render('index', { errorMessages: null, data: app.locals });
      });
    }).catch(() => {
      res.status(500);
      res.render('error');
    });
  },
);

app.get('*', (req, res) => {
  res.render('404');
});
// Verðum að setja bara *port* svo virki á heroku
app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
