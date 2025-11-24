// Test script to check stock price data availability
const pool = require('./config/pg');

async function testStockData() {
  try {
    const testSymbols = ['AAPL', 'MSFT', 'GOOGL', 'TSLA', '^GSPC', '^DJI'];
    
    for (const symbol of testSymbols) {
      console.log(`\n========== ${symbol} ==========`);
      
      // Get asset info
      const { rows: assets } = await pool.query(
        'SELECT id, symbol, asset_type FROM assets WHERE symbol = $1',
        [symbol]
      );
      
      if (assets.length === 0) {
        console.log('❌ Asset not found');
        continue;
      }
      
      const assetId = assets[0].id;
      const assetType = assets[0].asset_type;
      
      console.log(`Asset ID: ${assetId}, Type: ${assetType}`);
      
      // Check latest price_ohlcv data
      const { rows: latest } = await pool.query(`
        SELECT ts, open, high, low, close, volume
        FROM price_ohlcv
        WHERE asset_id = $1
        AND ts >= NOW() - INTERVAL '30 days'
        ORDER BY ts DESC
        LIMIT 5
      `, [assetId]);
      
      console.log(`\nLatest OHLCV data (last 5 days):`);
      latest.forEach(row => {
        console.log(`  ${row.ts.toISOString().split('T')[0]} - Close: ${row.close}`);
      });
      
      // Check for previous close (before today)
      const { rows: prevClose } = await pool.query(`
        SELECT ts, close
        FROM price_ohlcv
        WHERE asset_id = $1
        AND ts >= NOW() - INTERVAL '30 days'
        AND ts < DATE_TRUNC('day', NOW())
        ORDER BY ts DESC
        LIMIT 1
      `, [assetId]);
      
      console.log(`\nPrevious close (before today):`);
      if (prevClose.length > 0) {
        console.log(`  ${prevClose[0].ts.toISOString().split('T')[0]} - Close: ${prevClose[0].close}`);
      } else {
        console.log('  ❌ No previous close found');
      }
      
      // Check today's data
      const { rows: today } = await pool.query(`
        SELECT ts, open, close
        FROM price_ohlcv
        WHERE asset_id = $1
        AND DATE(ts) = DATE(NOW())
        ORDER BY ts DESC
        LIMIT 1
      `, [assetId]);
      
      console.log(`\nToday's data:`);
      if (today.length > 0) {
        console.log(`  ${today[0].ts.toISOString().split('T')[0]} - Open: ${today[0].open}, Close: ${today[0].close}`);
      } else {
        console.log('  ❌ No data for today');
      }
    }
    
    console.log('\n========== Current Date Info ==========');
    const { rows: dateInfo } = await pool.query(`
      SELECT 
        NOW() as current_timestamp,
        DATE(NOW()) as current_date,
        DATE_TRUNC('day', NOW()) as current_day_start,
        NOW() - INTERVAL '30 days' as thirty_days_ago
    `);
    console.log(dateInfo[0]);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

testStockData();
