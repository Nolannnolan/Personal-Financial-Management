// Test ticker API after fix
const axios = require('axios');

const BASE_URL = 'http://localhost:8000/api/v1';

async function testTicker(symbol) {
  try {
    console.log(`\n📊 Testing ${symbol}...`);
    const res = await axios.get(`${BASE_URL}/market/ticker?symbol=${symbol}`);
    console.log('✅ Success:');
    console.log(`   Price: $${res.data.price}`);
    console.log(`   Change 24h: ${res.data.change24h >= 0 ? '+' : ''}${res.data.change24h.toFixed(2)}`);
    console.log(`   Change %: ${res.data.changePercent24h >= 0 ? '+' : ''}${res.data.changePercent24h.toFixed(2)}%`);
    console.log(`   Source: ${res.data.source}`);
    return true;
  } catch (err) {
    console.log(`❌ Error: ${err.response?.data?.message || err.message}`);
    return false;
  }
}

async function main() {
  console.log('🧪 Testing Ticker API - Stock vs Crypto\n');
  console.log('='=50);
  
  // Test stocks (should now work with price_ohlcv fallback)
  await testTicker('AAPL');
  await testTicker('GOOGL');
  await testTicker('TSLA');
  
  // Test crypto (should work with price_ticks)
  await testTicker('BTCUSDT');
  await testTicker('ETHUSDT');
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Tests complete!');
}

main().catch(console.error);
