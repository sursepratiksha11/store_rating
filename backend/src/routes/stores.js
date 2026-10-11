const router = require('express').Router();
const { body } = require('express-validator');
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const { check } = require('../middleware/validate');

router.use(authenticate, authorize('NORMAL_USER'));

const SORT = { name: 's.name', address: 's.address', rating: 'overall_rating', mine: 'my_rating' };
const val = (v) => (v && String(v).trim() ? String(v).trim() : null);

router.get('/', async (req, res, next) => {
  try {
    const { name, address, sort, order } = req.query;
    const dir = String(order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    const { rows } = await pool.query(
      `SELECT s.id,s.name,s.address,
         COALESCE(ROUND(AVG(r.rating),1),0) AS overall_rating,
         COUNT(r.id)::int AS total_ratings,
         (SELECT rating FROM ratings WHERE store_id=s.id AND user_id=$1) AS my_rating
       FROM stores s LEFT JOIN ratings r ON r.store_id=s.id
       WHERE ($2::text IS NULL OR s.name    ILIKE '%'||$2||'%')
         AND ($3::text IS NULL OR s.address ILIKE '%'||$3||'%')
       GROUP BY s.id
       ORDER BY ${SORT[sort] || SORT.name} ${dir} NULLS LAST`,
      [req.user.id, val(name), val(address)]);
    res.json(rows);
  } catch (e) { next(e); }
});

// submit OR modify (upsert on unique(user_id, store_id))
router.put('/:id/rating', [body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')], check, async (req, res, next) => {
  try {
    const store = await pool.query('SELECT 1 FROM stores WHERE id=$1', [req.params.id]);
    if (!store.rowCount) return res.status(404).json({ message: 'Store not found' });
    await pool.query(
      `INSERT INTO ratings (user_id,store_id,rating) VALUES ($1,$2,$3)
       ON CONFLICT (user_id,store_id) DO UPDATE SET rating=EXCLUDED.rating, updated_at=NOW()`,
      [req.user.id, req.params.id, req.body.rating]);
    res.json({ message: 'Rating saved' });
  } catch (e) { next(e); }
});

module.exports = router;
