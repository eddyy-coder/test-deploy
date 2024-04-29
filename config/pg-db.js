const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE,
  password: process.env.DATABASE_PASSWORD,
  port: 5432, // default PostgreSQL port
  ssl: {
    rejectUnauthorized: false // Set to true to verify SSL certificate
}
});

// Log a message when the pool is created
pool.on('connect', () => {
  console.log('Connected to Database ;)');
});

// Handle error events
pool.on('error', (err) => {
  console.error('Error occurred during PostgreSQL connection:', err);
  //  add additional error handling logic here
  console.log(err)
});

// Listen for notices
pool.on('notice', notice => {
  console.log('PostgreSQL notice:', notice.message);
});

// Log database connection status on application startup
pool.connect()
  .then(() => {
    console.log('Database pool is ready and connected.');
  })
  .catch((err) => {
    console.log(err)
    console.error('Error connecting to the database!');
  });
exports.connection = pool;