import express from 'express';
import dotenv from 'dotenv';
import path from 'path';


dotenv.config();

const {
  PORT: port = 3000,
} = process.env;

const dirname = path.resolve();
const app = express();
app.set('view engine', 'ejs');
app.use(express.static(path.join(dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index');
});
app.get('*', (req, res) => {
  res.render('404');
});
// Verðum að setja bara *port* svo virki á heroku
app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
