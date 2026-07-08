export class PriceFeed {
    constructor(config = {}) {
        this.name = config.name || 'UNKNOWN';
        this.currentPrice = config.initialPrice || 100.0;

        this.mu = config.mu || 0.0002;
        this.sigma = config.sigma || 0.002;

        this.ticksPerCandle = config.ticksPerCandle || 10;
        this.tickCount = 0;

        this.candles = [];
        this.currentCandle = null;

        this.initNewCandle(this.currentPrice, 0);
    }

    randomNormal() {
        let u = 0, v = 0;
        while(u === 0) u = Math.random();
        while(v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }

    initNewCandle(openPrice, timestamp) {
        this.currentCandle = {
            timestamp: timestamp,
            open: openPrice,
            high: openPrice,
            low: openPrice,
            close: openPrice,
            volume: 0
        };
    }

    updateCandle(price, volume) {
        this.currentCandle.close = price;
        this.currentCandle.volume += volume;

        if (price > this.currentCandle.high) this.currentCandle.high = price;
        if (price < this.currentCandle.low) this.currentCandle.low = price;
    }

    tick(timestamp, additionalVol = 1) {
        const drift = this.mu - 0.5 * (this.sigma * this.sigma);
        const shock = this.sigma * this.randomNormal();

        this.currentPrice = this.currentPrice * Math.exp(drift + shock);

        this.currentPrice = Math.round(this.currentPrice * 100) / 100;
        if (this.currentPrice <= 0.01) this.currentPrice = 0.01;

        const tickVol = additionalVol + Math.floor(Math.random() * 50);

        this.updateCandle(this.currentPrice, tickVol);
        this.tickCount++;

        if (this.tickCount >= this.ticksPerCandle) {
            this.candles.push(this.currentCandle);
            this.tickCount = 0;
            this.initNewCandle(this.currentPrice, timestamp);
        }

        return this.currentPrice;
    }
}
