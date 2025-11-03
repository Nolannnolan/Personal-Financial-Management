const axios = require("axios");
require("dotenv").config();

let cache = { data: null, timestamp: 0 };
const CACHE_DURATION = 60 * 1000; // cache 1 phút

exports.getTickerBar = async (req, res) => {
  try {
    // 1️⃣ Dùng cache để tránh gọi API liên tục
    if (cache.data && Date.now() - cache.timestamp < CACHE_DURATION) {
      return res.json(cache.data);
    }

    // 2️⃣ Lấy giá BTC & ETH từ CoinGecko
    const coingeckoRes = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price",
      {
        params: {
          ids: "bitcoin,ethereum,solana",
          vs_currencies: "usd",
          include_24hr_change: true,
        },
      }
    );

    const btc = coingeckoRes.data.bitcoin;
    const eth = coingeckoRes.data.ethereum;
    const sol = coingeckoRes.data.ethereum;

    // 3️⃣ Yahoo Finance (dùng rapidapi hoặc free public proxy)
    const yahooSymbols = {
        "^VNINDEX.VN": "VNINDEX",
        "TCB.VN": "Techcombank",
        "AAPL": "Apple",
        "MSFT": "Microsoft",
        "GOOGL": "Google",
        "^GSPC": "S&P 500",
        "^DJI": "Dow Jones",
        "^IXIC": "NASDAQ",
    };

    const yahooData = await Promise.all(
      Object.entries(yahooSymbols).map(async ([symbol, name]) => {
        try {
          const resYahoo = await axios.get(
            `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d`
          );

          const result = resYahoo.data.chart.result?.[0];
          const price = result?.meta?.regularMarketPrice;
          const prevClose = result?.meta?.chartPreviousClose;
          const changePercent = ((price - prevClose) / prevClose) * 100;

          return {
            symbol: symbol.replace("^", ""),
            name,
            price: parseFloat(price.toFixed(2)),
            changePercent: parseFloat(changePercent.toFixed(2)),
            positive: changePercent >= 0,
          };
        } catch (err) {
          console.error(`❌ Yahoo Finance fetch failed for ${symbol}:`, err.message);
          return null;
        }
      })
    );

    const validIndexes = yahooData.filter(Boolean);

    // 4️⃣ TwelveData: vàng, dầu, EUR/USD
    const forexSymbols = ["XAU/USD", "WTI/USD", "EUR/USD"];
    const twelveData = await Promise.all(
      forexSymbols.map(async (symbol) => {
        try {
          const res = await axios.get("https://api.twelvedata.com/quote", {
            params: { symbol, apikey: process.env.TWELVE_API_KEY },
          });
          const d = res.data;
          return {
            symbol: symbol.replace("/", ""),
            name: d.name || symbol,
            price: parseFloat(d.close) || 0,
            changePercent: parseFloat(d.percent_change) || 0,
            positive: parseFloat(d.percent_change) >= 0,
          };
        } catch (err) {
          console.error(`❌ TwelveData fetch failed for ${symbol}:`, err.message);
          return null;
        }
      })
    );

    const validForex = twelveData.filter(Boolean);

    // 5️⃣ Gộp tất cả dữ liệu
    const mergedData = [
      ...validIndexes,
      {
        symbol: "BTC",
        name: "Bitcoin",
        price: btc.usd,
        changePercent: btc.usd_24h_change,
        positive: btc.usd_24h_change >= 0,
      },
      {
        symbol: "ETH",
        name: "Ethereum",
        price: eth.usd,
        changePercent: eth.usd_24h_change,
        positive: eth.usd_24h_change >= 0,
      },{
        symbol: "SOL",
        name: "Solana",
        price: sol.usd,
        changePercent: sol.usd_24h_change,
        positive: sol.usd_24h_change >= 0,
      },
      ...validForex,
    ];

    // 6️⃣ Lưu cache
    cache = { data: mergedData, timestamp: Date.now() };

    res.json(mergedData);
  } catch (error) {
    console.error("❌ Error fetching ticker data:", error.message);
    res.status(500).json({ message: "Error fetching real market data" });
  }
};
