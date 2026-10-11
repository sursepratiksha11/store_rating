const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const pool = require('../db');
const { authenticate } = require('../middleware/auth');
const { rules, check } = require('../middleware/validate');

const sign = (u) =>
  jwt.sign({ id: u.id, role: u.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '1d' });
const publicUser = ({ id, name, email, address, role }) => ({ id, name, email, address, role });

router.post('/signup', [rules.name, rules.email, rules.address, rules.password()], check, async (req, res, next) => {
  try {
    const { name, email, address, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO users (name,email,password_hash,address,role)
       VALUES ($1,$2,$3,$4,'NORMAL_USER') RETURNING *`,
      [name, email, hash, address]
    );
    res.status(201).json({ token: sign(rows[0]), user: publicUser(rows[0]) });
  } catch (e) { next(e); }
});

router.post('/login', [body('email').isEmail().normalizeEmail(), body('password').notEmpty()], check, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [req.body.email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(req.body.password, user.password_hash)))
      return res.status(401).json({ message: 'Invalid email or password' });
    res.json({ token: sign(user), user: publicUser(user) });
  } catch (e) { next(e); }
});

router.put('/password', authenticate, [body('currentPassword').notEmpty().withMessage('Current password is required'), rules.password('newPassword')], check, async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT password_hash FROM users WHERE id=$1', [req.user.id]);
    if (!(await bcrypt.compare(req.body.currentPassword, rows[0].password_hash)))
      return res.status(400).json({ message: 'Current password is incorrect' });
    await pool.query('UPDATE users SET password_hash=$1 WHERE id=$2', [await bcrypt.hash(req.body.newPassword, 10), req.user.id]);
    res.json({ message: 'Password updated' });
  } catch (e) { next(e); }
});

module.exports = router;
