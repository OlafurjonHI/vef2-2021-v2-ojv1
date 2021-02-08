import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const {
  DATABASE_URL: connectionString,
} = process.env;

if (!connectionString) {
  console.error('Vantar DATABASE_URL');
  process.exit(1);
}

// TODO gagnagrunnstengingar
const pool = new pg.Pool({
  connectionString
});
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

const RetrieveSignatures = async () => {
  const client = await pool.connect();
  let rows = [];
  try {
    rows = await client.query('SELECT * FROM Signatures');
  } catch (e) {
    console.error('Error selecting', e);
  } finally {
    client.release();
  }
  // await pool.end();
  return rows;
};

const InsertSignatures = async (values) => {
  const client = await pool.connect();
  const query = 'INSERT INTO Signatures(name,nationalId, comment,anonymous) VALUES($1, $2, $3,$4) RETURNING *';
  let result = [];
  try {
    result = await client.query(query, values);
  } catch (e) {
    console.error('Error Inserting Data', e);
  } finally {
    client.release();
  }
  // await pool.end();
  return result;
};

export { RetrieveSignatures, InsertSignatures };

export default RetrieveSignatures;
