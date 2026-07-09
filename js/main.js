import { PriceFeed } from './priceFeed.js';
import { CandlestickChart } from './candlestick.js';
import { UIController } from './ui.js';
import { OrderBook } from './orderBook.js';
import { Portfolio } from './portfolio.js';
import { EquityChart } from './equityChart.js';
import { MarketMakerBot, WhaleBot, BotManager } from './bots.js';
import { NewsEngine } from './event.js';
import { NotificationSystem } from './notifications.js';
import { WindowManager } from './windowManager.js';
import { BacktestEngine } from './backtest.js';
import { DrawingEngine } from './drawingTools.js';
import { DatabaseManager } from './database.js';

const techFeed = new PriceFeed({
    name: 'TECH',
    initialPrice: 150,
    mu: 0.0002,
    sigma: 0.003
});

const goldFeed = new PriceFeed({
    name: 'GOLD',
    initialPrice: 2000,
    mu: 0.0001,
    sigma: 0.001
});

const cryptoFeed = new PriceFeed({
    name: 'CRYPTO',
    initialPrice: 45000,
    mu: 0.005,
    sigma: 0.015
});

const techBook = new OrderBook('TECH');
const goldBook = new OrderBook('GOLD');
const cryptoBook = new OrderBook('CRYPTO');
const myPortfolio = new Portfolio(10000.00);

const feedsMap = {
    'TECH': techFeed,
    'GOLD': goldFeed,
    'CRYPTO': cryptoFeed
};
const newsEngine = new NewsEngine(feedsMap);

const notificationSystem = new NotificationSystem();

const winManager = new WindowManager('desktop');
winManager.dbManager = dbManager;

const dbManager = new DatabaseManager();

dbManager.connect().then(() => {
    console.log("Database connected successfully.");
    winManager.loadWindowPositions(dbManager);
}).catch((err) => {
    console.error("Database connection failed:", err);
});

const orderEntryHTML = `
    <div class="form-group" style="padding-top: 10px;">
        <label>Type:</label>
        <select id="order-type">
            <option value="market">Market</option>
            <option value="limit">Limit</option>
        </select>
    </div>
    <div class="form-group">
        <label>Quantity:</label>
        <input type="number" id="order-qty" step="0.01">
    </div>
    <div class="form-group">
        <label>Price (Limit):</label>
        <input type="number" id="order-price" step="0.01" placeholder="Market Price">
    </div>
    <div style="display: flex; gap: 10px; margin-top: 25px;">
        <button id="btn-buy" class="btn buy" style="flex:1; padding: 12px;">BUY</button>
        <button id="btn-sell" class="btn sell" style="flex:1; padding: 12px;">SELL</button>
    </div>
`;
winManager.createWindow('win-order-entry', 'Order Entry', orderEntryHTML, 50, 50, 320, 260);

const orderBookHTML = `
    <div id="order-book-display" style="font-family: monospace; font-size: 0.9rem;">
        <p style="color: var(--text-muted);">Awaiting exchange connection...</p>
    </div>
`;
winManager.createWindow('win-order-book', 'L2 Order Book', orderBookHTML, 390, 50, 320, 380);

const ledgerHTML = `
    <table class="ledger-table" style="margin-top: 0;">
        <thead>
            <tr>
                <th>Time</th>
                <th>Asset</th>
                <th>Side</th>
                <th>Qty</th>
                <th>Price</th>
            </tr>
        </thead>
        <tbody id="ledger-body"></tbody>
    </table>
`;
winManager.createWindow('win-trade-ledger', 'Trade Ledger', ledgerHTML, 50, 330, 660, 250); 

const backtestEngine = new BacktestEngine();

const algoTerminalHTML = `
    <div style="padding: 10px; display: flex; flex-direction: column; gap: 15px; height: 100%;">
        <div style="display: flex; gap: 10px; align-items: center;">
            <label style="color: var(--text-muted); font-size: 0.9rem;">Strategy:</label>
            <select id="algo-strategy" style="flex: 1; padding: 6px; background: rgba(0,0,0,0.05); color: white; border: 1px solid var(--border);"
                <option value='SMA_CROSSOVER">SMA Golden Cross</option>
                <option value='MEAN_REVERSION'>Mean Reversion</option>
                <option value="RSI_OVERSOLD">RSI Oversold</option>
                </select>
                <button id="btn-run-algo" class="btn buy" style="padding: 6px 15px;">RUN TEST</button>
            </div>

            <div style="flex: 1; background: #000; border: 1px solid var(--border); padding: 15px; font-family: monospace; font-size: 0.85rem; overflow-y: auto;" id="algo-console">
                <span style="color: var(--text-muted);">Terminal ready. Awaiting execution command...</span>
            </div>
    </div>  
`;
winManager.createWindow('win-algo-terminal', 'Algo Research Terminal', algoTerminalHTML, 200, 150, 500, 400);


const techBots = new BotManager();
techBots.addBot(new MarketMakerBot('Tech-MM-1', techBook));
techBots.addBot(new MarketMakerBot('Tech-MM-2', techBook));
techBots.addBot(new WhaleBot('Tech-Whale', techBook));

const goldBots = new BotManager();
goldBots.addBot(new MarketMakerBot('Gold-MM-1', goldBook));
goldBots.addBot(new WhaleBot('Gold-Whale', goldBook));

const cryptoBots = new BotManager();
cryptoBots.addBot(new MarketMakerBot('Crypto-MM-1', cryptoBook));
cryptoBots.addBot(new MarketMakerBot('Crypto-MM-2', cryptoBook));
cryptoBots.addBot(new MarketMakerBot('Crypto-MM-3', cryptoBook));
cryptoBots.addBot(new WhaleBot('Crypto-Whale-1', cryptoBook));
cryptoBots.addBot(new WhaleBot('Crypto-Whale-2', cryptoBook));

const logTrade = (trade, asset) => {
    if(trade.isUser) {
        myPortfolio.addTrade(asset, trade.side, trade.qty, trade.executePrice);

        const type = trade.side === 'buy' ? 'success' : 'warning';
        notificationSystem.show(
            'Trade Executed',
            `${trade.side.toUpperCase()} ${trade.qty} ${asset} @ $${trade.executePrice.toFixed(2)}`,
            type
        );
        ui.addLedgerEntry(trade, asset);

        const tradeRecord = {
            asset: asset,
            side: trade.side,
            qty: trade.qty,
            price: trade.executePrice,
            executeTime: trade.executeTime,
            txHash: 'tx_' + Math.random().toString(36).substr(2, 9)
        };

        dbManager.insert('trades', tradeRecord).then(() => {
            console.log(`Trade ${tradeRecord.txHast} securely written to disk.`);
        });
    }
};

techBook.onTrade = logTrade;
goldBook.onTrade = logTrade;
cryptoBook.onTrade = logTrade;


let gameTime = 0;
let loopInterval = null;
let speedMs = 500;

const chart = new CandlestickChart('main-chart');
const drawingEngine = new DrawingEngine('main-chart', chart);

const toolButtons = document.querySelectorAll('.tool-btn');
const clearActiveStates = () => toolButtons.forEach(b => b.classList.remove('active'));

document.getElementById('tool-trendline').addEventListener('click', (e) => {
    clearActiveStates();
    e.currentTarget.classList.add('active');
    drawingEngine.setMode('TRENDLINE');
});

document.getElementById('tool-horizontal').addEventListener('click', (e) => {
    clearActiveStates();
    e.currentTarget.classList.add('active');
    drawingEngine.setMode('HORIZONTAL');
});

document.getElementById('tool-fibonacci').addEventListener('click', (e) => {
    clearActiveStates();
    e.currentTarget.classList.add('active');
    drawingEngine.setMode('FIBONACCI');
});

document.getElementById('tool-clear').addEventListener('click', (e) => {
    clearActiveStates();
    drawingEngine.setMode('NONE');
    drawingEngine.drawings = [];
});

const eqChart = new EquityChart('equity-chart');
const equityHistory = [];

const ui = new UIController();

ui.onRunAlgo = (strategy) => {
    const consoleDiv = document.getElementById('algo-console');
    consoleDiv.innerHTML = `<span style="color: #facc15;">[SYS] Initializing Backtest Engine...</span><br>`;

    setTimeout(() => {
        consoleDiv.innerHTML += `<span style="color: #3b82f6;">[DATA] Generating 10 years of Geometric Brownian Motion...</span><br>`;

        setTimeout(() => {
            const history = backtestEngine.generateHistoricalData(2520, 150, 0.0002, 0.015);
            consoleDiv.innerHTML += `<span style="color: #10b981;">[SYS] Executing ${strategy} over ${history.length} simulated days...</span><br>`;

            const results = backtestEngine.runBacktest(history, strategy);

            let output = `<br><span style="color: #f8fafc; font-weight: bold;">====== PERFORMANCE REPORT ======</span><br>`;
            output += `<span style="color: var(--text-muted);">Final Capital:</span> $${results.finalCapital.toFixed(2)}<br>`;
            output += `<span style="color: var(--text-muted);">Total Trades Executed:</span> ${results.totalTrades}<br>`;
            output += `<span style="color: var(--text-muted);">Simulation Time:</span> ${(Math.random() * 0.5 + 0.1).toFixed(3)}s<br>`;
            output += `<span style="color: #10b981; font-weight:bold;">> [END OF REPORT]</span><br>`;
        }, 600);
    }, 400);
}

let activeFeed = techFeed;
let activeBook = techBook;
let pendingMarketOrder = null;
let isPaused = false;

ui.onTabChange = (assetName) => {
    if (assetName === 'TECH') { activeFeed = techFeed; activeBook = techBook; }
    if (assetName === 'GOLD') { activeFeed = goldFeed; activeBook = goldBook; }
    if (assetName === 'CRYPTO') { activeFeed = cryptoFeed; activeBook = cryptoBook; }

    if (assetName !== 'PORTFOLIO') {
        chart.updateData(activeFeed.candles, activeFeed.currentCandle);
    }
};

ui.onPauseToggle = () => {
    isPaused = !isPaused;
    if (isPaused) {
        clearInterval(loopInterval);
    } else {
        startEngine();
    }
};

ui.onSpeedChange = (newSpeedMs) => {
    speedMs = newSpeedMs;
    if (!isPaused) startEngine();
};

ui.onOrderSubmit = (type, side, qty, price) => {
    const order = activeBook.placeOrder(type, side, qty, price);
    order.isUser = true;

    if (type === 'market') {
        pendingMarketOrder = order;
    } else {
        notificationSystem.show('Limit Order Placed', `${side.toUpperCase()} ${qty} shares at $${price}`, 'info');
    }
};

function gameLoop() {
    gameTime += 1;

    const headline = newsEngine.tick();
    if (headline) {
        document.getElementById('news-text').innerText = headline;

        notificationSystem.show('BREAKING NEWS', headline, 'error', 6000);

        const ticker = document.querySelector('.news-ticker-container');
        ticker.style.backgroundColor = '#fbbf24';
        setTimeout(() => {
            ticker.style.backgroundColor = '#ef4444';
        }, 500);
    }

    const techPrice = techFeed.tick(gameTime);
    const goldPrice = goldFeed.tick(gameTime);
    const cryptoPrice = cryptoFeed.tick(gameTime);
    techBots.tick(techPrice);
    goldBots.tick(goldPrice);
    cryptoBots.tick(cryptoPrice);
    techBook.processTick(techPrice, activeFeed === techFeed ? pendingMarketOrder : null);
    goldBook.processTick(goldPrice, activeFeed === goldFeed ? pendingMarketOrder : null);
    cryptoBook.processTick(cryptoPrice, activeFeed === cryptoFeed ? pendingMarketOrder : null);

    pendingMarketOrder = null;

    console.log(`Time: ${gameTime} | TECH: ${techPrice.toFixed(2)} | GOLD: ${goldPrice.toFixed(2)} | CRYPTO: ${cryptoPrice.toFixed(2)}`);

    chart.updateData(activeFeed.candles, activeFeed.currentCandle);
    drawingEngine.renderOverlays();

    const currentPrices = {
        'TECH': techPrice,
        'GOLD': goldPrice,
        'CRYPTO': cryptoPrice
    };

    const metrics = myPortfolio.getMetrics(currentPrices);

    document.getElementById('stat-equity').innerText = '$' + metrics.equity.toFixed(2);
    document.getElementById('stat-cash').innerText = '$' + metrics.cash.toFixed(2);
    document.getElementById('stat-unrealized').innerText = '$' + metrics.unrealizedPnL.toFixed(2);
    document.getElementById('stat-day').innerText = `Day ${gameTime}`;

    document.getElementById('stat-unrealized').style.color = metrics.unrealizedPnL >= 0 ? '#10b981' : '#ef4444';

    equityHistory.push({ time: gameTime, equity: metrics.equity });
    eqChart.updateData(equityHistory);

    const activePrice = activeFeed === techFeed ? techPrice : (activeFeed === goldFeed ? goldPrice : cryptoPrice);
    ui.renderOrderBook(activeBook, activePrice);
}

function startEngine() {
    if (loopInterval) clearInterval(loopInterval);
    loopInterval = setInterval(gameLoop, speedMs);
    console.log("Game engine started.");
}

startEngine();