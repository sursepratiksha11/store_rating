const bcrypt = require('bcryptjs');
const pool = require('./db');
(async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await pool.query(
    `INSERT INTO users (name,email,password_hash,address,role)
     VALUES ($1,$2,$3,'Head Office','ADMIN') ON CONFLICT (email) DO NOTHING`,
    [ADMIN_NAME, ADMIN_EMAIL, hash]
  );
  console.log('Admin ready: ' + ADMIN_EMAIL);
  await pool.end();
})().catch((e) => { console.error(e); process.exit(1); });
