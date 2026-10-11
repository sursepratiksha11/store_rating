const router = require('express').Router();
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('STORE_OWNER'));

const SORT = { name: 'u.name', email: 'u.email', rating: 'r.rating', date: 'r.updated_at' };

router.get('/dashboard', async (req, res, next) => {
  try {
    const dir = String(req.query.order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    const storeRes = await pool.query(
      `SELECT s.id,s.name,s.address,
              COALESCE(ROUND(AVG(r.rating),1),0) AS average_rating, COUNT(r.id)::int AS total_ratings
       FROM stores s LEFT JOIN ratings r ON r.store_id=s.id
       WHERE s.owner_id=$1 GROUP BY s.id ORDER BY s.id LIMIT 1`, [req.user.id]);
    const store = storeRes.rows[0];
    if (!store) return res.json({ store: null, raters: [] });
    const { rows } = await pool.query(
      `SELECT u.id,u.name,u.email,r.rating,r.updated_at AS date
       FROM ratings r JOIN users u ON u.id=r.user_id
       WHERE r.store_id=$1 ORDER BY ${SORT[req.query.sort] || SORT.date} ${dir}`, [store.id]);
    res.json({ store, raters: rows });
  } catch (e) { next(e); }
});

module.exports = router;
