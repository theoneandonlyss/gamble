'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT) || 4173;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const LEADERBOARD_FILE = path.join(DATA_DIR, 'leaderboard.json');
const CHAT_FILE = path.join(DATA_DIR, 'chat.json');
const chatRateLimits = new Map();
const cache = new Map();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown; charset=utf-8'
};

const allowedIntervals = new Set(['1m', '2m', '5m', '15m', '30m', '60m', '90m', '1d', '5d', '1wk', '1mo', '3mo']);
const allowedRanges = new Set(['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y', 'max']);

function sendJSON(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(JSON.stringify(body));
}

async function cachedJSON(key, ttl, loader) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.time < ttl) return hit.value;
  const value = await loader();
  cache.set(key, { time: Date.now(), value });
  return value;
}

async function yahooJSON(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
      'Accept': 'application/json,text/plain,*/*'
    },
    signal: AbortSignal.timeout(10000)
  });
  if (!response.ok) throw new Error(`Market data source returned ${response.status}`);
  return response.json();
}

async function handleQuotes(url, res) {
  const symbols = [...new Set((url.searchParams.get('symbols') || '')
    .split(',')
    .map(value => value.trim())
    .filter(value => /^[A-Za-z0-9.^=-]{1,20}$/.test(value)))]
    .slice(0, 60);

  if (!symbols.length) return sendJSON(res, 400, { error: 'At least one valid symbol is required.' });
  const key = `quotes:${symbols.sort().join(',')}`;

  try {
    const payload = await cachedJSON(key, 12_000, async () => {
      const endpoint = new URL('https://query1.finance.yahoo.com/v7/finance/spark');
      endpoint.searchParams.set('symbols', symbols.join(','));
      endpoint.searchParams.set('range', '1d');
      endpoint.searchParams.set('interval', '5m');
      endpoint.searchParams.set('includePrePost', 'true');
      const data = await yahooJSON(endpoint);
      const results = data?.spark?.result || [];
      const quotes = results.map(item => {
        const response = item?.response?.[0] || {};
        const meta = response.meta || {};
        const closes = response?.indicators?.quote?.[0]?.close || [];
        const volumes = response?.indicators?.quote?.[0]?.volume || [];
        const lastClose = [...closes].reverse().find(Number.isFinite);
        const volume = volumes.filter(Number.isFinite).reduce((sum, value) => sum + value, 0);
        const price = Number.isFinite(meta.regularMarketPrice) ? meta.regularMarketPrice : lastClose;
        const previousClose = Number.isFinite(meta.chartPreviousClose)
          ? meta.chartPreviousClose
          : Number.isFinite(meta.previousClose) ? meta.previousClose : price;
        return {
          symbol: item.symbol || meta.symbol,
          price,
          previousClose,
          volume,
          marketTime: meta.regularMarketTime ? meta.regularMarketTime * 1000 : null,
          exchange: meta.fullExchangeName || meta.exchangeName || '',
          currency: meta.currency || 'USD'
        };
      }).filter(quote => quote.symbol && Number.isFinite(quote.price));
      return { source: 'Yahoo Finance', fetchedAt: Date.now(), quotes };
    });
    sendJSON(res, 200, payload);
  } catch (error) {
    sendJSON(res, 502, { error: 'Real market data is temporarily unavailable.', detail: error.message });
  }
}

async function handleChart(url, res) {
  const symbol = (url.searchParams.get('symbol') || '').trim();
  const interval = url.searchParams.get('interval') || '1m';
  const range = url.searchParams.get('range') || '1d';
  if (!/^[A-Za-z0-9.^=-]{1,20}$/.test(symbol)) return sendJSON(res, 400, { error: 'Invalid symbol.' });
  if (!allowedIntervals.has(interval) || !allowedRanges.has(range)) return sendJSON(res, 400, { error: 'Invalid chart interval or range.' });

  const key = `chart:${symbol}:${interval}:${range}`;
  try {
    const payload = await cachedJSON(key, interval === '1m' ? 12_000 : 30_000, async () => {
      const endpoint = new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`);
      endpoint.searchParams.set('interval', interval);
      endpoint.searchParams.set('range', range);
      endpoint.searchParams.set('includePrePost', 'true');
      endpoint.searchParams.set('events', 'div,splits');
      const data = await yahooJSON(endpoint);
      const result = data?.chart?.result?.[0];
      if (!result) throw new Error(data?.chart?.error?.description || 'No chart data returned');
      const meta = result.meta || {};
      const timestamps = result.timestamp || [];
      const quote = result?.indicators?.quote?.[0] || {};
      const candles = timestamps.map((timestamp, index) => ({
        time: timestamp * 1000,
        open: quote.open?.[index],
        high: quote.high?.[index],
        low: quote.low?.[index],
        close: quote.close?.[index],
        volume: quote.volume?.[index] || 0
      })).filter(candle => [candle.open, candle.high, candle.low, candle.close].every(Number.isFinite));
      const lastClose = candles.at(-1)?.close;
      const price = Number.isFinite(meta.regularMarketPrice) ? meta.regularMarketPrice : lastClose;
      const previousClose = Number.isFinite(meta.chartPreviousClose)
        ? meta.chartPreviousClose
        : Number.isFinite(meta.previousClose) ? meta.previousClose : price;
      return {
        source: 'Yahoo Finance',
        fetchedAt: Date.now(),
        symbol: meta.symbol || symbol,
        price,
        previousClose,
        marketTime: meta.regularMarketTime ? meta.regularMarketTime * 1000 : null,
        exchange: meta.fullExchangeName || meta.exchangeName || '',
        currency: meta.currency || 'USD',
        dataGranularity: meta.dataGranularity || interval,
        candles
      };
    });
    sendJSON(res, 200, payload);
  } catch (error) {
    sendJSON(res, 502, { error: 'Real chart data is temporarily unavailable.', detail: error.message });
  }
}

function readLeaderboard() {
  try {
    const value = JSON.parse(fs.readFileSync(LEADERBOARD_FILE, 'utf8'));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeLeaderboard(entries) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const temp = `${LEADERBOARD_FILE}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(entries.slice(-500), null, 2));
  fs.renameSync(temp, LEADERBOARD_FILE);
}

function botLeaderboard(period) {
  const daily = [
    ['CircuitCat', 12.84, 128420, 31, 67],
    ['LunaTape', 9.42, 94210, 18, 72],
    ['DeltaWave', 7.13, 71330, 24, 63],
    ['MossBull', 5.88, 58840, 14, 64],
    ['QuietAlpha', 4.21, 42170, 11, 73],
    ['ShortStack', 3.37, 33720, 27, 56],
    ['CandleKid', 2.14, 21480, 9, 67],
    ['NoFomo', 1.05, 10510, 7, 57],
    ['Bagholder', -1.22, -12240, 16, 44],
    ['ExitLiquidity', -4.85, -48520, 22, 36]
  ];
  const allTime = [
    ['CircuitCat', 86.42, 864200, 412, 64],
    ['DeltaWave', 72.18, 721800, 366, 61],
    ['LunaTape', 64.73, 647300, 291, 66],
    ['MossBull', 48.91, 489100, 205, 60],
    ['QuietAlpha', 37.25, 372500, 174, 68],
    ['CandleKid', 29.08, 290800, 188, 58],
    ['ShortStack', 24.62, 246200, 318, 54],
    ['NoFomo', 18.44, 184400, 121, 57],
    ['Bagholder', 7.31, 73100, 243, 48],
    ['ExitLiquidity', -8.12, -81200, 277, 43]
  ];
  const source = period === 'all' ? allTime : daily;
  return source.map((row, index) => ({
    sessionId: `bot-${period}-${index}`,
    alias: row[0],
    returnPct: row[1],
    pnl: row[2],
    equity: 1_000_000 + row[2],
    trades: row[3],
    winRate: row[4],
    updatedAt: Date.now() - (index + 1) * 137000,
    bot: true
  }));
}

function leaderboardResponse(period, stored) {
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const users = stored.filter(entry => period === 'all' || entry.updatedAt >= dayStart.getTime());
  const entries = [...botLeaderboard(period), ...users]
    .sort((a, b) => b.returnPct - a.returnPct || b.pnl - a.pnl)
    .slice(0, 50)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
  return { period, generatedAt: Date.now(), entries };
}

function readRequestBody(req, limit = 32_000) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > limit) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

async function handleLeaderboard(req, url, res) {
  const period = url.searchParams.get('period') === 'all' ? 'all' : 'daily';
  if (req.method === 'GET') {
    return sendJSON(res, 200, leaderboardResponse(period, readLeaderboard()));
  }
  if (req.method !== 'POST') return sendJSON(res, 405, { error: 'Method not allowed.' });

  try {
    const raw = JSON.parse(await readRequestBody(req) || '{}');
    const sessionId = String(raw.sessionId || '').slice(0, 80);
    const alias = String(raw.alias || '').trim().replace(/[^A-Za-z0-9 _.-]/g, '').slice(0, 18);
    if (!/^[A-Za-z0-9-]{4,80}$/.test(sessionId)) return sendJSON(res, 400, { error: 'Invalid session.' });
    if (alias.length < 2) return sendJSON(res, 400, { error: 'Alias must contain at least two characters.' });

    const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
    const now = Date.now();
    const entry = {
      sessionId,
      alias,
      equity: Math.max(0, Math.min(1e12, finite(raw.equity, 1_000_000))),
      returnPct: Math.max(-100, Math.min(10_000, finite(raw.returnPct))),
      pnl: Math.max(-1e9, Math.min(1e12, finite(raw.pnl))),
      trades: Math.max(0, Math.min(1e6, Math.round(finite(raw.trades)))),
      winRate: Math.max(0, Math.min(100, finite(raw.winRate))),
      updatedAt: now,
      bot: false
    };
    const stored = readLeaderboard();
    const existing = stored.find(item => item.sessionId === sessionId);
    entry.createdAt = existing?.createdAt || now;
    const next = stored.filter(item => item.sessionId !== sessionId);
    next.push(entry);
    writeLeaderboard(next);
    sendJSON(res, 200, leaderboardResponse(period, next));
  } catch (error) {
    sendJSON(res, 400, { error: 'Could not update leaderboard.', detail: error.message });
  }
}

function readChat() {
  try {
    const value = JSON.parse(fs.readFileSync(CHAT_FILE, 'utf8'));
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeChat(messages) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const temp = `${CHAT_FILE}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(messages.slice(-300), null, 2));
  fs.renameSync(temp, CHAT_FILE);
}

async function handleChat(req, url, res) {
  if (req.method === 'GET') {
    const messages = readChat().slice(-150);
    return sendJSON(res, 200, { messages, generatedAt: Date.now() });
  }
  if (req.method !== 'POST') return sendJSON(res, 405, { error: 'Method not allowed.' });

  try {
    const raw = JSON.parse(await readRequestBody(req) || '{}');
    const sessionId = String(raw.sessionId || '').slice(0, 80);
    const alias = String(raw.alias || '').trim().replace(/[^A-Za-z0-9 _.-]/g, '').slice(0, 18);
    const text = String(raw.text || '').replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 240);
    if (!/^[A-Za-z0-9-]{4,80}$/.test(sessionId)) return sendJSON(res, 400, { error: 'Invalid chat session.' });
    if (alias.length < 2) return sendJSON(res, 400, { error: 'Choose a name with at least two characters.' });
    if (!text) return sendJSON(res, 400, { error: 'Message cannot be empty.' });

    const rateKey = `${req.socket.remoteAddress || 'unknown'}:${sessionId}`;
    const lastSent = chatRateLimits.get(rateKey) || 0;
    if (Date.now() - lastSent < 1200) return sendJSON(res, 429, { error: 'Please wait a moment before sending again.' });
    chatRateLimits.set(rateKey, Date.now());

    const message = {
      id: `msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      sessionId,
      alias,
      text,
      createdAt: Date.now()
    };
    const messages = readChat();
    messages.push(message);
    writeChat(messages);
    sendJSON(res, 201, { message, messages: messages.slice(-150) });
  } catch (error) {
    sendJSON(res, 400, { error: 'Could not send the message.', detail: error.message });
  }
}

function serveStatic(url, res) {
  let requestPath = decodeURIComponent(url.pathname);
  if (requestPath === '/') requestPath = '/index.html';
  if (requestPath.startsWith('/data/')) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }
  const filePath = path.resolve(ROOT, `.${requestPath}`);
  if (!filePath.startsWith(ROOT + path.sep)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  fs.stat(filePath, (error, stat) => {
    if (error || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname === '/api/market/quotes') return handleQuotes(url, res);
  if (url.pathname === '/api/market/chart') return handleChart(url, res);
  if (url.pathname === '/api/leaderboard') return handleLeaderboard(req, url, res);
  if (url.pathname === '/api/chat') return handleChat(req, url, res);
  serveStatic(url, res);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Paperlab running on http://0.0.0.0:${PORT}`);
  console.log('Real stock feed proxy ready (Yahoo Finance chart data; quotes may be delayed).');
});
