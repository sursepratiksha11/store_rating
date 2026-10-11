const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const { rules, check } = require('../middleware/validate');

router.use(authenticate, authorize('ADMIN'));

const USER_SORT = { name: 'u.name', email: 'u.email', address: 'u.address', role: 'u.role' };
const STORE_SORT = { name: 's.name', email: 's.email', address: 's.address', rating: 'rating' };
const dir = (o) => (String(o).toLowerCase() === 'desc' ? 'DESC' : 'ASC');
const val = (v) => (v && String(v).trim() ? String(v).trim() : null);

router.get('/stats', async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT
      (SELECT COUNT(*) FROM users)::int   AS users,
      (SELECT COUNT(*) FROM stores)::int  AS stores,
      (SELECT COUNT(*) FROM ratings)::int AS ratings`);
    res.json(rows[0]);
  } catch (e) { next(e); }
});

router.get('/users', async (req, res, next) => {
  try {
    const { name, email, address, role, sort, order } = req.query;
    const { rows } = await pool.query(
      `SELECT u.id,u.name,u.email,u.address,u.role,
        (SELECT ROUND(AVG(r.rating),1) FROM ratings r JOIN stores s ON s.id=r.store_id WHERE s.owner_id=u.id) AS rating
       FROM users u
       WHERE ($1::text IS NULL OR u.name    ILIKE '%'||$1||'%')
         AND ($2::text IS NULL OR u.email   ILIKE '%'||$2||'%')
         AND ($3::text IS NULL OR u.address ILIKE '%'||$3||'%')
         AND ($4::text IS NULL OR u.role::text = $4)
       ORDER BY ${USER_SORT[sort] || USER_SORT.name} ${dir(order)}`,
      [val(name), val(email), val(address), val(role)]
    );
    res.json(rows);
  } catch (e) { next(e); }
});

router.get('/users/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.id,u.name,u.email,u.address,u.role,u.created_at,
        (SELECT ROUND(AVG(r.rating),1) FROM ratings r JOIN stores s ON s.id=r.store_id WHERE s.owner_id=u.id) AS rating
       FROM users u WHERE u.id=$1`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (e) { next(e); }
});

router.post('/users', [rules.name, rules.email, rules.address, rules.password(),
  body('role').isIn(['ADMIN', 'NORMAL_USER', 'STORE_OWNER']).withMessage('Invalid role')], check, async (req, res, next) => {
  try {
    const { name, email, address, password, role } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO users (name,email,password_hash,address,role) VALUES ($1,$2,$3,$4,$5)
       RETURNING id,name,email,address,role`,
      [name, email, await bcrypt.hash(password, 10), address, role]);
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
});

router.get('/stores', async (req, res, next) => {
  try {
    const { name, email, address, sort, order } = req.query;
    const { rows } = await pool.query(
      `SELECT s.id,s.name,s.email,s.address,
              COALESCE(ROUND(AVG(r.rating),1),0) AS rating, COUNT(r.id)::int AS total_ratings
       FROM stores s LEFT JOIN ratings r ON r.store_id=s.id
       WHERE ($1::text IS NULL OR s.name    ILIKE '%'||$1||'%')
         AND ($2::text IS NULL OR s.email   ILIKE '%'||$2||'%')
         AND ($3::text IS NULL OR s.address ILIKE '%'||$3||'%')
       GROUP BY s.id
       ORDER BY ${STORE_SORT[sort] || STORE_SORT.name} ${dir(order)}`,
      [val(name), val(email), val(address)]);
    res.json(rows);
  } catch (e) { next(e); }
});

router.post('/stores', [rules.name, rules.email, rules.address,
  body('ownerId').optional({ nullable: true, checkFalsy: true }).isInt().withMessage('Invalid owner')], check, async (req, res, next) => {
  try {
    const { name, email, address, ownerId } = req.body;
    if (ownerId) {
      const o = await pool.query(`SELECT 1 FROM users WHERE id=$1 AND role='STORE_OWNER'`, [ownerId]);
      if (!o.rowCount) return res.status(400).json({ message: 'Selected owner is not a store owner' });
    }
    const { rows } = await pool.query(
      `INSERT INTO stores (name,email,address,owner_id) VALUES ($1,$2,$3,$4) RETURNING *`,
      [name, email, address, ownerId || null]);
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
});

module.exports = router;
