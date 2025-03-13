const pool = require('./config/db');

(async () => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log('MySQL Connection Successful:', rows);
  } catch (err) {
    console.error('MySQL Connection Error:', err);
  }
})();
