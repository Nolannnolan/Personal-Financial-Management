// backend/services/assetLists.js

module.exports = {
  indices: [
    { symbol: "VNINDEX", name: "VN-Index", exchange: "HOSE", currency: "VND" },
    { symbol: "HNXINDEX", name: "HNX Index", exchange: "HNX", currency: "VND" },
    { symbol: "SPX", name: "S&P 500", exchange: "SPX", currency: "USD" },
    { symbol: "DJI", name: "Dow Jones", exchange: "DJI", currency: "USD" },
    { symbol: "IXIC", name: "NASDAQ", exchange: "NASDAQ", currency: "USD" }
  ],

  forex: [
    { symbol: "USDVND", name: "USD/VND", currency: "VND" },
    { symbol: "EURUSD", name: "EUR/USD", currency: "USD" },
    { symbol: "USDJPY", name: "USD/JPY", currency: "JPY" }
  ],

  commodities: [
    { symbol: "XAUUSD", name: "Gold / USD", currency: "USD" },
    { symbol: "WTIUSD", name: "Crude Oil WTI / USD", currency: "USD" }
  ]
};
