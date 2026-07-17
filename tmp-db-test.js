const mysql = require('mysql2/promise');

(async () => {
  try {
    const conn = await mysql.createConnection({ host: '10.16.0.1', port: 3306, user: 'albert8333', password: 'Sest123!' });
    const [rows] = await conn.query('SHOW DATABASES');
    console.log(JSON.stringify(rows, null, 2));
    await conn.end();
  } catch (err) {
    console.error('ERR', err.message);
    process.exit(1);
  }
})();
