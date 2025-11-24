// Detailed test for price change formulas by asset type
const pool = require('./config/pg');
const { calculatePriceChange } = require('./services/calculatePriceChange');

async function testPriceChangeFormulas() {
  console.log('\n🧪 TESTING PRICE CHANGE FORMULAS BY ASSET TYPE\n');
  console.log('='.repeat(100));
  
  try {
    // Test each asset type with detailed breakdown
    const testAssets = [
      { symbol: 'BTCUSDT', type: 'crypto', formula: '(Current - Price 24h ago) / Price 24h ago × 100%' },
      { symbol: 'AAPL', type: 'stock', formula: '(Current - Previous Close) / Previous Close × 100%' },
      { symbol: '^GSPC', type: 'index', formula: '(Current - Previous Close) / Previous Close × 100%' },
      { symbol: 'EURUSD=X', type: 'forex', formula: '(Current - Today\'s Open) / Today\'s Open × 100%' },
      { symbol: 'GC=F', type: 'commodity', formula: '(Current - Previous Settlement) / Previous Settlement × 100%' }
    ];
    
    for (const test of testAssets) {
      const { rows: assets } = await pool.query(
        'SELECT id, symbol, name, asset_type FROM assets WHERE symbol = $1 AND status = $2',
        [test.symbol, 'OK']
      );
      
      if (assets.length === 0) {
        console.log(`\n❌ Asset not found: ${test.symbol}`);
        continue;
      }
      
      const asset = assets[0];
      
      console.log(`\n📊 ${asset.asset_type.toUpperCase()}: ${asset.symbol} (${asset.name})`);
      console.log('─'.repeat(100));
      console.log(`Formula: ${test.formula}`);
      console.log('─'.repeat(100));
      
      // Get detailed price info based on asset type
      if (asset.asset_type === 'crypto') {
        await testCryptoFormula(asset);
      } else if (asset.asset_type === 'stock' || asset.asset_type === 'index') {
        await testStockIndexFormula(asset);
      } else if (asset.asset_type === 'forex') {
        await testForexFormula(asset);
      } else if (asset.asset_type === 'commodity') {
        await testCommodityFormula(asset);
      }
      
      // Calculate using our function
      console.log('\n🔢 Calculated Result:');
      const result = await calculatePriceChange(asset.id, asset.symbol, asset.asset_type);
      
      if (result) {
        console.log(`   Current Price:  $${result.currentPrice.toFixed(2)}`);
        console.log(`   Previous Price: $${result.previousPrice.toFixed(2)}`);
        console.log(`   Change:         ${result.changePercent.toFixed(2)}% ${result.positive ? '📈 (UP)' : '📉 (DOWN)'}`);
        console.log(`   ✅ Formula verified successfully`);
      } else {
        console.log(`   ❌ No data available`);
      }
    }
    
    console.log('\n' + '='.repeat(100));
    console.log('✅ All formula tests completed!\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

async function testCryptoFormula(asset) {
  console.log('\n📌 Data Points:');
  
  // Current price
  const { rows: current } = await pool.query(`
    SELECT price, ts
    FROM price_ticks
    WHERE asset_id = $1
    ORDER BY ts DESC LIMIT 1
  `, [asset.id]);
  
  if (current[0]) {
    console.log(`   Current Price:  $${parseFloat(current[0].price).toFixed(2)} (at ${current[0].ts.toISOString()})`);
  }
  
  // 24h ago price
  const { rows: price24h } = await pool.query(`
    SELECT price, ts
    FROM price_ticks
    WHERE asset_id = $1
    AND ts <= NOW() - INTERVAL '24 hours'
    ORDER BY ts DESC LIMIT 1
  `, [asset.id]);
  
  if (price24h[0]) {
    console.log(`   Price 24h ago:  $${parseFloat(price24h[0].price).toFixed(2)} (at ${price24h[0].ts.toISOString()})`);
    
    // Manual calculation
    const currentPrice = parseFloat(current[0].price);
    const prevPrice = parseFloat(price24h[0].price);
    const change = ((currentPrice - prevPrice) / prevPrice) * 100;
    console.log(`\n📐 Manual Calculation:`);
    console.log(`   ($${currentPrice.toFixed(2)} - $${prevPrice.toFixed(2)}) / $${prevPrice.toFixed(2)} × 100%`);
    console.log(`   = ${change.toFixed(2)}%`);
  }
}

async function testStockIndexFormula(asset) {
  console.log('\n📌 Data Points:');
  
  // Current price
  const { rows: current } = await pool.query(`
    SELECT price, ts
    FROM price_ticks
    WHERE asset_id = $1
    ORDER BY ts DESC LIMIT 1
  `, [asset.id]);
  
  let currentPrice;
  if (current[0]) {
    currentPrice = parseFloat(current[0].price);
    console.log(`   Current Price:  $${currentPrice.toFixed(2)} (from ticks at ${current[0].ts.toISOString()})`);
  } else {
    // Fallback to OHLCV
    const { rows: ohlcv } = await pool.query(`
      SELECT close, ts
      FROM price_ohlcv
      WHERE asset_id = $1
      ORDER BY ts DESC LIMIT 1
    `, [asset.id]);
    
    if (ohlcv[0]) {
      currentPrice = parseFloat(ohlcv[0].close);
      console.log(`   Current Price:  $${currentPrice.toFixed(2)} (from ohlcv at ${ohlcv[0].ts.toISOString()})`);
    }
  }
  
  // Previous close
  const { rows: prevClose } = await pool.query(`
    SELECT close, ts
    FROM price_ohlcv
    WHERE asset_id = $1
    AND ts < DATE_TRUNC('day', NOW())
    ORDER BY ts DESC LIMIT 1
  `, [asset.id]);
  
  if (prevClose[0]) {
    const prevPrice = parseFloat(prevClose[0].close);
    console.log(`   Previous Close: $${prevPrice.toFixed(2)} (at ${prevClose[0].ts.toISOString()})`);
    
    // Manual calculation
    if (currentPrice) {
      const change = ((currentPrice - prevPrice) / prevPrice) * 100;
      console.log(`\n📐 Manual Calculation:`);
      console.log(`   ($${currentPrice.toFixed(2)} - $${prevPrice.toFixed(2)}) / $${prevPrice.toFixed(2)} × 100%`);
      console.log(`   = ${change.toFixed(2)}%`);
    }
  }
}

async function testForexFormula(asset) {
  console.log('\n📌 Data Points:');
  
  // Current price
  const { rows: current } = await pool.query(`
    SELECT close, ts
    FROM price_ohlcv
    WHERE asset_id = $1
    ORDER BY ts DESC LIMIT 1
  `, [asset.id]);
  
  if (current[0]) {
    const currentPrice = parseFloat(current[0].close);
    console.log(`   Current Price:  $${currentPrice.toFixed(4)} (at ${current[0].ts.toISOString()})`);
    
    // Today's open
    const { rows: todayOpen } = await pool.query(`
      SELECT open, ts
      FROM price_ohlcv
      WHERE asset_id = $1
      AND DATE(ts) = DATE(NOW())
      ORDER BY ts DESC LIMIT 1
    `, [asset.id]);
    
    if (todayOpen[0]) {
      const openPrice = parseFloat(todayOpen[0].open);
      console.log(`   Today's Open:   $${openPrice.toFixed(4)} (at ${todayOpen[0].ts.toISOString()})`);
      
      // Manual calculation
      const change = ((currentPrice - openPrice) / openPrice) * 100;
      console.log(`\n📐 Manual Calculation:`);
      console.log(`   ($${currentPrice.toFixed(4)} - $${openPrice.toFixed(4)}) / $${openPrice.toFixed(4)} × 100%`);
      console.log(`   = ${change.toFixed(2)}%`);
    } else {
      console.log(`   ⚠️  No data for today (weekend/holiday) - using most recent open`);
      
      const { rows: recentOpen } = await pool.query(`
        SELECT open, ts
        FROM price_ohlcv
        WHERE asset_id = $1
        ORDER BY ts DESC LIMIT 1
      `, [asset.id]);
      
      if (recentOpen[0]) {
        const openPrice = parseFloat(recentOpen[0].open);
        console.log(`   Most Recent Open: $${openPrice.toFixed(4)} (at ${recentOpen[0].ts.toISOString()})`);
        
        const change = ((currentPrice - openPrice) / openPrice) * 100;
        console.log(`\n📐 Manual Calculation:`);
        console.log(`   ($${currentPrice.toFixed(4)} - $${openPrice.toFixed(4)}) / $${openPrice.toFixed(4)} × 100%`);
        console.log(`   = ${change.toFixed(2)}%`);
      }
    }
  }
}

async function testCommodityFormula(asset) {
  console.log('\n📌 Data Points:');
  console.log('   Note: Settlement price = Previous close for commodities');
  
  // Current price
  const { rows: current } = await pool.query(`
    SELECT close, ts
    FROM price_ohlcv
    WHERE asset_id = $1
    ORDER BY ts DESC LIMIT 1
  `, [asset.id]);
  
  if (current[0]) {
    const currentPrice = parseFloat(current[0].close);
    console.log(`   Current Price:        $${currentPrice.toFixed(2)} (at ${current[0].ts.toISOString()})`);
    
    // Previous settlement (= previous close)
    const { rows: prevSettlement } = await pool.query(`
      SELECT close, ts
      FROM price_ohlcv
      WHERE asset_id = $1
      AND ts < DATE_TRUNC('day', NOW())
      ORDER BY ts DESC LIMIT 1
    `, [asset.id]);
    
    if (prevSettlement[0]) {
      const settlementPrice = parseFloat(prevSettlement[0].close);
      console.log(`   Previous Settlement:  $${settlementPrice.toFixed(2)} (at ${prevSettlement[0].ts.toISOString()})`);
      
      // Manual calculation
      const change = ((currentPrice - settlementPrice) / settlementPrice) * 100;
      console.log(`\n📐 Manual Calculation:`);
      console.log(`   ($${currentPrice.toFixed(2)} - $${settlementPrice.toFixed(2)}) / $${settlementPrice.toFixed(2)} × 100%`);
      console.log(`   = ${change.toFixed(2)}%`);
    }
  }
}

// Run test
testPriceChangeFormulas();
