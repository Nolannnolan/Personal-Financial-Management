// backend/controllers/assetsController.js
const pool = require('../config/pg');

exports.searchAssets = async (req, res) => {
  const q = (req.query.q || '').trim().toUpperCase();
  try {
    if (!q) {
      const { rows } = await pool.query('SELECT id, symbol, name, exchange, asset_type FROM assets LIMIT 100');
      return res.json(rows);
    }
    // simple search by symbol prefix or name ILIKE
    const { rows } = await pool.query(
      `SELECT id, symbol, name, exchange, asset_type FROM assets
       WHERE symbol ILIKE $1 OR name ILIKE $2
       ORDER BY symbol LIMIT 200`,
      [`${q}%`, `%${q}%`]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'search failed' });
  }
};

exports.getAssetBySymbol = async (req, res) => {
  const symbol = (req.params.symbol || '').toUpperCase();
  try {
    const { rows } = await pool.query('SELECT * FROM assets WHERE symbol=$1 LIMIT 1', [symbol]);
    if (!rows[0]) return res.status(404).json({ error: 'not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed' });
  }
};
