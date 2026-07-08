import { PriceFeed } from './priceFeed.js';
import { CandlestickChart } from './candlestick.js';

const techFeed = new PriceFeed({
    name: 'TECH',
    initialPrice: 150,
    mu: 0.002,
    sigma: 0.001
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

let gameTime = 0;
let loopInterval = null;
let speedMs = 500;

const chart = new CandlestickChart('main-chart');

function gameLoop() {
    gameTime += 1;

    const techPrice = techFeed.tick(gameTime);
    const goldPrice = goldFeed.tick(gameTime);
    const cryptoPrice = cryptoFeed.tick(gameTime);

    console.log(`Time: ${gameTime} | TECH: ${techPrice.toFixed(2)} | GOLD: ${goldPrice.toFixed(2)} | CRYPTO: ${cryptoPrice.toFixed(2)}`);

    chart.updateData(techFeed.candles, techFeed.currentCandle);
}

function startEngine() {
    if (loopInterval) clearInterval(loopInterval);
    loopInterval = setInterval(gameLoop, speedMs);
    console.log("Game engine started.");
}

startEngine();