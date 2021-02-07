import express from 'express';
import dotenv from 'dotenv';

const path = require('path');

dotenv.config();

const {
  PORT: port = 3000,
} = process.env;

const app = express();
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));


// TODO setja upp rest af virkni!

// Verðum að setja bara *port* svo virki á heroku
app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
