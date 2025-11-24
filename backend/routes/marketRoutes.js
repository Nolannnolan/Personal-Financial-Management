/**
 * Market Routes - Tickers, Stats, Movers
 */

const express = require('express');
const {
  getTicker,
  getTickersBulk,
  getMarketMovers,
  getMarketStats,
  getTickerDetail
} = require('../controllers/marketController');

const router = express.Router();

// Single ticker with 24h stats
router.get('/ticker', getTicker);

// Detailed ticker with historical performance
router.get('/ticker-detail', getTickerDetail);

// Bulk tickers
router.get('/tickers', getTickersBulk);

// Market movers (gainers, losers, most active)
router.get('/movers', getMarketMovers);

// Overall market statistics
router.get('/stats', getMarketStats);

module.exports = router;
