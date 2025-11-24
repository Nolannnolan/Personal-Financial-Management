// Test script for ticker bar API
const pool = require('./config/pg');
const { calculatePriceChange } = require('./services/calculatePriceChange');

async function testTickerAPI() {
  console.log('\n🧪 Testing Ticker Bar API\n');
  console.log('='.repeat(80));
  
  try {
    // 1. Check assets in DB
    console.log('\n📊 Step 1: Checking assets in database...\n');
    const displaySymbols = [
      'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT',
      'AAPL', 'MSFT', 'GOOGL', 'TSLA',
      '^VNINDEX.VN', '^GSPC', '^DJI', '^IXIC',
      'EURUSD=X',
      'GC=F', 'CL=F'
    ];
    
    const { rows: assets } = await pool.query(`
      SELECT id, symbol, name, asset_type, exchange, status
      FROM assets
      WHERE symbol = ANY($1)
      ORDER BY asset_type, symbol
    `, [displaySymbols]);
    
    console.log(`Found ${assets.length}/${displaySymbols.length} assets:\n`);
    assets.forEach(a => {
      const status = a.status === 'OK' ? '✅' : '❌';
      console.log(`  ${status} ${a.asset_type.padEnd(10)} | ${a.symbol.padEnd(15)} | ${a.name}`);
    });
    
    const okAssets = assets.filter(a => a.status === 'OK');
    console.log(`\n${okAssets.length} assets with status = 'OK'`);
    
    // 2. Check price data availability
    console.log('\n📈 Step 2: Checking price data availability...\n');
    
    for (const asset of okAssets) {
      // Check if has price_ticks
      const { rows: ticks } = await pool.query(`
        SELECT COUNT(*) as count, MAX(ts) as latest
        FROM price_ticks
        WHERE asset_id = $1
      `, [asset.id]);
      
      // Check if has price_ohlcv
      const { rows: ohlcv } = await pool.query(`
        SELECT COUNT(*) as count, MAX(ts) as latest
        FROM price_ohlcv
        WHERE asset_id = $1
      `, [asset.id]);
      
      const tickCount = parseInt(ticks[0].count);
      const ohlcvCount = parseInt(ohlcv[0].count);
      const hasData = tickCount > 0 || ohlcvCount > 0;
      
      console.log(`  ${hasData ? '✅' : '❌'} ${asset.symbol.padEnd(15)} | ticks: ${tickCount.toString().padStart(6)}, ohlcv: ${ohlcvCount.toString().padStart(4)}`);
    }
    
    // 3. Test calculatePriceChange for each asset
    console.log('\n💰 Step 3: Testing price change calculations...\n');
    
    for (const asset of okAssets.slice(0, 5)) { // Test first 5 only
      console.log(`\n  Testing: ${asset.symbol} (${asset.asset_type})`);
      console.log('  ' + '-'.repeat(60));
      
      try {
        const priceData = await calculatePriceChange(asset.id, asset.symbol, asset.asset_type);
        
        if (priceData) {
          console.log(`  ✅ Current Price:    $${priceData.currentPrice.toFixed(2)}`);
          console.log(`  ✅ Previous Price:   $${priceData.previousPrice.toFixed(2)}`);
          console.log(`  ✅ Change:           ${priceData.changePercent.toFixed(2)}% ${priceData.positive ? '📈' : '📉'}`);
        } else {
          console.log(`  ❌ No price data available`);
        }
      } catch (err) {
        console.log(`  ❌ Error: ${err.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ Test completed!\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

// Run test
testTickerAPI();
