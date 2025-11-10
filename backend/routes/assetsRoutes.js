// backend/routes/assetsRoutes.js
const express = require('express');
const { searchAssets, getAssetBySymbol } = require('../controllers/assetsController');
const router = express.Router();

router.get('/', searchAssets);            // GET /api/v1/assets?q=BTC
router.get('/:symbol', getAssetBySymbol); // GET /api/v1/assets/BTCUSDT

module.exports = router;
