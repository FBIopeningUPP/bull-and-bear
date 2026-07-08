import { PriceFeed } from './priceFeed.js';
import { CandlestickChart } from './candlestick.js';
import { UIController } from './ui.js';
import { OrderBook } from './orderBook.js';

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

const logTrade = (trade, asset) => {
    console.log(`TRADE FILLED! ${asset} ${trade.side.toUpperCase()} ${trade.qty} shares @ $${trade.executePrice.toFixed(2)}`);
};

techBook.onTrade = logTrade;
goldBook.onTrade = logTrade;
cryptoBook.onTrade = logTrade;


let gameTime = 0;
let loopInterval = null;
let speedMs = 500;

const chart = new CandlestickChart('main-chart');

const ui = new UIController();

let activeFeed = techFeed;
let activeBook = techBook;
let pendingMarketOrder = null;
let isPaused = false;

ui.onTabChange = (assetName) => {
    if (assetName === 'TECH') { activeFeed = techFeed; activeBook = techBook; }
    if (assetName === 'GOLD') { activeFeed = goldFeed; activeBook = goldBook; }
    if (assetName === 'CRYPTO') { activeFeed = cryptoFeed; activeBook = cryptoBook; }

    chart.updateData(activeFeed.candles, activeFeed.currentCandle);
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
    techBook.processTick(techPrice, activeFeed === techFeed ? pendingMarketOrder : null);
    goldBook.processTick(goldPrice, activeFeed === goldFeed ? pendingMarketOrder : null);
    cryptoBook.processTick(cryptoPrice, activeFeed === cryptoFeed ? pendingMarketOrder : null);

    pendingMarketOrder = null;

    console.log(`Time: ${gameTime} | TECH: ${techPrice.toFixed(2)} | GOLD: ${goldPrice.toFixed(2)} | CRYPTO: ${cryptoPrice.toFixed(2)}`);

    chart.updateData(activeFeed.candles, activeFeed.currentCandle);
}

function startEngine() {
    if (loopInterval) clearInterval(loopInterval);
    loopInterval = setInterval(gameLoop, speedMs);
    console.log("Game engine started.");
}

startEngine();