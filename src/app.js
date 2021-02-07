import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import validator from 'express-validator';

const { body, validationResult } = validator;

dotenv.config();
const {
  PORT: port = 3001,
} = process.env;

const dirname = path.resolve();
const app = express();

app.set('view engine', 'ejs');
app.use(express.static(path.join(dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index', { errorMessages: null });
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
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map((i) => i.msg);
      return res.render('index', { errorMessages });
    }
    next();
  },
  body('name').trim().escape(),
  body('ssn').blacklist('-'),
  (req, res) => {
    const {
      name,
      ssn,
      comment,
    } = req.body;
    res.render('index', { errorMessages: null });
  },
);

app.get('*', (req, res) => {
  res.render('404');
});
// Verðum að setja bara *port* svo virki á heroku
app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
