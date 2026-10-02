(() => {
  'use strict';

  const STARTING_BALANCE = 1_000_000;
  const STORAGE_KEY = 'paperlab-account-v1';
  const PREFS_KEY = 'paperlab-preferences-v1';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const sign = (value) => value >= 0 ? '+' : '−';

  const palette = {
    orange: ['#f7931a', '#fff'], blue: ['#4b7bec', '#fff'], purple: ['#7857ff', '#fff'],
    green: ['#20b875', '#fff'], red: ['#e54d5f', '#fff'], yellow: ['#d8a91b', '#111'],
    cyan: ['#1aa6b7', '#fff'], pink: ['#d955a2', '#fff'], slate: ['#39413d', '#e9efeb'],
    white: ['#e9eeeb', '#111'], black: ['#202522', '#fff']
  };

  const A = (id, symbol, name, category, price, precision, volatility, icon, color = 'slate') => ({
    id, symbol, name, category, base: price, price, precision, volatility, icon, color,
    previousClose: price,
    changePct: 0,
    volume: 0
  });

  const ASSETS = [
    A('BTCUSD','BTC/USD','Bitcoin / U.S. Dollar','Crypto',67842.16,2,2.5,'₿','orange'),
    A('ETHUSD','ETH/USD','Ethereum / U.S. Dollar','Crypto',3551.42,2,2.8,'Ξ','purple'),
    A('SOLUSD','SOL/USD','Solana / U.S. Dollar','Crypto',177.84,2,4.1,'S','purple'),
    A('XRPUSD','XRP/USD','XRP / U.S. Dollar','Crypto',0.6248,4,3.3,'X','black'),
    A('BNBUSD','BNB/USD','BNB / U.S. Dollar','Crypto',598.31,2,2.3,'B','yellow'),
    A('DOGEUSD','DOGE/USD','Dogecoin / U.S. Dollar','Crypto',0.1386,4,4.7,'Ð','yellow'),
    A('ADAUSD','ADA/USD','Cardano / U.S. Dollar','Crypto',0.4512,4,3.8,'A','blue'),
    A('AVAXUSD','AVAX/USD','Avalanche / U.S. Dollar','Crypto',37.26,2,4.2,'A','red'),
    A('LINKUSD','LINK/USD','Chainlink / U.S. Dollar','Crypto',14.82,2,3.4,'L','blue'),
    A('DOTUSD','DOT/USD','Polkadot / U.S. Dollar','Crypto',6.81,3,3.5,'D','pink'),
    A('LTCUSD','LTC/USD','Litecoin / U.S. Dollar','Crypto',84.62,2,2.9,'Ł','blue'),
    A('BCHUSD','BCH/USD','Bitcoin Cash / U.S. Dollar','Crypto',447.35,2,3.7,'B','green'),
    A('UNIUSD','UNI/USD','Uniswap / U.S. Dollar','Crypto',10.34,2,4.0,'U','pink'),
    A('NEARUSD','NEAR/USD','NEAR Protocol / U.S. Dollar','Crypto',5.42,3,4.5,'N','black'),
    A('AAVEUSD','AAVE/USD','Aave / U.S. Dollar','Crypto',116.28,2,4.4,'A','purple'),
    A('TONUSD','TON/USD','Toncoin / U.S. Dollar','Crypto',7.31,3,3.6,'T','blue'),

    // High-volatility meme market — entirely simulated for fast practice.
    A('HAWKUSD','HAWK','Hawk Tuah Coin','Memes',0.00012742,8,21.0,'H','yellow'),
    A('TROLLUSD','TROLL','Troll Coin','Memes',0.0000000192,10,24.0,'T','green'),
    A('PEPEUSD','PEPE','Pepe','Memes',0.00001234,8,13.0,'P','green'),
    A('SHIBUSD','SHIB','Shiba Inu','Memes',0.00002458,8,11.5,'S','red'),
    A('WIFUSD','WIF','dogwifhat','Memes',2.418,3,15.0,'W','pink'),
    A('BONKUSD','BONK','Bonk','Memes',0.00003128,8,16.5,'B','orange'),
    A('FLOKIUSD','FLOKI','Floki','Memes',0.000181,6,13.5,'F','orange'),
    A('TRUMPUSD','TRUMP','Official Trump','Memes',19.43,2,17.5,'T','red'),
    A('MOGUSD','MOG','Mog Coin','Memes',0.00000165,8,18.0,'M','purple'),
    A('POPCATUSD','POPCAT','Popcat','Memes',1.224,4,18.5,'P','pink'),
    A('BRETTUSD','BRETT','Brett','Memes',0.1462,4,17.0,'B','blue'),
    A('FARTCOINUSD','FARTCOIN','Fartcoin','Memes',1.081,4,22.0,'F','green'),
    A('TURBOUSD','TURBO','Turbo','Memes',0.006812,6,19.0,'T','yellow'),
    A('PONKEUSD','PONKE','Ponke','Memes',0.3921,4,21.0,'P','orange'),
    A('PNUTUSD','PNUT','Peanut the Squirrel','Memes',0.7324,4,20.0,'P','orange'),
    A('MEWUSD','MEW','cat in a dogs world','Memes',0.008146,6,18.0,'M','white'),
    A('GOATUSD','GOAT','Goatseus Maximus','Memes',0.4812,4,21.0,'G','purple'),
    A('GIGAUSD','GIGA','Gigachad','Memes',0.03241,5,19.5,'G','black'),
    A('CHILLGUYUSD','CHILLGUY','Just a chill guy','Memes',0.1934,4,22.0,'C','blue'),
    A('SPX6900USD','SPX6900','SPX6900','Memes',0.8312,4,20.5,'69','pink'),

    A('AAPL','AAPL','Apple Inc.','Stocks',234.41,2,1.4,'A','black'),
    A('NVDA','NVDA','NVIDIA Corporation','Stocks',142.18,2,2.7,'N','green'),
    A('TSLA','TSLA','Tesla, Inc.','Stocks',248.97,2,3.2,'T','red'),
    A('MSFT','MSFT','Microsoft Corporation','Stocks',428.34,2,1.3,'M','blue'),
    A('AMZN','AMZN','Amazon.com, Inc.','Stocks',212.65,2,1.8,'A','black'),
    A('META','META','Meta Platforms, Inc.','Stocks',582.16,2,1.9,'M','blue'),
    A('GOOGL','GOOGL','Alphabet Inc. Class A','Stocks',185.43,2,1.5,'G','white'),
    A('AMD','AMD','Advanced Micro Devices','Stocks',167.28,2,2.5,'A','black'),
    A('NFLX','NFLX','Netflix, Inc.','Stocks',892.51,2,2.0,'N','red'),
    A('PLTR','PLTR','Palantir Technologies','Stocks',64.87,2,3.1,'P','black'),
    A('COIN','COIN','Coinbase Global','Stocks',267.71,2,3.5,'C','blue'),
    A('MSTR','MSTR','Strategy Inc.','Stocks',341.82,2,4.2,'S','orange'),
    A('JPM','JPM','JPMorgan Chase & Co.','Stocks',246.29,2,1.2,'J','blue'),
    A('BAC','BAC','Bank of America Corp.','Stocks',43.18,2,1.3,'B','red'),
    A('DIS','DIS','The Walt Disney Company','Stocks',113.72,2,1.6,'D','blue'),
    A('NKE','NKE','NIKE, Inc.','Stocks',77.49,2,1.8,'N','black'),
    A('INTC','INTC','Intel Corporation','Stocks',24.86,2,2.0,'I','blue'),
    A('ORCL','ORCL','Oracle Corporation','Stocks',182.56,2,1.6,'O','red'),
    A('CRM','CRM','Salesforce, Inc.','Stocks',329.45,2,1.8,'S','blue'),
    A('UBER','UBER','Uber Technologies','Stocks',72.94,2,2.1,'U','black'),
    A('SHOP','SHOP','Shopify Inc.','Stocks',112.31,2,2.4,'S','green'),
    A('SPY','SPY','SPDR S&P 500 ETF','Stocks',602.57,2,0.8,'S','red'),
    A('QQQ','QQQ','Invesco QQQ Trust','Stocks',525.18,2,1.0,'Q','blue'),
    A('IWM','IWM','iShares Russell 2000 ETF','Stocks',224.71,2,1.1,'I','black'),
    A('BRKB','BRK.B','Berkshire Hathaway Class B','Stocks',472.38,2,0.8,'B','black'),

    A('EURUSD','EUR/USD','Euro / U.S. Dollar','Forex',1.0824,4,0.55,'€','blue'),
    A('GBPUSD','GBP/USD','British Pound / U.S. Dollar','Forex',1.2678,4,0.65,'£','purple'),
    A('USDJPY','USD/JPY','U.S. Dollar / Japanese Yen','Forex',151.84,3,0.62,'¥','red'),
    A('AUDUSD','AUD/USD','Australian Dollar / U.S. Dollar','Forex',0.6584,4,0.7,'A','green'),
    A('USDCAD','USD/CAD','U.S. Dollar / Canadian Dollar','Forex',1.3927,4,0.58,'C','red'),
    A('EURGBP','EUR/GBP','Euro / British Pound','Forex',0.8538,4,0.5,'E','blue'),
    A('USDCHF','USD/CHF','U.S. Dollar / Swiss Franc','Forex',0.8861,4,0.55,'F','red'),
    A('NZDUSD','NZD/USD','New Zealand Dollar / U.S. Dollar','Forex',0.5967,4,0.72,'N','blue'),
    A('EURJPY','EUR/JPY','Euro / Japanese Yen','Forex',164.37,3,0.7,'E','purple'),
    A('GBPJPY','GBP/JPY','British Pound / Japanese Yen','Forex',192.56,3,0.88,'G','black'),

    A('XAUUSD','GOLD','Gold Spot','Commodities',2734.82,2,1.1,'Au','yellow'),
    A('XAGUSD','SILVER','Silver Spot','Commodities',32.48,2,1.8,'Ag','white'),
    A('WTI','WTI','Crude Oil WTI','Commodities',69.72,2,2.1,'O','black'),
    A('BRENT','BRENT','Brent Crude Oil','Commodities',73.84,2,1.9,'B','slate'),
    A('NATGAS','NATGAS','Natural Gas','Commodities',3.217,3,3.6,'NG','blue'),
    A('COPPER','COPPER','High Grade Copper','Commodities',4.183,3,1.7,'Cu','orange'),
    A('PLATINUM','PLAT','Platinum Spot','Commodities',1008.40,2,1.4,'Pt','white'),
    A('CORN','CORN','Corn Futures','Commodities',433.25,2,1.2,'C','yellow'),
    A('COFFEE','COFFEE','Coffee Futures','Commodities',258.72,2,2.3,'Cf','orange'),
    A('WHEAT','WHEAT','Wheat Futures','Commodities',568.50,2,1.5,'W','yellow'),

    A('SPX','S&P 500','S&P 500 Index','Indices',6021.63,2,0.75,'500','blue'),
    A('NDX','NASDAQ 100','NASDAQ 100 Index','Indices',21173.04,2,0.95,'NQ','blue'),
    A('DJI','DOW 30','Dow Jones Industrial Average','Indices',43828.06,2,0.65,'DJ','slate'),
    A('RUT','RUSSELL','Russell 2000 Index','Indices',2241.92,2,1.05,'R','blue'),
    A('FTSE','FTSE 100','FTSE 100 Index','Indices',8294.18,2,0.65,'UK','blue'),
    A('DAX','DAX 40','DAX Performance Index','Indices',20384.61,2,0.8,'DE','black'),
    A('NIKKEI','NIKKEI','Nikkei 225 Index','Indices',39149.43,2,0.9,'JP','red'),
    A('CAC','CAC 40','CAC 40 Index','Indices',7426.88,2,0.72,'FR','blue'),
    A('HSI','HANG SENG','Hang Seng Index','Indices',19689.21,2,1.1,'HK','red'),
    A('VIX','VIX','CBOE Volatility Index','Indices',14.72,2,6.0,'VX','purple')
  ];

  const ASSET_MAP = Object.fromEntries(ASSETS.map(asset => [asset.id, asset]));
  const REAL_SYMBOLS = {
    BRKB: 'BRK-B',
    SPX: '^GSPC', NDX: '^NDX', DJI: '^DJI', RUT: '^RUT',
    FTSE: '^FTSE', DAX: '^GDAXI', NIKKEI: '^N225', CAC: '^FCHI', HSI: '^HSI', VIX: '^VIX'
  };
  const REAL_CATEGORIES = new Set(['Stocks', 'Indices']);
  const providerSymbol = asset => REAL_SYMBOLS[asset.id] || asset.id;
  const isRealAsset = asset => Boolean(asset && REAL_CATEGORIES.has(asset.category));
  const CATEGORY_ORDER = ['All', 'Crypto', 'Memes', 'Stocks', 'Forex', 'Commodities', 'Indices'];
  const DEFAULT_FAVORITES = ['BTCUSD','ETHUSD','HAWKUSD','TROLLUSD','PEPEUSD','NVDA','TSLA','SPY','EURUSD','XAUUSD'];

  const hashString = (text) => {
    let hash = 2166136261;
    for (let i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  };

  const mulberry32 = (seed) => () => {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };

  function loadJSON(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value && typeof value === 'object' ? value : fallback;
    } catch { return fallback; }
  }

  const savedPrefs = loadJSON(PREFS_KEY, {});
  const state = {
    selectedId: savedPrefs.selectedId && ASSET_MAP[savedPrefs.selectedId] ? savedPrefs.selectedId : 'BTCUSD',
    category: 'Favorites',
    timeframe: savedPrefs.timeframe || '1m',
    favorites: Array.isArray(savedPrefs.favorites) ? savedPrefs.favorites.filter(id => ASSET_MAP[id]) : [...DEFAULT_FAVORITES],
    side: 'buy',
    orderType: 'market',
    candles: [],
    chart: {
      visibleCount: 74,
      offset: 0,
      showEMA: savedPrefs.showEMA !== false,
      showVolume: savedPrefs.showVolume === true,
      style: ['candles','hollow','heikin','bars','line','area'].includes(savedPrefs.chartStyle) ? savedPrefs.chartStyle : 'candles',
      theme: ['terminal','ocean','mono'].includes(savedPrefs.chartTheme) ? savedPrefs.chartTheme : 'terminal',
      grid: savedPrefs.chartGrid !== false,
      priceLine: savedPrefs.chartPriceLine !== false,
      tradeLevels: savedPrefs.chartTradeLevels !== false,
      glow: savedPrefs.chartGlow !== false,
      hover: null,
      dragging: false,
      dragX: 0,
      dragOffset: 0,
      tool: 'cursor',
      drawings: [],
      pendingPoint: null,
      rect: null
    },
    searchCategory: 'All',
    searchIndex: 0,
    simSpeed: [1, 5, 20].includes(savedPrefs.simSpeed) ? savedPrefs.simSpeed : 5,
    simulatedNow: Date.now(),
    realChartRequest: 0,
    realFeedLastAt: null,
    traderAlias: typeof savedPrefs.traderAlias === 'string' ? savedPrefs.traderAlias : '',
    leaderSession: savedPrefs.leaderSession || `pl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,9)}`,
    leaderboardPeriod: 'daily',
    leaderboardEntries: [],
    leaderboardGeneratedAt: null,
    sessionStarted: Date.now()
  };

  const emptyAccount = () => ({
    cash: STARTING_BALANCE,
    positions: {},
    orders: [],
    history: [],
    resetAt: Date.now()
  });

  let account = loadJSON(STORAGE_KEY, emptyAccount());
  if (typeof account.cash !== 'number' || !account.positions || !Array.isArray(account.orders) || !Array.isArray(account.history)) {
    account = emptyAccount();
  }

  // Give every market a stable, deterministic opening move.
  ASSETS.forEach(asset => {
    asset.feedStatus = isRealAsset(asset) ? 'connecting' : 'simulated';
    asset.lastRealUpdate = null;
    const rand = mulberry32(hashString(`${asset.id}-day`));
    const dailyMove = (rand() - 0.47) * asset.volatility * 1.35;
    asset.previousClose = asset.base / (1 + dailyMove / 100);
    asset.price = asset.base;
    asset.changePct = dailyMove;
    asset.volume = (25 + rand() * 975) * (asset.category === 'Crypto' ? 1_000_000 : 100_000);
  });

  function selectedAsset() { return ASSET_MAP[state.selectedId]; }
  function priceDecimals(asset = selectedAsset()) { return asset.precision; }
  function fmtNumber(value, decimals = 2) {
    return Number(value).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }
  function fmtPrice(value, asset = selectedAsset(), currency = true) {
    const prefix = currency && !['Forex'].includes(asset.category) ? '$' : '';
    return `${prefix}${fmtNumber(value, asset.precision)}`;
  }
  function fmtMoney(value, signed = false) {
    const abs = Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (!signed) return `${value < 0 ? '−' : ''}$${abs}`;
    return `${value >= 0 ? '+' : '−'}$${abs}`;
  }
  function fmtCompact(value) {
    const abs = Math.abs(value);
    if (abs >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (abs >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (abs >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return fmtNumber(value, 0);
  }
  function fmtQty(value, asset) {
    const d = asset.price < 1 ? 2 : asset.price < 100 ? 3 : 4;
    return Number(value).toLocaleString('en-US', { maximumFractionDigits: d });
  }
  function getColor(asset) { return palette[asset.color] || palette.slate; }
  function savePrefs() {
    localStorage.setItem(PREFS_KEY, JSON.stringify({
      selectedId: state.selectedId,
      timeframe: state.timeframe,
      favorites: state.favorites,
      chartStyle: state.chart.style,
      chartTheme: state.chart.theme,
      chartGrid: state.chart.grid,
      chartPriceLine: state.chart.priceLine,
      chartTradeLevels: state.chart.tradeLevels,
      chartGlow: state.chart.glow,
      showEMA: state.chart.showEMA,
      showVolume: state.chart.showVolume,
      simSpeed: state.simSpeed,
      traderAlias: state.traderAlias,
      leaderSession: state.leaderSession
    }));
  }
  function saveAccount() { localStorage.setItem(STORAGE_KEY, JSON.stringify(account)); }

  function getPosition(id) { return account.positions[id] || null; }
  function positionPnL(position, asset) {
    return position.qty > 0
      ? (asset.price - position.avg) * position.qty
      : (position.avg - asset.price) * Math.abs(position.qty);
  }
  function getAccountStats() {
    let holdingsValue = 0;
    let grossExposure = 0;
    let unrealized = 0;
    Object.entries(account.positions).forEach(([id, position]) => {
      const asset = ASSET_MAP[id];
      if (!asset) return;
      holdingsValue += position.qty * asset.price;
      grossExposure += Math.abs(position.qty * asset.price);
      unrealized += positionPnL(position, asset);
    });
    const equity = account.cash + holdingsValue;
    const buyingPower = Math.max(0, equity * 2 - grossExposure);
    return { holdingsValue, grossExposure, unrealized, equity, buyingPower, totalPnL: equity - STARTING_BALANCE };
  }

  const timeframeMs = { '1m': 60e3, '5m': 300e3, '15m': 900e3, '1h': 3600e3, '4h': 14400e3, '1D': 86400e3, '1W': 604800e3, '1M': 2592e6 };
  const timeframeVol = { '1m': .10, '5m': .16, '15m': .23, '1h': .42, '4h': .65, '1D': 1.0, '1W': 1.65, '1M': 2.5 };
  const realChartConfig = {
    '1m': { interval: '1m', range: '1d' },
    '5m': { interval: '5m', range: '5d' },
    '15m': { interval: '15m', range: '5d' },
    '1h': { interval: '60m', range: '1mo' },
    '4h': { interval: '60m', range: '3mo', aggregate: 4 },
    '1D': { interval: '1d', range: '6mo' },
    '1W': { interval: '1wk', range: '2y' },
    '1M': { interval: '1mo', range: '5y' }
  };

  function aggregateCandles(candles, size) {
    if (!size || size <= 1) return candles;
    const result = [];
    for (let index = 0; index < candles.length; index += size) {
      const group = candles.slice(index, index + size);
      if (!group.length) continue;
      result.push({
        time: group[0].time,
        open: group[0].open,
        high: Math.max(...group.map(candle => candle.high)),
        low: Math.min(...group.map(candle => candle.low)),
        close: group[group.length - 1].close,
        volume: group.reduce((sum, candle) => sum + (candle.volume || 0), 0)
      });
    }
    return result;
  }

  function applyRealQuote(asset, quote, fetchedAt = Date.now()) {
    if (!asset || !Number.isFinite(quote.price)) return;
    asset.price = quote.price;
    if (Number.isFinite(quote.previousClose) && quote.previousClose > 0) asset.previousClose = quote.previousClose;
    asset.changePct = (asset.price / asset.previousClose - 1) * 100;
    if (Number.isFinite(quote.volume) && quote.volume > 0) asset.volume = quote.volume;
    if (quote.exchange) asset.exchange = quote.exchange;
    asset.feedStatus = 'live';
    asset.lastRealUpdate = quote.marketTime || fetchedAt;
    state.realFeedLastAt = fetchedAt;
  }

  async function syncRealQuotes() {
    const assets = ASSETS.filter(isRealAsset);
    const symbols = assets.map(providerSymbol);
    try {
      const response = await fetch(`/api/market/quotes?symbols=${encodeURIComponent(symbols.join(','))}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const bySymbol = new Map(assets.map(asset => [providerSymbol(asset).toUpperCase(), asset]));
      (data.quotes || []).forEach(quote => applyRealQuote(bySymbol.get(String(quote.symbol).toUpperCase()), quote, data.fetchedAt));

      const active = selectedAsset();
      if (isRealAsset(active)) {
        const last = state.candles[state.candles.length - 1];
        if (last && active.feedStatus === 'live') {
          last.close = active.price;
          last.high = Math.max(last.high, active.price);
          last.low = Math.min(last.low, active.price);
        }
        updateInstrumentHeader();
        renderChart();
      }
      updateAccountUI();
      renderWatchlist();
      renderTickerTape();
    } catch (error) {
      assets.forEach(asset => { if (asset.feedStatus !== 'live') asset.feedStatus = 'error'; });
      updateFeedUI();
      console.warn('Real quote sync failed:', error);
    }
  }

  async function loadRealChart(asset = selectedAsset(), showLoader = true) {
    if (!isRealAsset(asset)) return;
    const requestId = ++state.realChartRequest;
    const timeframe = state.timeframe;
    const config = realChartConfig[timeframe] || realChartConfig['1m'];
    if (showLoader) {
      $('#chart-loading').classList.remove('hidden');
      $('#chart-loading-text').textContent = `Loading real ${asset.symbol} prices…`;
    }
    try {
      const query = new URLSearchParams({ symbol: providerSymbol(asset), interval: config.interval, range: config.range });
      const response = await fetch(`/api/market/chart?${query}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (requestId !== state.realChartRequest || state.selectedId !== asset.id || state.timeframe !== timeframe) return;
      let candles = (data.candles || []).filter(candle => [candle.open, candle.high, candle.low, candle.close].every(Number.isFinite));
      candles = aggregateCandles(candles, config.aggregate);
      if (candles.length < 2) throw new Error('Not enough market data returned');
      state.candles = candles;
      applyRealQuote(asset, data, data.fetchedAt);
      state.chart.offset = 0;
      updateInstrumentHeader();
      updateAccountUI();
      renderWatchlist();
      renderTickerTape();
      renderChart();
    } catch (error) {
      if (requestId === state.realChartRequest) {
        asset.feedStatus = asset.feedStatus === 'live' ? 'live' : 'error';
        if (showLoader) toast('Real data temporarily unavailable', 'Showing the local fallback chart. The app will retry automatically.', 'warning');
        updateFeedUI();
      }
      console.warn('Real chart load failed:', error);
    } finally {
      if (requestId === state.realChartRequest) $('#chart-loading').classList.add('hidden');
    }
  }

  function generateCandles(asset, timeframe) {
    const random = mulberry32(hashString(`${asset.id}-${timeframe}-paperlab`));
    const count = 190;
    const raw = [];
    let price = asset.price * (0.965 + random() * .04);
    const interval = timeframeMs[timeframe];
    const end = Math.floor(state.simulatedNow / interval) * interval;
    const candleVol = (asset.volatility / 100) * timeframeVol[timeframe];
    const trend = (random() - .44) * candleVol * .14;

    for (let i = 0; i < count; i++) {
      const open = price;
      const gaussian = (random() + random() + random() + random() - 2) / 2;
      const move = gaussian * candleVol + trend;
      const close = Math.max(.00001, open * (1 + move));
      const wick = Math.abs((random() + random()) * candleVol * .48);
      const high = Math.max(open, close) * (1 + wick);
      const low = Math.min(open, close) * (1 - wick * (.7 + random() * .45));
      const volume = asset.volume / 300 * (.35 + random() * 1.7) * (1 + Math.abs(move) * 20);
      raw.push({ time: end - (count - 1 - i) * interval, open, high, low, close, volume });
      price = close;
    }

    const scale = asset.price / raw[raw.length - 1].close;
    return raw.map(c => ({
      ...c,
      open: c.open * scale,
      high: c.high * scale,
      low: c.low * scale,
      close: c.close * scale
    }));
  }

  function computeEMA(candles, period = 20) {
    const k = 2 / (period + 1);
    const values = [];
    let ema = candles[0]?.close || 0;
    candles.forEach(candle => {
      ema = candle.close * k + ema * (1 - k);
      values.push(ema);
    });
    return values;
  }

  function computeHeikinAshi(candles) {
    const result = [];
    candles.forEach((candle, index) => {
      const close = (candle.open + candle.high + candle.low + candle.close) / 4;
      const open = index === 0
        ? (candle.open + candle.close) / 2
        : (result[index - 1].open + result[index - 1].close) / 2;
      result.push({
        ...candle,
        open,
        close,
        high: Math.max(candle.high, open, close),
        low: Math.min(candle.low, open, close)
      });
    });
    return result;
  }

  const chartThemes = {
    terminal: {
      up: '#3fdd8d', down: '#ff5f6d', line: '#c8f53b',
      areaTop: 'rgba(200,245,59,.24)', areaBottom: 'rgba(200,245,59,0)',
      grid: '#1a1f1c', verticalGrid: '#161b18', label: '#56605a', price: '#c8f53b', priceText: '#0a0c0b'
    },
    ocean: {
      up: '#37c9f0', down: '#a582ff', line: '#52d6ff',
      areaTop: 'rgba(55,201,240,.25)', areaBottom: 'rgba(55,201,240,0)',
      grid: '#172229', verticalGrid: '#141e23', label: '#5c7079', price: '#52d6ff', priceText: '#071014'
    },
    mono: {
      up: '#e3e8e5', down: '#7e8983', line: '#e3e8e5',
      areaTop: 'rgba(227,232,229,.20)', areaBottom: 'rgba(227,232,229,0)',
      grid: '#202522', verticalGrid: '#1a1e1c', label: '#69736d', price: '#e3e8e5', priceText: '#101310'
    }
  };

  const chartStyleMeta = {
    candles: { label: 'Candles', icon: '<path d="M6 4v16M3 8h6M12 3v15M9 6h6M18 8v13M15 12h6"></path>' },
    hollow: { label: 'Hollow', icon: '<path d="M6 4v16M3 8h6v7H3V8M12 3v15M9 6h6v8H9V6M18 8v13M15 12h6v6h-6v-6"></path>' },
    heikin: { label: 'Heikin-Ashi', icon: '<path d="M5 5v15M2 9h6v7H2V9M12 3v17M9 6h6v10H9V6M19 6v15M16 10h6v8h-6v-8"></path>' },
    bars: { label: 'OHLC bars', icon: '<path d="M6 4v16M3 9h3M6 15h3M13 3v16M10 7h3M13 14h3M20 7v14M17 11h3M20 17h3"></path>' },
    line: { label: 'Line', icon: '<path d="m3 17 5-6 4 3 5-8 4 4"></path>' },
    area: { label: 'Area', icon: '<path d="m3 17 5-6 4 3 5-8 4 4v9H3z"></path>' }
  };

  function formatCandleTime(timestamp) {
    const date = new Date(timestamp);
    if (['1D', '1W', '1M'].includes(state.timeframe)) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  function updateSelectedCandle() {
    const asset = selectedAsset();
    if (isRealAsset(asset) || !state.candles.length) return;
    const interval = timeframeMs[state.timeframe];
    const bucket = Math.floor(state.simulatedNow / interval) * interval;
    let last = state.candles[state.candles.length - 1];
    if (bucket > last.time) {
      last = { time: bucket, open: last.close, high: asset.price, low: asset.price, close: asset.price, volume: 0 };
      state.candles.push(last);
      if (state.candles.length > 240) state.candles.shift();
    }
    last.close = asset.price;
    last.high = Math.max(last.high, asset.price);
    last.low = Math.min(last.low, asset.price);
    last.volume += asset.volume / 20000 * Math.random();
  }

  function updateFeedUI() {
    const asset = selectedAsset();
    const real = isRealAsset(asset);
    const speedControl = $('#sim-speed-control');
    const realBadge = $('#real-feed-badge');
    speedControl.classList.toggle('hidden', real);
    realBadge.classList.toggle('hidden', !real);

    if (real) {
      const status = asset.feedStatus || 'connecting';
      realBadge.classList.toggle('connecting', status === 'connecting');
      realBadge.classList.toggle('error', status === 'error');
      $('#real-feed-label').textContent = status === 'live' ? 'REAL MARKET DATA' : status === 'error' ? 'FEED RETRYING' : 'CONNECTING';
      $('#real-feed-age').textContent = status === 'live' ? 'Yahoo · may be delayed' : status === 'error' ? 'fallback active' : 'fetching quotes…';
      $('#market-data-status').innerHTML = `<i></i> ${status === 'live' ? 'Real stock feed' : status === 'error' ? 'Fallback prices' : 'Connecting'}`;
      $('#market-data-status').classList.toggle('feed-error', status === 'error');
      $('#market-data-disclaimer').textContent = status === 'live'
        ? 'Actual market quotes via Yahoo Finance; exchange delays may apply.'
        : 'Waiting for the real market feed; local fallback prices are shown temporarily.';
    } else {
      $('#market-data-status').innerHTML = '<i></i> Simulated 24/7';
      $('#market-data-status').classList.remove('feed-error');
      $('#market-data-disclaimer').textContent = 'Accelerated fictional prices for practice — not live market data.';
    }
  }

  function updateInstrumentHeader() {
    const asset = selectedAsset();
    const [bg, color] = getColor(asset);
    const badge = $('#instrument-badge');
    badge.textContent = asset.icon;
    badge.style.background = bg;
    badge.style.color = color;
    $('#instrument-symbol').textContent = asset.symbol;
    $('#instrument-name').textContent = asset.name;
    $('#ticket-symbol').textContent = asset.symbol;
    if (isRealAsset(asset)) {
      $('#market-pill').textContent = asset.feedStatus === 'live' ? 'REAL · MAY BE DELAYED' : asset.feedStatus === 'error' ? 'REAL FEED · RETRYING' : 'REAL FEED · CONNECTING';
    } else {
      $('#market-pill').textContent = ['Crypto','Memes'].includes(asset.category) ? `${asset.category.toUpperCase()} · 24/7 SIM` : `${asset.category.toUpperCase()} · SIM`;
    }
    $('#quantity-unit').textContent = asset.symbol.split('/')[0].replace(/[^A-Z0-9.]/g, '');

    const currentPrice = $('#current-price');
    currentPrice.textContent = fmtPrice(asset.price, asset);
    const changeValue = asset.price - asset.previousClose;
    const changeEl = $('#current-change');
    changeEl.textContent = `${changeValue >= 0 ? '+' : '−'}${fmtPrice(Math.abs(changeValue), asset)}   ${changeValue >= 0 ? '+' : '−'}${Math.abs(asset.changePct).toFixed(2)}%`;
    changeEl.className = changeValue >= 0 ? 'positive' : 'negative';

    const visible = state.candles.slice(-Math.max(50, state.chart.visibleCount));
    const high = Math.max(...visible.map(c => c.high));
    const low = Math.min(...visible.map(c => c.low));
    $('#stat-high').textContent = fmtPrice(high, asset);
    $('#stat-low').textContent = fmtPrice(low, asset);
    $('#stat-volume').textContent = fmtCompact(asset.volume);
    updateQuoteFooter();
    updateFeedUI();
  }

  function updateQuoteFooter() {
    const asset = selectedAsset();
    const spreadRate = asset.category === 'Forex' ? .00004 : asset.category === 'Crypto' ? .00006 : .00008;
    const spread = Math.max(Math.pow(10, -asset.precision), asset.price * spreadRate);
    $('#bid-price').textContent = fmtPrice(asset.price - spread / 2, asset);
    $('#ask-price').textContent = fmtPrice(asset.price + spread / 2, asset);
    $('#spread-price').textContent = fmtPrice(spread, asset);
  }

  function updateAccountUI() {
    const stats = getAccountStats();
    $('#header-equity').textContent = fmtMoney(stats.equity);
    const pnl = $('#header-pnl');
    pnl.textContent = fmtMoney(stats.totalPnL, true);
    pnl.className = stats.totalPnL >= 0 ? 'positive' : 'negative';
    $('#header-buying-power').textContent = fmtMoney(stats.buyingPower);
    $('#reset-current-equity').textContent = fmtMoney(stats.equity);
    updateOrderEstimate();
    updatePositionCard();
    renderTables();
  }

  function renderTickerTape() {
    const tickerIds = ['BTCUSD','HAWKUSD','TROLLUSD','PEPEUSD','WIFUSD','SPY','NVDA','EURUSD','XAUUSD','VIX'];
    const items = [...tickerIds, ...tickerIds].map(id => {
      const asset = ASSET_MAP[id];
      const up = asset.changePct >= 0;
      return `<button class="ticker-item" type="button" data-asset="${id}"><strong>${asset.symbol}</strong><span>${fmtNumber(asset.price, asset.precision)}</span><em class="${up ? 'up' : 'down'}">${up ? '▲' : '▼'} ${Math.abs(asset.changePct).toFixed(2)}%</em></button>`;
    }).join('');
    $('#ticker-tape').innerHTML = `<div class="ticker-track">${items}</div>`;
  }

  function getWatchlistAssets() {
    if (state.category === 'Favorites') return state.favorites.map(id => ASSET_MAP[id]).filter(Boolean);
    if (state.category === 'More') return ASSETS.filter(a => ['Commodities','Indices'].includes(a.category));
    return ASSETS.filter(a => a.category === state.category);
  }

  function assetIconHTML(asset) {
    const [bg, color] = getColor(asset);
    return `<span class="asset-icon" style="--icon-bg:${bg};--icon-color:${color}">${asset.icon}</span>`;
  }

  function renderWatchlist() {
    const assets = getWatchlistAssets();
    $('#asset-count').textContent = ASSETS.length;
    $('#watchlist').innerHTML = assets.map(asset => {
      const up = asset.changePct >= 0;
      return `<button class="watch-row ${asset.id === state.selectedId ? 'active' : ''}" type="button" data-asset="${asset.id}">
        ${assetIconHTML(asset)}
        <span class="asset-copy"><strong>${asset.symbol}${isRealAsset(asset) ? '<em class="real-tag">REAL</em>' : ''}</strong><span>${asset.name}</span></span>
        <span class="asset-quote"><strong>${fmtNumber(asset.price, asset.precision)}</strong><span class="${up ? 'up' : 'down'}">${up ? '+' : '−'}${Math.abs(asset.changePct).toFixed(2)}%</span></span>
      </button>`;
    }).join('') || `<div class="no-results"><strong>Your list is empty</strong><span>Add markets from Browse all.</span></div>`;
  }

  function selectAsset(id) {
    if (!ASSET_MAP[id]) return;
    state.selectedId = id;
    state.realChartRequest += 1;
    state.candles = generateCandles(selectedAsset(), state.timeframe);
    state.chart.offset = 0;
    state.chart.hover = null;
    state.chart.drawings = [];
    state.chart.pendingPoint = null;
    const asset = selectedAsset();
    const starterValue = Math.min(10_000, getAccountStats().buyingPower * .01 || 1000);
    const qtyDecimals = asset.price < 1 ? 0 : asset.price < 100 ? 2 : 4;
    $('#quantity-input').value = Math.max(Math.pow(10, -qtyDecimals), starterValue / asset.price).toFixed(qtyDecimals);
    $('#limit-input').value = asset.price.toFixed(asset.precision);
    savePrefs();
    updateInstrumentHeader();
    renderWatchlist();
    updateAccountUI();
    renderChart();
    closeModal('search-modal');
    $('#watchlist-panel').classList.remove('open');
    if (isRealAsset(asset)) loadRealChart(asset);
  }

  function switchTimeframe(timeframe) {
    if (!timeframeMs[timeframe]) return;
    state.timeframe = timeframe;
    state.candles = generateCandles(selectedAsset(), timeframe);
    state.chart.offset = 0;
    state.chart.drawings = [];
    $$('.timeframe').forEach(btn => btn.classList.toggle('active', btn.dataset.timeframe === timeframe));
    savePrefs();
    updateInstrumentHeader();
    renderChart();
    if (isRealAsset(selectedAsset())) loadRealChart(selectedAsset());
  }

  // Canvas chart
  const canvas = $('#price-chart');
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(rect.width * dpr) || canvas.height !== Math.round(rect.height * dpr)) {
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    renderChart();
  }

  function renderChart() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height || !state.candles.length) return;
    ctx.clearRect(0, 0, width, height);

    const left = 52, right = 64, top = 27;
    const volumeHeight = state.chart.showVolume ? Math.max(40, height * .17) : 0;
    const bottom = 26 + volumeHeight;
    const plotW = Math.max(50, width - left - right);
    const plotH = Math.max(50, height - top - bottom);
    const count = clamp(state.chart.visibleCount, 28, 150);
    const chartSource = state.chart.style === 'heikin' ? computeHeikinAshi(state.candles) : state.candles;
    const theme = chartThemes[state.chart.theme] || chartThemes.terminal;
    const maxOffset = Math.max(0, chartSource.length - count);
    state.chart.offset = clamp(state.chart.offset, 0, maxOffset);
    const end = chartSource.length - state.chart.offset;
    const start = Math.max(0, end - count);
    const visible = chartSource.slice(start, end);
    if (!visible.length) return;

    let minPrice = Math.min(...visible.map(c => c.low));
    let maxPrice = Math.max(...visible.map(c => c.high));
    const rangePad = Math.max((maxPrice - minPrice) * .11, maxPrice * .0004);
    minPrice -= rangePad;
    maxPrice += rangePad;
    const priceRange = maxPrice - minPrice || 1;
    const xStep = plotW / visible.length;
    const xFor = i => left + xStep * i + xStep / 2;
    const yFor = value => top + (maxPrice - value) / priceRange * plotH;
    const priceForY = y => maxPrice - ((y - top) / plotH) * priceRange;
    state.chart.rect = { left, right: left + plotW, top, bottom: top + plotH, plotW, plotH, visible, start, xStep, minPrice, maxPrice, xFor, yFor, priceForY };

    // Grid and labels
    ctx.save();
    ctx.lineWidth = 1;
    ctx.font = '8px SFMono-Regular, Consolas, monospace';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= 5; i++) {
      const y = top + plotH * i / 5;
      if (state.chart.grid) {
        ctx.strokeStyle = theme.grid;
        ctx.setLineDash([2, 4]);
        ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(left + plotW, y); ctx.stroke();
        ctx.setLineDash([]);
      }
      const price = maxPrice - priceRange * i / 5;
      ctx.fillStyle = theme.label;
      ctx.fillText(fmtNumber(price, selectedAsset().precision), left + plotW + 7, y);
    }
    const timeLabelCount = Math.max(3, Math.floor(plotW / 120));
    for (let i = 0; i <= timeLabelCount; i++) {
      const index = Math.min(visible.length - 1, Math.floor(i * (visible.length - 1) / timeLabelCount));
      const x = xFor(index);
      if (state.chart.grid) {
        ctx.strokeStyle = theme.verticalGrid;
        ctx.setLineDash([2, 5]);
        ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, top + plotH); ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.fillStyle = theme.label;
      ctx.textAlign = i === 0 ? 'left' : i === timeLabelCount ? 'right' : 'center';
      ctx.fillText(formatCandleTime(visible[index].time), x, height - 11);
    }
    ctx.restore();

    // Volume
    if (state.chart.showVolume) {
      const maxVol = Math.max(...visible.map(c => c.volume));
      ctx.save();
      ctx.globalAlpha = .2;
      visible.forEach((candle, i) => {
        const h = (candle.volume / maxVol) * (volumeHeight - 12);
        ctx.fillStyle = candle.close >= candle.open ? theme.up : theme.down;
        ctx.fillRect(xFor(i) - Math.max(1, xStep * .3), top + plotH + volumeHeight - h - 4, Math.max(1, xStep * .6), h);
      });
      ctx.restore();
    }

    // Price display — six interchangeable chart styles.
    if (['candles','hollow','heikin'].includes(state.chart.style)) {
      const bodyWidth = clamp(xStep * (state.chart.style === 'heikin' ? .72 : .62), 1, 9);
      visible.forEach((candle, i) => {
        const up = candle.close >= candle.open;
        const color = up ? theme.up : theme.down;
        const x = xFor(i);
        const openY = yFor(candle.open), closeY = yFor(candle.close);
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(1, Math.min(1.25, xStep * .16));
        ctx.beginPath(); ctx.moveTo(x, yFor(candle.high)); ctx.lineTo(x, yFor(candle.low)); ctx.stroke();
        const bodyY = Math.min(openY, closeY);
        const bodyH = Math.max(1, Math.abs(closeY - openY));
        if (state.chart.style === 'hollow' && up && bodyWidth > 2) {
          ctx.fillStyle = '#0a0c0b';
          ctx.fillRect(x - bodyWidth / 2, bodyY, bodyWidth, bodyH);
          ctx.strokeStyle = color;
          ctx.strokeRect(x - bodyWidth / 2, bodyY, bodyWidth, bodyH);
        } else {
          ctx.fillStyle = color;
          ctx.fillRect(x - bodyWidth / 2, bodyY, bodyWidth, bodyH);
        }
      });
    } else if (state.chart.style === 'bars') {
      const tickWidth = clamp(xStep * .32, 2, 5);
      visible.forEach((candle, i) => {
        const up = candle.close >= candle.open;
        const color = up ? theme.up : theme.down;
        const x = xFor(i);
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(1, Math.min(1.35, xStep * .17));
        ctx.beginPath();
        ctx.moveTo(x, yFor(candle.high)); ctx.lineTo(x, yFor(candle.low));
        ctx.moveTo(x - tickWidth, yFor(candle.open)); ctx.lineTo(x, yFor(candle.open));
        ctx.moveTo(x, yFor(candle.close)); ctx.lineTo(x + tickWidth, yFor(candle.close));
        ctx.stroke();
      });
    } else {
      if (state.chart.style === 'area') {
        const gradient = ctx.createLinearGradient(0, top, 0, top + plotH);
        gradient.addColorStop(0, theme.areaTop);
        gradient.addColorStop(1, theme.areaBottom);
        ctx.beginPath();
        visible.forEach((candle, i) => i ? ctx.lineTo(xFor(i), yFor(candle.close)) : ctx.moveTo(xFor(i), yFor(candle.close)));
        ctx.lineTo(xFor(visible.length - 1), top + plotH);
        ctx.lineTo(xFor(0), top + plotH);
        ctx.closePath(); ctx.fillStyle = gradient; ctx.fill();
      }
      ctx.save();
      if (state.chart.glow) { ctx.shadowBlur = 11; ctx.shadowColor = theme.line; }
      ctx.beginPath();
      visible.forEach((candle, i) => i ? ctx.lineTo(xFor(i), yFor(candle.close)) : ctx.moveTo(xFor(i), yFor(candle.close)));
      ctx.strokeStyle = theme.line; ctx.lineWidth = state.chart.style === 'line' ? 1.7 : 1.5; ctx.stroke();
      ctx.restore();
    }

    // EMA
    if (state.chart.showEMA) {
      const ema = computeEMA(chartSource, 20).slice(start, end);
      ctx.beginPath();
      ema.forEach((value, i) => i ? ctx.lineTo(xFor(i), yFor(value)) : ctx.moveTo(xFor(i), yFor(value)));
      ctx.strokeStyle = '#ffad42'; ctx.lineWidth = 1.2; ctx.globalAlpha = .9; ctx.stroke(); ctx.globalAlpha = 1;
    }

    // User drawings
    state.chart.drawings.forEach(drawing => drawUserDrawing(drawing, xFor, yFor, visible));
    if (state.chart.pendingPoint && state.chart.hover && state.chart.tool === 'trend') {
      drawUserDrawing({ type: 'trend', p1: state.chart.pendingPoint, p2: pointFromHover() }, xFor, yFor, visible, true);
    }

    // Position and pending order lines
    if (state.chart.tradeLevels) {
      const position = getPosition(state.selectedId);
      if (position && position.avg >= minPrice && position.avg <= maxPrice) {
        drawPriceLine(position.avg, position.qty > 0 ? theme.up : theme.down, `${position.qty > 0 ? 'LONG' : 'SHORT'} ${fmtNumber(position.avg, selectedAsset().precision)}`, yFor, left, left + plotW);
      }
      account.orders.filter(o => o.assetId === state.selectedId).forEach(order => {
        if (order.limit >= minPrice && order.limit <= maxPrice) drawPriceLine(order.limit, '#6ba5ff', `LIMIT ${fmtNumber(order.limit, selectedAsset().precision)}`, yFor, left, left + plotW, true);
      });
    }

    // Live price line and label
    const liveY = yFor(selectedAsset().price);
    if (state.chart.priceLine) {
      ctx.save(); ctx.strokeStyle = theme.price; ctx.globalAlpha = .5; ctx.setLineDash([3, 4]);
      ctx.beginPath(); ctx.moveTo(left, liveY); ctx.lineTo(left + plotW, liveY); ctx.stroke(); ctx.restore();
    }
    ctx.fillStyle = theme.price;
    const liveLabel = fmtNumber(selectedAsset().price, selectedAsset().precision);
    ctx.fillRect(left + plotW + 3, liveY - 8, right - 5, 16);
    ctx.fillStyle = theme.priceText; ctx.font = '700 8px SFMono-Regular, Consolas, monospace'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(liveLabel, left + plotW + 7, liveY);

    // Crosshair and OHLC
    if (state.chart.hover && state.chart.hover.x >= left && state.chart.hover.x <= left + plotW && state.chart.hover.y >= top && state.chart.hover.y <= top + plotH) {
      const hoverIndex = clamp(Math.floor((state.chart.hover.x - left) / xStep), 0, visible.length - 1);
      const hoverX = xFor(hoverIndex);
      const hoverY = state.chart.hover.y;
      const candle = visible[hoverIndex];
      ctx.save(); ctx.strokeStyle = '#59635d'; ctx.globalAlpha = .7; ctx.setLineDash([3, 4]); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(hoverX, top); ctx.lineTo(hoverX, top + plotH); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(left, hoverY); ctx.lineTo(left + plotW, hoverY); ctx.stroke(); ctx.restore();
      ctx.fillStyle = '#2a312d'; ctx.fillRect(left + plotW + 3, hoverY - 8, right - 5, 16);
      ctx.fillStyle = '#d1d6d2'; ctx.font = '600 8px SFMono-Regular, Consolas, monospace'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
      ctx.fillText(fmtNumber(priceForY(hoverY), selectedAsset().precision), left + plotW + 7, hoverY);
      updateOHLCLegend(candle);
    } else {
      updateOHLCLegend(visible[visible.length - 1]);
    }
  }

  function drawPriceLine(price, color, label, yFor, x1, x2, dashed = false) {
    const y = yFor(price);
    ctx.save(); ctx.strokeStyle = color; ctx.globalAlpha = .65; if (dashed) ctx.setLineDash([5,4]);
    ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.stroke();
    ctx.fillStyle = color; ctx.globalAlpha = .9; ctx.font = '700 7px SFMono-Regular, Consolas, monospace';
    const textW = ctx.measureText(label).width + 10;
    ctx.fillRect(x1 + 5, y - 8, textW, 14);
    ctx.fillStyle = '#0a0c0b'; ctx.textBaseline = 'middle'; ctx.fillText(label, x1 + 10, y - 1);
    ctx.restore();
  }

  function pointFromHover() {
    const rect = state.chart.rect;
    if (!rect || !state.chart.hover) return null;
    const index = clamp(Math.floor((state.chart.hover.x - rect.left) / rect.xStep), 0, rect.visible.length - 1);
    return { time: rect.visible[index].time, price: rect.priceForY(state.chart.hover.y) };
  }

  function drawUserDrawing(drawing, xFor, yFor, visible, preview = false) {
    if (!drawing || !drawing.p1) return;
    const indexForTime = time => {
      let closest = 0, distance = Infinity;
      visible.forEach((c, i) => { const d = Math.abs(c.time - time); if (d < distance) { closest = i; distance = d; } });
      return closest;
    };
    ctx.save(); ctx.strokeStyle = preview ? 'rgba(107,165,255,.55)' : '#6ba5ff'; ctx.lineWidth = 1.2;
    if (drawing.type === 'horizontal') {
      const y = yFor(drawing.p1.price);
      ctx.beginPath(); ctx.moveTo(state.chart.rect.left, y); ctx.lineTo(state.chart.rect.right, y); ctx.stroke();
    } else if (drawing.type === 'trend' && drawing.p2) {
      const x1 = xFor(indexForTime(drawing.p1.time)), y1 = yFor(drawing.p1.price);
      const x2 = xFor(indexForTime(drawing.p2.time)), y2 = yFor(drawing.p2.price);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      ctx.fillStyle = '#6ba5ff'; ctx.beginPath(); ctx.arc(x1, y1, 2.3, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(x2, y2, 2.3, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }

  function updateOHLCLegend(candle) {
    if (!candle) return;
    const asset = selectedAsset();
    $('#ohlc-o').textContent = fmtNumber(candle.open, asset.precision);
    $('#ohlc-h').textContent = fmtNumber(candle.high, asset.precision);
    $('#ohlc-l').textContent = fmtNumber(candle.low, asset.precision);
    $('#ohlc-c').textContent = fmtNumber(candle.close, asset.precision);
    $('#ohlc-v').textContent = fmtCompact(candle.volume);
  }

  // Trading engine
  function availableIncrease(assetId, side, quantity, price) {
    const oldQty = getPosition(assetId)?.qty || 0;
    const delta = side === 'buy' ? quantity : -quantity;
    if (!oldQty || Math.sign(oldQty) === Math.sign(delta)) return quantity * price;
    return Math.max(0, Math.abs(delta) - Math.abs(oldQty)) * price;
  }

  function executeTrade(assetId, side, quantity, price, source = 'Market') {
    const asset = ASSET_MAP[assetId];
    quantity = Number(quantity);
    if (!asset || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(price) || price <= 0) {
      toast('Invalid order', 'Enter a quantity greater than zero.', 'error');
      return false;
    }
    const stats = getAccountStats();
    const increase = availableIncrease(assetId, side, quantity, price);
    if (increase > stats.buyingPower + .01) {
      toast('Not enough buying power', `Reduce the order below ${fmtMoney(stats.buyingPower)}.`, 'error');
      return false;
    }

    const delta = side === 'buy' ? quantity : -quantity;
    const existing = getPosition(assetId);
    const oldQty = existing?.qty || 0;
    const oldAvg = existing?.avg || price;
    const newQty = oldQty + delta;
    let realized = 0;
    let newAvg = price;

    if (oldQty && Math.sign(oldQty) !== Math.sign(delta)) {
      const closed = Math.min(Math.abs(oldQty), Math.abs(delta));
      realized = oldQty > 0 ? (price - oldAvg) * closed : (oldAvg - price) * closed;
    }

    if (!oldQty || Math.sign(oldQty) === Math.sign(delta)) {
      newAvg = (Math.abs(oldQty) * oldAvg + Math.abs(delta) * price) / Math.max(.0000001, Math.abs(newQty));
    } else if (newQty && Math.sign(newQty) === Math.sign(oldQty)) {
      newAvg = oldAvg;
    } else {
      newAvg = price;
    }

    account.cash -= delta * price;
    if (Math.abs(newQty) < 1e-9) delete account.positions[assetId];
    else account.positions[assetId] = { qty: newQty, avg: newAvg, openedAt: existing?.openedAt || Date.now() };

    account.history.unshift({
      id: `t-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
      time: Date.now(), assetId, side, qty: quantity, price, source, realized
    });
    account.history = account.history.slice(0, 300);
    saveAccount();
    updateAccountUI();
    renderChart();
    scheduleLeaderboardSync();
    toast(`${side === 'buy' ? 'Bought' : 'Sold'} ${fmtQty(quantity, asset)} ${asset.symbol}`, `${source} fill at ${fmtPrice(price, asset)}${realized ? ` · Realized ${fmtMoney(realized, true)}` : ''}`, 'success');
    return true;
  }

  function placeCurrentOrder() {
    const asset = selectedAsset();
    const quantity = Number($('#quantity-input').value);
    if (!quantity || quantity <= 0) {
      toast('Quantity required', 'Enter how much you want to trade.', 'error');
      $('#quantity-input').focus();
      return;
    }
    if (state.orderType === 'market') {
      const spread = asset.category === 'Forex' ? .00002 : .00004;
      const fill = asset.price * (1 + (state.side === 'buy' ? spread : -spread));
      executeTrade(asset.id, state.side, quantity, fill, 'Market');
    } else {
      const limit = Number($('#limit-input').value);
      if (!limit || limit <= 0) {
        toast('Limit price required', 'Enter a valid trigger price.', 'error');
        return;
      }
      const increase = availableIncrease(asset.id, state.side, quantity, limit);
      if (increase > getAccountStats().buyingPower + .01) {
        toast('Not enough buying power', 'Lower the quantity or choose a closer price.', 'error');
        return;
      }
      const order = { id: `o-${Date.now()}-${Math.random().toString(36).slice(2,5)}`, assetId: asset.id, side: state.side, qty: quantity, limit, created: Date.now() };
      account.orders.unshift(order);
      saveAccount();
      toast('Limit order placed', `${state.side === 'buy' ? 'Buy' : 'Sell'} ${fmtQty(quantity, asset)} at ${fmtPrice(limit, asset)}.`, 'warning');
      processLimitOrders();
      updateAccountUI();
      renderChart();
    }
  }

  function processLimitOrders() {
    if (!account.orders.length) return;
    const fills = [];
    account.orders.forEach(order => {
      const asset = ASSET_MAP[order.assetId];
      if (!asset) return;
      const crossed = order.side === 'buy' ? asset.price <= order.limit : asset.price >= order.limit;
      if (crossed) fills.push(order);
    });
    fills.forEach(order => {
      account.orders = account.orders.filter(o => o.id !== order.id);
      executeTrade(order.assetId, order.side, order.qty, order.limit, 'Limit');
    });
    if (fills.length) saveAccount();
  }

  function closePosition(assetId = state.selectedId) {
    const position = getPosition(assetId);
    const asset = ASSET_MAP[assetId];
    if (!position || !asset) return;
    executeTrade(assetId, position.qty > 0 ? 'sell' : 'buy', Math.abs(position.qty), asset.price, 'Close');
  }

  function updateOrderEstimate() {
    const asset = selectedAsset();
    const quantity = Math.max(0, Number($('#quantity-input').value) || 0);
    const price = state.orderType === 'limit' ? (Number($('#limit-input').value) || asset.price) : asset.price;
    const value = quantity * price;
    const after = Math.max(0, getAccountStats().buyingPower - availableIncrease(asset.id, state.side, quantity, price));
    $('#estimate-price').textContent = fmtPrice(price, asset);
    $('#estimate-value').textContent = fmtMoney(value);
    $('#estimate-bp').textContent = fmtMoney(after);
    const label = state.side === 'buy' ? 'Buy' : 'Sell';
    $('#place-order-label').textContent = `${label} ${asset.symbol.split('/')[0]}`;
    $('#place-order').querySelector('small').textContent = state.orderType.toUpperCase();
  }

  function updatePositionCard() {
    const asset = selectedAsset();
    const position = getPosition(asset.id);
    const flat = $('#flat-state');
    const details = $('#position-details');
    const status = $('#position-status');
    if (!position) {
      flat.classList.remove('hidden'); details.classList.add('hidden');
      status.textContent = 'FLAT'; status.className = 'flat-chip';
      return;
    }
    flat.classList.add('hidden'); details.classList.remove('hidden');
    status.textContent = position.qty > 0 ? 'LONG' : 'SHORT';
    status.className = `flat-chip ${position.qty > 0 ? 'long' : 'short'}`;
    $('#position-size').textContent = `${position.qty > 0 ? '+' : '−'}${fmtQty(Math.abs(position.qty), asset)} ${asset.symbol.split('/')[0]}`;
    const pnl = positionPnL(position, asset);
    const pnlEl = $('#position-unrealized');
    pnlEl.textContent = fmtMoney(pnl, true);
    pnlEl.className = pnl >= 0 ? 'positive' : 'negative';
    $('#position-entry').textContent = fmtPrice(position.avg, asset);
    $('#position-value').textContent = fmtMoney(Math.abs(position.qty * asset.price));
  }

  function emptyPanel(title, copy, icon = 'chart') {
    const svg = icon === 'orders'
      ? '<path d="M6 5h12M6 10h12M6 15h7"></path><path d="m15 18 2 2 4-5"></path>'
      : icon === 'history' ? '<circle cx="12" cy="12" r="8"></circle><path d="M12 7v5l3 2"></path>'
      : '<path d="M4 17 9 12l3 3 7-8"></path><path d="M4 21h16"></path>';
    return `<div class="empty-table"><div><span class="empty-table-icon"><svg viewBox="0 0 24 24">${svg}</svg></span><strong>${title}</strong><p>${copy}</p></div></div>`;
  }

  function renderTables() {
    const positions = Object.entries(account.positions).filter(([id]) => ASSET_MAP[id]);
    $('#position-count').textContent = positions.length;
    $('#order-count').textContent = account.orders.length;

    $('#positions-panel').innerHTML = positions.length ? `<table class="trade-table"><thead><tr><th>SYMBOL</th><th>SIDE</th><th>SIZE</th><th>AVG. ENTRY</th><th>LAST</th><th>MARKET VALUE</th><th>UNREALIZED P&amp;L</th><th></th></tr></thead><tbody>${positions.map(([id,p]) => {
      const asset = ASSET_MAP[id], pnl = positionPnL(p, asset);
      return `<tr><td class="symbol-cell">${asset.symbol}</td><td><span class="side-chip ${p.qty > 0 ? 'buy' : 'sell'}">${p.qty > 0 ? 'LONG' : 'SHORT'}</span></td><td>${fmtQty(Math.abs(p.qty), asset)}</td><td>${fmtPrice(p.avg, asset)}</td><td>${fmtPrice(asset.price, asset)}</td><td>${fmtMoney(Math.abs(p.qty * asset.price))}</td><td class="${pnl >= 0 ? 'positive' : 'negative'}">${fmtMoney(pnl, true)}</td><td><button class="cancel-order" data-close-position="${id}">CLOSE</button></td></tr>`;
    }).join('')}</tbody></table>` : emptyPanel('No open positions', 'Your positions will appear here after your first trade.');

    $('#orders-panel').innerHTML = account.orders.length ? `<table class="trade-table"><thead><tr><th>SYMBOL</th><th>SIDE</th><th>TYPE</th><th>QUANTITY</th><th>LIMIT PRICE</th><th>MARKET PRICE</th><th>PLACED</th><th></th></tr></thead><tbody>${account.orders.map(order => {
      const asset = ASSET_MAP[order.assetId];
      return `<tr><td class="symbol-cell">${asset.symbol}</td><td><span class="side-chip ${order.side}">${order.side.toUpperCase()}</span></td><td>LIMIT</td><td>${fmtQty(order.qty, asset)}</td><td>${fmtPrice(order.limit, asset)}</td><td>${fmtPrice(asset.price, asset)}</td><td>${new Date(order.created).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</td><td><button class="cancel-order" data-cancel-order="${order.id}">CANCEL</button></td></tr>`;
    }).join('')}</tbody></table>` : emptyPanel('No pending orders', 'Limit orders waiting to fill will show up here.', 'orders');

    $('#history-panel').innerHTML = account.history.length ? `<table class="trade-table"><thead><tr><th>TIME</th><th>SYMBOL</th><th>ACTION</th><th>QUANTITY</th><th>FILL PRICE</th><th>ORDER</th><th>VALUE</th><th>REALIZED P&amp;L</th></tr></thead><tbody>${account.history.map(trade => {
      const asset = ASSET_MAP[trade.assetId]; if (!asset) return '';
      return `<tr><td>${new Date(trade.time).toLocaleString([], {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</td><td class="symbol-cell">${asset.symbol}</td><td><span class="side-chip ${trade.side}">${trade.side.toUpperCase()}</span></td><td>${fmtQty(trade.qty, asset)}</td><td>${fmtPrice(trade.price, asset)}</td><td>${trade.source}</td><td>${fmtMoney(trade.qty * trade.price)}</td><td class="${trade.realized >= 0 ? 'positive' : 'negative'}">${trade.realized ? fmtMoney(trade.realized, true) : '—'}</td></tr>`;
    }).join('')}</tbody></table>` : emptyPanel('Nothing here yet', 'Every fill and reset will be recorded here.', 'history');
  }

  function resetAccount() {
    account = emptyAccount();
    saveAccount();
    closeModal('reset-modal');
    updateAccountUI();
    renderChart();
    scheduleLeaderboardSync();
    toast('Account reset to $1,000,000', 'Fresh balance, zero positions. Start again whenever you like.', 'success');
  }

  // Search / market universe
  function openSearch() {
    const modal = $('#search-modal');
    modal.classList.remove('hidden');
    state.searchIndex = 0;
    $('#asset-search-input').value = '';
    renderSearchCategories();
    renderSearchResults();
    setTimeout(() => $('#asset-search-input').focus(), 30);
  }
  function closeModal(id) { $(`#${id}`)?.classList.add('hidden'); }
  function renderSearchCategories() {
    $('#search-categories').innerHTML = CATEGORY_ORDER.map(cat => `<button type="button" data-search-category="${cat}" class="${state.searchCategory === cat ? 'active' : ''}">${cat}</button>`).join('');
  }
  function filteredSearchAssets() {
    const query = $('#asset-search-input').value.trim().toLowerCase();
    return ASSETS.filter(asset => {
      const catMatch = state.searchCategory === 'All' || asset.category === state.searchCategory;
      const textMatch = !query || `${asset.symbol} ${asset.name} ${asset.category}`.toLowerCase().includes(query);
      return catMatch && textMatch;
    });
  }
  function renderSearchResults() {
    const results = filteredSearchAssets();
    state.searchIndex = clamp(state.searchIndex, 0, Math.max(0, results.length - 1));
    $('#search-result-count').textContent = `${results.length} instrument${results.length === 1 ? '' : 's'}`;
    $('#asset-results').innerHTML = results.length ? results.map((asset, index) => {
      const favorite = state.favorites.includes(asset.id);
      return `<button class="asset-result ${index === state.searchIndex ? 'keyboard-active' : ''}" type="button" data-asset-result="${asset.id}">
        ${assetIconHTML(asset)}
        <span class="result-main"><strong>${asset.symbol}</strong><span>${asset.name}</span></span>
        <span class="result-category">${asset.category}</span>
        <span class="result-price">${fmtPrice(asset.price, asset)}</span>
        <span class="result-change ${asset.changePct >= 0 ? 'positive' : 'negative'}">${asset.changePct >= 0 ? '+' : '−'}${Math.abs(asset.changePct).toFixed(2)}%</span>
        <span class="favorite-toggle ${favorite ? 'active' : ''}" role="button" data-favorite="${asset.id}" aria-label="${favorite ? 'Remove from' : 'Add to'} favorites">${favorite ? '★' : '☆'}</span>
      </button>`;
    }).join('') : `<div class="no-results"><strong>No instruments found</strong><span>Try a symbol like BTC, AAPL, EUR or GOLD.</span></div>`;
  }
  function toggleFavorite(id) {
    if (state.favorites.includes(id)) state.favorites = state.favorites.filter(item => item !== id);
    else state.favorites.push(id);
    savePrefs(); renderSearchResults(); renderWatchlist();
  }

  function exportTrades() {
    if (!account.history.length) {
      toast('No trades to export', 'Place a trade first, then export your activity as CSV.', 'warning');
      return;
    }
    const rows = [['Time','Symbol','Side','Quantity','Price','Order Type','Value','Realized P&L']];
    account.history.slice().reverse().forEach(trade => {
      const asset = ASSET_MAP[trade.assetId];
      if (!asset) return;
      rows.push([new Date(trade.time).toISOString(),asset.symbol,trade.side,trade.qty,trade.price,trade.source,trade.qty*trade.price,trade.realized || 0]);
    });
    const csv = rows.map(row => row.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = `paperlab-trades-${new Date().toISOString().slice(0,10)}.csv`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Trade log exported', 'Your CSV download is ready.', 'success');
  }

  function toast(title, message, type = 'success') {
    const region = $('#toast-region');
    const node = document.createElement('div');
    node.className = `toast ${type}`;
    node.innerHTML = `<span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '!' : 'i'}</span><div><strong>${title}</strong><span>${message}</span></div>`;
    region.appendChild(node);
    setTimeout(() => { node.classList.add('leaving'); setTimeout(() => node.remove(), 260); }, 3500);
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[char]);
  }

  function traderInitials(alias) {
    const parts = String(alias || '?').trim().split(/\s+/).filter(Boolean);
    return (parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0]?.slice(0, 2) || '?').toUpperCase();
  }

  function traderColor(alias) {
    const colors = ['#c8f53b','#ffad42','#6ba5ff','#a582ff','#3fdd8d','#ff7a9d','#61d8d1','#e4e9e6'];
    return colors[hashString(String(alias || '?')) % colors.length];
  }

  function getPerformanceMetrics() {
    const stats = getAccountStats();
    const closedTrades = account.history.filter(trade => Math.abs(Number(trade.realized) || 0) > .000001);
    const wins = closedTrades.filter(trade => trade.realized > 0).length;
    return {
      equity: stats.equity,
      pnl: stats.totalPnL,
      returnPct: (stats.totalPnL / STARTING_BALANCE) * 100,
      trades: account.history.length,
      winRate: closedTrades.length ? wins / closedTrades.length * 100 : 0
    };
  }

  function leaderboardPayload() {
    return { sessionId: state.leaderSession, alias: state.traderAlias, ...getPerformanceMetrics() };
  }

  function relativeTime(timestamp) {
    const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  function renderLeaderboard() {
    const entries = state.leaderboardEntries || [];
    const metrics = getPerformanceMetrics();
    const ownEntry = entries.find(entry => entry.sessionId === state.leaderSession);
    $('#trader-alias').value = state.traderAlias;
    $('#join-leaderboard').textContent = state.traderAlias ? 'Update score' : 'Join board';
    $('#player-avatar').textContent = traderInitials(state.traderAlias);
    $('#player-avatar').style.setProperty('--avatar', traderColor(state.traderAlias));
    $('#player-rank').textContent = ownEntry ? `#${ownEntry.rank}` : '—';
    const returnEl = $('#player-return');
    returnEl.textContent = `${metrics.returnPct >= 0 ? '+' : '−'}${Math.abs(metrics.returnPct).toFixed(2)}%`;
    returnEl.className = metrics.returnPct >= 0 ? 'positive' : 'negative';
    $('#player-winrate').textContent = `${metrics.winRate.toFixed(0)}%`;
    $('#leaderboard-updated').textContent = state.leaderboardGeneratedAt ? `Updated ${relativeTime(state.leaderboardGeneratedAt)}` : 'Updating…';

    const podiumEntries = entries.slice(0, 3);
    const podiumOrder = [podiumEntries[1], podiumEntries[0], podiumEntries[2]];
    $('#leaderboard-podium').innerHTML = podiumEntries.length >= 3 ? podiumOrder.map(entry => {
      const placeClass = entry.rank === 1 ? 'first' : entry.rank === 2 ? 'second' : 'third';
      return `<article class="podium-card ${placeClass}">
        <span class="podium-rank">${entry.rank === 1 ? '★' : `#${entry.rank}`}</span>
        <span class="podium-avatar" style="--avatar:${traderColor(entry.alias)}">${traderInitials(entry.alias)}</span>
        <strong>${escapeHTML(entry.alias)}</strong>
        <span>${entry.returnPct >= 0 ? '+' : '−'}${Math.abs(entry.returnPct).toFixed(2)}%</span>
        <small>${entry.trades} trades · ${Math.round(entry.winRate)}% win</small>
      </article>`;
    }).join('') : '<div class="leaderboard-loading"><span class="loading-ring"></span>Building today’s podium…</div>';

    $('#leaderboard-table').innerHTML = entries.length ? `<table class="leader-table">
      <thead><tr><th>RANK</th><th>TRADER</th><th>RETURN</th><th>P&amp;L</th><th>EQUITY</th><th>TRADES</th><th>WIN RATE</th></tr></thead>
      <tbody>${entries.map(entry => `<tr class="${entry.sessionId === state.leaderSession ? 'current-player' : ''}">
        <td class="rank-cell ${entry.rank <= 3 ? 'top' : ''}">${entry.rank === 1 ? '★ 1' : `#${entry.rank}`}</td>
        <td class="trader-cell"><div><span class="trader-avatar" style="--avatar:${traderColor(entry.alias)}">${traderInitials(entry.alias)}</span><span class="trader-name"><strong>${escapeHTML(entry.alias)}</strong><span>${entry.sessionId === state.leaderSession ? 'You · ' : entry.bot ? 'Sim rival · ' : ''}${relativeTime(entry.updatedAt)}</span></span></div></td>
        <td class="return-cell ${entry.returnPct >= 0 ? 'positive' : 'negative'}">${entry.returnPct >= 0 ? '+' : '−'}${Math.abs(entry.returnPct).toFixed(2)}%</td>
        <td class="${entry.pnl >= 0 ? 'positive' : 'negative'}">${fmtMoney(entry.pnl, true)}</td>
        <td>${fmtMoney(entry.equity)}</td>
        <td>${entry.trades}</td>
        <td>${Number(entry.winRate).toFixed(0)}%</td>
      </tr>`).join('')}</tbody>
    </table>` : '<div class="leaderboard-loading"><span class="loading-ring"></span>No scores yet.</div>';
  }

  async function loadLeaderboard(period = state.leaderboardPeriod) {
    state.leaderboardPeriod = period;
    $$('#leaderboard-tabs [data-leader-period]').forEach(button => button.classList.toggle('active', button.dataset.leaderPeriod === period));
    $('#leaderboard-updated').textContent = 'Updating…';
    try {
      const response = await fetch(`/api/leaderboard?period=${period}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      state.leaderboardEntries = data.entries || [];
      state.leaderboardGeneratedAt = data.generatedAt || Date.now();
      renderLeaderboard();
    } catch (error) {
      $('#leaderboard-table').innerHTML = '<div class="leaderboard-loading">Leaderboard unavailable. Try refreshing in a moment.</div>';
      $('#leaderboard-updated').textContent = 'Connection failed';
      console.warn('Leaderboard load failed:', error);
    }
  }

  async function submitLeaderboard(silent = false) {
    const input = $('#trader-alias');
    const rawAlias = input.value.trim() || state.traderAlias;
    const alias = rawAlias.replace(/[^A-Za-z0-9 _.-]/g, '').slice(0, 18);
    if (alias.length < 2) {
      if (!silent) { toast('Choose a trader alias', 'Use at least two letters or numbers.', 'error'); input.focus(); }
      return;
    }
    state.traderAlias = alias;
    savePrefs();
    const button = $('#join-leaderboard');
    button.disabled = true;
    button.textContent = 'Syncing…';
    try {
      const response = await fetch(`/api/leaderboard?period=${state.leaderboardPeriod}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leaderboardPayload())
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      state.leaderboardEntries = data.entries || [];
      state.leaderboardGeneratedAt = data.generatedAt || Date.now();
      renderLeaderboard();
      if (!silent) toast('Leaderboard score updated', `${alias} is now ranked on the ${state.leaderboardPeriod === 'all' ? 'all-time' : 'daily'} board.`, 'success');
    } catch (error) {
      if (!silent) toast('Could not update score', 'The leaderboard server will be retried automatically.', 'error');
      console.warn('Leaderboard submit failed:', error);
    } finally {
      button.disabled = false;
      button.textContent = state.traderAlias ? 'Update score' : 'Join board';
    }
  }

  let leaderboardSyncTimer = null;
  function scheduleLeaderboardSync() {
    if (!state.traderAlias) return;
    clearTimeout(leaderboardSyncTimer);
    leaderboardSyncTimer = setTimeout(() => submitLeaderboard(true), 800);
  }

  function openLeaderboard() {
    $('#leaderboard-modal').classList.remove('hidden');
    renderLeaderboard();
    loadLeaderboard(state.leaderboardPeriod);
    setTimeout(() => { if (!state.traderAlias) $('#trader-alias').focus(); }, 50);
  }

  function updateChartControls() {
    const meta = chartStyleMeta[state.chart.style] || chartStyleMeta.candles;
    $('#chart-type-label').textContent = meta.label;
    $('#chart-type-icon').innerHTML = meta.icon;
    $$('.chart-style-option').forEach(button => button.classList.toggle('active', button.dataset.chartStyle === state.chart.style));
    $$('.theme-option').forEach(button => button.classList.toggle('active', button.dataset.chartTheme === state.chart.theme));
    $$('[data-chart-toggle]').forEach(button => {
      const key = button.dataset.chartToggle;
      $('.ui-switch', button).classList.toggle('on', Boolean(state.chart[key]));
    });
    $('#toggle-ema').classList.toggle('active', state.chart.showEMA);
    $('#toggle-volume').classList.toggle('active', state.chart.showVolume);
    $$('[data-sim-speed]').forEach(button => button.classList.toggle('active', Number(button.dataset.simSpeed) === state.simSpeed));
    $('#sidebar-speed').textContent = `${state.simSpeed}× SIM`;
  }

  function closeChartMenus() {
    $('#chart-style-menu').classList.add('hidden');
    $('#chart-settings-menu').classList.add('hidden');
    $('#chart-type').setAttribute('aria-expanded', 'false');
    $('#chart-settings').setAttribute('aria-expanded', 'false');
  }

  function toggleChartMenu(menuId, buttonId) {
    const menu = $(`#${menuId}`);
    const willOpen = menu.classList.contains('hidden');
    closeChartMenus();
    if (willOpen) {
      menu.classList.remove('hidden');
      $(`#${buttonId}`).setAttribute('aria-expanded', 'true');
    }
  }

  function setChartStyle(style) {
    if (!chartStyleMeta[style]) return;
    state.chart.style = style;
    state.chart.hover = null;
    savePrefs();
    updateChartControls();
    closeChartMenus();
    renderChart();
  }

  // Event binding
  $('#open-search').addEventListener('click', openSearch);
  $('#open-leaderboard').addEventListener('click', openLeaderboard);
  $('#sidebar-search').addEventListener('click', openSearch);
  $('#browse-all').addEventListener('click', openSearch);
  $('#instrument-badge').addEventListener('click', openSearch);
  $('#reset-account').addEventListener('click', () => $('#reset-modal').classList.remove('hidden'));
  $('#confirm-reset').addEventListener('click', resetAccount);
  $('#mobile-menu').addEventListener('click', () => $('#watchlist-panel').classList.toggle('open'));
  $('#place-order').addEventListener('click', placeCurrentOrder);
  $('#close-position').addEventListener('click', () => closePosition());
  $('#export-trades').addEventListener('click', exportTrades);
  $('#join-leaderboard').addEventListener('click', () => submitLeaderboard(false));
  $('#refresh-leaderboard').addEventListener('click', () => loadLeaderboard(state.leaderboardPeriod));
  $('#trader-alias').addEventListener('keydown', event => { if (event.key === 'Enter') submitLeaderboard(false); });
  $('#leaderboard-tabs').addEventListener('click', event => {
    const button = event.target.closest('[data-leader-period]');
    if (button) loadLeaderboard(button.dataset.leaderPeriod);
  });

  $$('[data-close]').forEach(button => button.addEventListener('click', () => closeModal(button.dataset.close)));
  $$('.modal-backdrop').forEach(backdrop => backdrop.addEventListener('mousedown', event => { if (event.target === backdrop) closeModal(backdrop.id); }));

  $('#market-tabs').addEventListener('click', event => {
    const tab = event.target.closest('.market-tab'); if (!tab) return;
    state.category = tab.dataset.category;
    $$('.market-tab').forEach(item => item.classList.toggle('active', item === tab));
    renderWatchlist();
  });
  $('#watchlist').addEventListener('click', event => {
    const row = event.target.closest('[data-asset]'); if (row) selectAsset(row.dataset.asset);
  });
  $('#ticker-tape').addEventListener('click', event => {
    const item = event.target.closest('[data-asset]'); if (item) selectAsset(item.dataset.asset);
  });
  $('#timeframes').addEventListener('click', event => {
    const button = event.target.closest('[data-timeframe]'); if (button) switchTimeframe(button.dataset.timeframe);
  });

  $('#side-toggle').addEventListener('click', event => {
    const button = event.target.closest('[data-side]'); if (!button) return;
    state.side = button.dataset.side;
    $$('#side-toggle button').forEach(btn => btn.classList.toggle('active', btn === button));
    $('#place-order').classList.toggle('buy-order', state.side === 'buy');
    $('#place-order').classList.toggle('sell-order', state.side === 'sell');
    updateOrderEstimate();
  });
  $('#order-type-tabs').addEventListener('click', event => {
    const button = event.target.closest('[data-order-type]'); if (!button) return;
    state.orderType = button.dataset.orderType;
    $$('#order-type-tabs button').forEach(btn => btn.classList.toggle('active', btn === button));
    $('#limit-field').classList.toggle('hidden', state.orderType !== 'limit');
    updateOrderEstimate();
  });
  $('#quantity-input').addEventListener('input', updateOrderEstimate);
  $('#limit-input').addEventListener('input', updateOrderEstimate);
  $('#max-quantity').addEventListener('click', () => {
    const asset = selectedAsset();
    const max = (getAccountStats().buyingPower / asset.price) * 0.995;
    $('#quantity-input').value = max.toFixed(asset.price < 10 ? 2 : 4);
    updateOrderEstimate();
  });
  $('#quick-amounts').addEventListener('click', event => {
    const button = event.target.closest('[data-amount]'); if (!button) return;
    const asset = selectedAsset();
    const quantity = Number(button.dataset.amount) / asset.price;
    $('#quantity-input').value = quantity.toFixed(asset.price < 10 ? 2 : 4);
    updateOrderEstimate();
  });

  $('.lower-tabs').addEventListener('click', event => {
    const tab = event.target.closest('[data-panel]'); if (!tab) return;
    $$('.lower-tab').forEach(item => item.classList.toggle('active', item === tab));
    $$('.table-panel').forEach(panel => panel.classList.toggle('active', panel.id === tab.dataset.panel));
  });
  $('.lower-panel').addEventListener('click', event => {
    const closeBtn = event.target.closest('[data-close-position]');
    const cancelBtn = event.target.closest('[data-cancel-order]');
    if (closeBtn) closePosition(closeBtn.dataset.closePosition);
    if (cancelBtn) {
      account.orders = account.orders.filter(order => order.id !== cancelBtn.dataset.cancelOrder);
      saveAccount(); updateAccountUI(); renderChart();
      toast('Order canceled', 'The pending limit order was removed.', 'warning');
    }
  });

  $('#toggle-ema').addEventListener('click', () => {
    state.chart.showEMA = !state.chart.showEMA; savePrefs(); updateChartControls(); renderChart();
  });
  $('#toggle-volume').addEventListener('click', () => {
    state.chart.showVolume = !state.chart.showVolume; savePrefs(); updateChartControls(); renderChart();
  });
  $('#chart-type').addEventListener('click', event => {
    event.stopPropagation(); toggleChartMenu('chart-style-menu', 'chart-type');
  });
  $('#chart-settings').addEventListener('click', event => {
    event.stopPropagation(); toggleChartMenu('chart-settings-menu', 'chart-settings');
  });
  $('#chart-style-menu').addEventListener('click', event => {
    event.stopPropagation();
    const option = event.target.closest('[data-chart-style]');
    if (option) setChartStyle(option.dataset.chartStyle);
  });
  $('#chart-settings-menu').addEventListener('click', event => {
    event.stopPropagation();
    const themeOption = event.target.closest('[data-chart-theme]');
    const toggleOption = event.target.closest('[data-chart-toggle]');
    if (themeOption) state.chart.theme = themeOption.dataset.chartTheme;
    if (toggleOption) {
      const key = toggleOption.dataset.chartToggle;
      state.chart[key] = !state.chart[key];
    }
    if (themeOption || toggleOption) { savePrefs(); updateChartControls(); renderChart(); }
  });
  $('#sim-speed-control').addEventListener('click', event => {
    const button = event.target.closest('[data-sim-speed]');
    if (!button) return;
    state.simSpeed = Number(button.dataset.simSpeed);
    savePrefs(); updateChartControls();
    toast(`Simulation speed: ${state.simSpeed}×`, state.simSpeed === 20 ? 'Chaos mode — expect violent pumps and dumps.' : state.simSpeed === 5 ? 'Fast mode — one chart minute every 12 seconds.' : 'Normal simulated pace.', 'warning');
  });
  $('#fit-chart').addEventListener('click', () => { state.chart.visibleCount = 74; state.chart.offset = 0; closeChartMenus(); renderChart(); });
  document.addEventListener('click', event => {
    if (!event.target.closest('.chart-menu-wrap')) closeChartMenus();
  });
  $('.drawing-tools').addEventListener('click', event => {
    const tool = event.target.closest('[data-tool]');
    if (!tool) return;
    state.chart.tool = tool.dataset.tool; state.chart.pendingPoint = null;
    $$('.draw-tool[data-tool]').forEach(btn => btn.classList.toggle('active', btn === tool));
    canvas.style.cursor = state.chart.tool === 'cursor' ? 'crosshair' : state.chart.tool === 'trend' ? 'crosshair' : 'cell';
  });
  $('#clear-drawings').addEventListener('click', () => { state.chart.drawings = []; state.chart.pendingPoint = null; renderChart(); });

  canvas.addEventListener('mousemove', event => {
    const rect = canvas.getBoundingClientRect();
    state.chart.hover = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    if (state.chart.dragging) {
      const dx = state.chart.hover.x - state.chart.dragX;
      const bars = Math.round(-dx / Math.max(2, state.chart.rect?.xStep || 5));
      state.chart.offset = clamp(state.chart.dragOffset + bars, 0, Math.max(0, state.candles.length - state.chart.visibleCount));
    }
    renderChart();
  });
  canvas.addEventListener('mouseleave', () => { state.chart.hover = null; state.chart.dragging = false; renderChart(); });
  canvas.addEventListener('mousedown', event => {
    if (state.chart.tool === 'cursor') {
      state.chart.dragging = true; state.chart.dragX = event.offsetX; state.chart.dragOffset = state.chart.offset;
    }
  });
  window.addEventListener('mouseup', () => { state.chart.dragging = false; });
  canvas.addEventListener('click', () => {
    if (!['trend','horizontal'].includes(state.chart.tool)) return;
    const point = pointFromHover(); if (!point) return;
    if (state.chart.tool === 'horizontal') state.chart.drawings.push({ type:'horizontal', p1:point });
    else if (!state.chart.pendingPoint) state.chart.pendingPoint = point;
    else { state.chart.drawings.push({ type:'trend', p1:state.chart.pendingPoint, p2:point }); state.chart.pendingPoint = null; }
    renderChart();
  });
  canvas.addEventListener('wheel', event => {
    event.preventDefault();
    const direction = event.deltaY > 0 ? 8 : -8;
    state.chart.visibleCount = clamp(state.chart.visibleCount + direction, 28, 150);
    state.chart.offset = clamp(state.chart.offset, 0, Math.max(0, state.candles.length - state.chart.visibleCount));
    renderChart();
  }, { passive: false });

  $('#search-categories').addEventListener('click', event => {
    const button = event.target.closest('[data-search-category]'); if (!button) return;
    state.searchCategory = button.dataset.searchCategory; state.searchIndex = 0;
    renderSearchCategories(); renderSearchResults();
  });
  $('#asset-search-input').addEventListener('input', () => { state.searchIndex = 0; renderSearchResults(); });
  $('#asset-results').addEventListener('click', event => {
    const favorite = event.target.closest('[data-favorite]');
    if (favorite) { event.stopPropagation(); toggleFavorite(favorite.dataset.favorite); return; }
    const result = event.target.closest('[data-asset-result]'); if (result) selectAsset(result.dataset.assetResult);
  });

  document.addEventListener('keydown', event => {
    const isInput = ['INPUT','TEXTAREA'].includes(document.activeElement?.tagName);
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openSearch(); return; }
    if (!$('#search-modal').classList.contains('hidden')) {
      const results = filteredSearchAssets();
      if (event.key === 'Escape') closeModal('search-modal');
      if (event.key === 'ArrowDown') { event.preventDefault(); state.searchIndex = clamp(state.searchIndex + 1, 0, results.length - 1); renderSearchResults(); $('.keyboard-active')?.scrollIntoView({block:'nearest'}); }
      if (event.key === 'ArrowUp') { event.preventDefault(); state.searchIndex = clamp(state.searchIndex - 1, 0, results.length - 1); renderSearchResults(); $('.keyboard-active')?.scrollIntoView({block:'nearest'}); }
      if (event.key === 'Enter' && results[state.searchIndex]) selectAsset(results[state.searchIndex].id);
      return;
    }
    if (!$('#leaderboard-modal').classList.contains('hidden')) { if (event.key === 'Escape') closeModal('leaderboard-modal'); return; }
    if (!$('#reset-modal').classList.contains('hidden')) { if (event.key === 'Escape') closeModal('reset-modal'); return; }
    if (isInput) return;
    if (event.key.toLowerCase() === 'b') { state.side = 'buy'; $('#side-toggle [data-side="buy"]').click(); placeCurrentOrder(); }
    if (event.key.toLowerCase() === 's') { state.side = 'sell'; $('#side-toggle [data-side="sell"]').click(); placeCurrentOrder(); }
    if (event.key.toLowerCase() === 'f') closePosition();
    if (event.key === 'Escape') { closeChartMenus(); $('#watchlist-panel').classList.remove('open'); }
  });

  // Accelerated fictional market loop. This intentionally does not mirror live markets.
  let lastMarketTick = performance.now();
  let marketTickCount = 0;
  function marketTick() {
    const now = performance.now();
    const elapsed = Math.min(1000, now - lastMarketTick);
    lastMarketTick = now;
    state.simulatedNow += elapsed * state.simSpeed;
    marketTickCount += 1;

    const speedBoost = state.simSpeed === 20 ? 8 : state.simSpeed === 5 ? 3.2 : 1;
    ASSETS.forEach(asset => {
      if (isRealAsset(asset)) return;
      const marketFactor = asset.category === 'Memes' ? .000021 : asset.category === 'Crypto' ? .000026 : .000018;
      const scale = asset.volatility * marketFactor * speedBoost;
      let shock = (Math.random() + Math.random() + Math.random() - 1.5) * scale;

      // Meme coins occasionally launch or rug so the practice market feels fast and game-like.
      if (asset.category === 'Memes') {
        const jumpChance = state.simSpeed === 20 ? .025 : state.simSpeed === 5 ? .012 : .004;
        if (Math.random() < jumpChance) {
          const jumpScale = state.simSpeed === 20 ? 2.5 : state.simSpeed === 5 ? 1.4 : 1;
          const direction = Math.random() < .48 ? -1 : 1;
          shock += direction * (.008 + Math.random() * .025) * jumpScale;
        }
      }

      const reversion = ((asset.base - asset.price) / asset.base) * .00012;
      asset.price = Math.max(Math.pow(10, -asset.precision), asset.price * (1 + shock + reversion));
      asset.changePct = (asset.price / asset.previousClose - 1) * 100;
      asset.volume *= 1 + Math.random() * .0008 * speedBoost;
    });
    updateSelectedCandle();
    processLimitOrders();
    updateInstrumentHeader();
    renderChart();

    // Heavier table and list work stays at 1 Hz while the chart animates at 4 Hz.
    if (marketTickCount % 4 === 0) {
      updateAccountUI();
      renderWatchlist();
      renderTickerTape();
    }
  }

  function updateSessionClock() {
    const elapsed = Math.floor((Date.now() - state.sessionStarted) / 1000);
    const h = String(Math.floor(elapsed / 3600)).padStart(2,'0');
    const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2,'0');
    const s = String(elapsed % 60).padStart(2,'0');
    $('#session-time').textContent = `SESSION ${h}:${m}:${s}`;
  }

  // Initialize
  state.candles = generateCandles(selectedAsset(), state.timeframe);
  $$('.timeframe').forEach(btn => btn.classList.toggle('active', btn.dataset.timeframe === state.timeframe));
  updateChartControls();
  renderTickerTape();
  renderWatchlist();
  renderSearchCategories();
  updateInstrumentHeader();
  updateAccountUI();
  selectAsset(state.selectedId);

  if ('ResizeObserver' in window) new ResizeObserver(resizeCanvas).observe($('#chart-stage'));
  else window.addEventListener('resize', resizeCanvas);
  requestAnimationFrame(resizeCanvas);
  syncRealQuotes();
  setInterval(marketTick, 250);
  setInterval(updateSessionClock, 1000);
  setInterval(syncRealQuotes, 15_000);
  setInterval(() => {
    if (isRealAsset(selectedAsset())) loadRealChart(selectedAsset(), false);
  }, 30_000);
  setInterval(() => {
    if (state.traderAlias) submitLeaderboard(true);
    else if (!$('#leaderboard-modal').classList.contains('hidden')) renderLeaderboard();
  }, 30_000);
})();
