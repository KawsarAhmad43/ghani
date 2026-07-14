const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDb() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ghani_db',
    port: parseInt(process.env.DB_PORT || '3306')
  });

  try {
    const [rows] = await pool.query('SELECT * FROM users');
    console.log('Users in DB:', JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error('Error querying DB:', err);
  } finally {
    await pool.end();
  }
}

checkDb();
