// Test the calculatePriceChange function
const pool = require('./config/pg');
const { calculatePriceChange } = require('./services/calculatePriceChange');

async function testCalculateChange() {
  try {
    const testAssets = [
      { symbol: 'AAPL', type: 'stock' },
      { symbol: 'BTCUSDT', type: 'crypto' },
      { symbol: '^GSPC', type: 'index' },
      { symbol: 'EURUSD=X', type: 'forex' }
    ];
    
    for (const asset of testAssets) {
      console.log(`\n========== ${asset.symbol} (${asset.type}) ==========`);
      
      const { rows } = await pool.query(
        'SELECT id, symbol, asset_type FROM assets WHERE symbol = $1',
        [asset.symbol]
      );
      
      if (rows.length === 0) {
        console.log('❌ Asset not found');
        continue;
      }
      
      const assetId = rows[0].id;
      const result = await calculatePriceChange(assetId, asset.symbol, asset.type);
      
      if (result) {
        console.log(`Current Price: ${result.currentPrice}`);
        console.log(`Previous Price: ${result.previousPrice}`);
        console.log(`Change %: ${result.changePercent.toFixed(2)}%`);
        console.log(`Direction: ${result.positive ? '📈' : '📉'}`);
      } else {
        console.log('❌ No result');
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

testCalculateChange();
