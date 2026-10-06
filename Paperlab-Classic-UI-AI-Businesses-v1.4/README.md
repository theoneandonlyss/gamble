# Paperlab Trading Simulator

A free, no-signup paper-trading game with a $1,000,000 virtual account, real stock prices, accelerated arcade markets, advanced charts, shared chat, leaderboards, and purchasable simulated AI businesses.

## Features

- $1,000,000 starting balance with unlimited free resets
- 91 instruments across stocks, indices, crypto, meme coins, forex, and commodities
- Real stock, ETF, and index quotes with real OHLC chart history through the server-side Yahoo Finance chart feed
- Automatic 15-second stock quote refresh and 30-second selected-chart refresh
- Clear real-feed, connecting, fallback, and delayed-data labels
- Fictional meme market with HAWK, TROLL, PEPE, SHIB, WIF, BONK, FLOKI, FARTCOIN, TURBO, and more
- Accelerated fictional markets at selectable 1×, 5×, or 20× speeds
- Six chart views: filled candles, hollow candles, Heikin-Ashi, OHLC bars, line, and area
- 1m–1M timeframes, EMA, volume, zoom, pan, crosshair, drawing tools, and color presets
- Market and limit orders, long and short positions, and 2× simulated buying power
- Live mark-to-market P&L, portfolio positions, open orders, and activity history
- Daily and all-time leaderboard with alias-only entry, rank, return, P&L, equity, trades, and win rate
- Shared trader chat for everyone using the same game link, with aliases, emoji shortcuts, unread counts, and automatic refresh
- AI Business Lab where each purchase launches a separate persistent instance
- $100,000 AI Momentum Traders that scan trending stocks, buy automatically, and chase a high-risk 1.50× target with a 0.65× stop
- $50,000 AI Dropshipping Stores that simulate products, ads, orders, refunds, viral sales, profit, and loss
- Live business value and P&L integrated into account equity and leaderboard results, with pause, resume, and cash-out controls
- Manual stock and multi-market trading remains available while businesses run
- Local browser persistence and CSV trade export
- Responsive desktop and mobile UI

## Requirements

- Node.js 18 or newer
- Internet access for real stock data

No npm dependencies or API keys are required.

## Start locally

```bash
npm start
```

Open [http://localhost:4173](http://localhost:4173).

For development with automatic server restarts:

```bash
npm run dev
```

## Put it on GitHub

### Browser method

1. Extract the downloaded ZIP.
2. Create a new empty repository on GitHub.
3. Choose **Add file → Upload files**.
4. Upload all extracted files directly to the repository root. `render.yaml`, `package.json`, and `server.js` must be visible on the main page of the repository—not inside another folder.
5. Commit the files to the `main` branch.

### Command-line method

```bash
git init
git add .
git commit -m "Add Paperlab trading simulator"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

## Run from GitHub Codespaces

1. Open your repository on GitHub.
2. Select **Code → Codespaces → Create codespace on main**.
3. In the Codespaces terminal, run `npm start`.
4. Open the forwarded port 4173.

## Public deployment

Paperlab needs its Node server for real stock prices, the shared leaderboard, and shared trader chat. **GitHub Pages alone will only serve static files and cannot run those APIs.** Deploy the repository to a Node-compatible host instead.

This package includes:

- `render.yaml` for a Render-style Blueprint deployment
- `Dockerfile` for any container host
- `package.json` with `npm start`

Set the host's start command to:

```bash
npm start
```

The server honors the platform-provided `PORT` environment variable.

## Market-data behavior

- **Stocks, ETFs, and indices:** actual market quotes and chart candles through Yahoo Finance; exchange or source delays may apply.
- **Crypto, meme coins, forex, and commodities:** accelerated fictional simulation.
- If the external stock feed is unavailable, Paperlab keeps working with clearly labeled fallback prices and retries automatically.

## Project files

```text
index.html      Main interface
styles.css      Complete responsive UI
app.js          Simulator, chart, trading, and leaderboard client
server.js       Static server, market-data proxy, leaderboard, and shared chat API
package.json    Start and validation scripts
Dockerfile      Container deployment
render.yaml     Node-host deployment configuration
```

## Disclaimer

All trades, businesses, products, ads, orders, cash, fills, and P&L are virtual. “AI” businesses are high-risk game simulations—not real autonomous services or earnings products. Nothing in this project is financial advice. Market data can be delayed or unavailable, and the simulator must not be used for real order execution.

## License

MIT
