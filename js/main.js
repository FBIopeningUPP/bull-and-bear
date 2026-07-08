import { PriceFeed } from './priceFeed.js';
import { CandlestickChart } from './candlestick.js';
import { UIController } from './ui.js';
import { OrderBook } from './orderBook.js';
import { Portfolio } from './portfolio.js';
import { EquityChart } from './equityChart.js';
import { MarketMakerBot, WhaleBot, BotManager } from './bots.js';

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
    console.log(`TRADE FILLED! ${asset} ${trade.side.toUpperCase()} ${trade.qty} shares @ $${trade.executePrice.toFixed(2)}`);
    myPortfolio.addTrade(asset, trade.side, trade.qty, trade.executePrice);
};

techBook.onTrade = logTrade;
goldBook.onTrade = logTrade;
cryptoBook.onTrade = logTrade;


let gameTime = 0;
let loopInterval = null;
let speedMs = 500;

const chart = new CandlestickChart('main-chart');
const eqChart = new EquityChart('equity-chart');
const equityHistory = [];

const ui = new UIController();

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
    if (type === 'market') {
        pendingMarketOrder = order;
    } else {
        console.log(`Limit ${side} placed at $${price} and added to Order Book.`);
    }
};

function gameLoop() {
    gameTime += 1;

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
}

function startEngine() {
    if (loopInterval) clearInterval(loopInterval);
    loopInterval = setInterval(gameLoop, speedMs);
    console.log("Game engine started.");
}

startEngine();