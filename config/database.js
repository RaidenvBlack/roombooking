const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'roombooking',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: false
});

console.log(`Connecting to MySQL at ${process.env.DB_HOST || 'localhost'} with user ${process.env.DB_USER || 'root'}`);

// Test the connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection established successfully');
    connection.release();
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}

// Export the pool and test function
module.exports = {
  pool,
  testConnection
};
