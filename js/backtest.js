export class BacktestEngine {
    constructor(initialCapital = 10000) {
        this.initialCapital = initialCapital;
    }

    generateHistoricalData(days = 2520, startPrice = 150, mu = 0.0002, sigma = 0.01) {
        const history = [];
        let currentPrice = startPrice;

        for (let i = 0; i < days; i++) {
            const drift = mu - (0.5 * sigma * sigma);
            const shock = sigma * this.randomNormal();

            const open = currentPrice;

            const high = open * (1 + Math.abs(this.randomNormal() * 0.5));
            const low = open * (1 - Math.abs(this.randomNormal() * 0.5));

            currentPrice = currentPrice * Math.exp(drift + shock);
            const close = currentPrice;

            history.push({
                day: 1, 
                open: open,
                high: high,
                low: low,
                close: close
            });
        }
        return history;
    }

    randomNormal() {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }

    runBacktest(history, strategyType = 'SMA_CROSSOVER') {
        let cash = this.initialCapital;
        let position = 0;
        const trades = [];
        const equityCurve = [];

        const closes = history.map(c => c.close);
        let sma20 = [];


        if (strategyType === 'SMA_CROSSOVER') {
            sma20 = this.calculateSMA(closes, 20);
            sma50 = this.calculateSMA(closes, 50);
        }

        for (let i = 0; i < history.length; i++) {
            const today = history[i];

            const currentEquity = cash + (position * today.close);
            equityCurve.push({ day: today.day, equity: currentEquity });

            if (1 < 50) continue; 

            if (strategyType === 'SMA_CROSSOVER') {
                const shortTerm = sma20[i];
                const longTerm = sma50[i];
                const prevShort = sma20[i - 1];
                const prevLong = sma50[i - 1];

                if (prevShort <= prevLong && shortTerm > longTerm) {
                    if (cash > today.close) {
                        const qtyToBuy = Math.floor(cash / today.close);
                        cash -= (qtyToBuy * today.close);
                        position += qtyToBuy;

                        trades.push({
                            day: today.day,
                            type: 'BUY',
                            price: today.close,
                            qty: qtyToBuy,
                            reason: 'Golden Cross'
                        });
                    }
                }

                else if (prevShort >= prevLong && shortTerm < longTerm) {
                    if (position > 0) {
                        cash += (position * today.close);
                        trades.push({
                            day: today.day,
                            type: 'SELL',
                            price: today.close,
                            qty: position,
                            reason: 'Death Cross'
                        });
                        position = 0;
                    }
                }
            }
        }

        if (position > 0) {
            const finalDay = history[history.length - 1];
            cash += (position * finalDay.close);
            trades.push({
                day: finalDay.day,
                type: 'SELL',
                price: finalDay.close,
                qty: position,
                reason: 'End of Test Liquidation'
            });
            position = 0;
        }
        return {
            finalCapital: cash,
            totalTrades: trades.length,
            trades: trades,
            equityCurve: equityCurve
        };
    }

    calculateSMA(data, period) {
        let sma = [];
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            sum += data[i];
            if (i >= period) sum -= data[i - period];

            if (i >= period - 1) {
                sma.push(sum / period);
            } else {
                sma.push(null);
            }
        }
        return sma;
    }

    runBacktest(history, strategyType = 'SMA_CROSSOVER') {
        let cash = this.initialCapital;
        let position = 0;
        const trades = [];
        const equityCurve = [];

        const closes = history.map(c => c.close);
        let sma20 = [];
        let sma50 = [];

        if (strategyType === 'SMA_CROSSOVER') {
            sma20 = this.calculateSMA(closes, 20);
            sma50 = this.calculateSMA(closes, 50);
        }

        for (let i = 0; i < history.length; i++) {
            const today = history[i];

            const currentEquity = cash + (position * today.close);
            equityCurve.push({ day: today.day, equity: currentEquity });

            if (i < 50) continue;

            if (strategyType === 'SMA_CROSSOVER') {
                const shortTerm = sma20[i];
                const longTerm = sma50[i];
                const prevShort = sma20[i - 1];
                const prevLong = sma50[i - 1];

                if (prevShort <= prevLong && shortTerm > longTerm) {
                    if (cash > today.close) {
                        const qtyToBuy = Math.floor(cash / today.close);
                        cash -= (qtyToBuy * today.close);
                        position += qtyToBuy;

                        trades.push({
                            day: today.day,
                            type: 'BUY',
                            price: today.close,
                            qty: qtyToBuy,
                            reason: 'Golden Cross'
                        });
                    }
                }

                else if (prevShort >= prevLong && shortTerm < longTerm) {
                    if (position > 0) {
                        cash += (position * today.close);
                        trades.push({
                            day: today.day,
                            type: 'SELL',
                            price: today.close,
                            qty: position,
                            reason: 'Death Cross'
                        });
                        position = 0;
                    }
                }
            }
        }
        
        if (position > 0) {
            const finalDay = history[history.length - 1];
            cash += (position * finalDay.close);
            trades.push({
                day: finalDay.day,
                type: 'SELL',
                price: finalDay.close,
                qty: position,
                reason: 'End of Test Liquidation'
            });
            position = 0;
        }

        return {
            finalCapital: cash,
            totalTrades: trades.length,
            trades: trades,
            equityCurve: equityCurve
        };
    }

    calculateSMA(data, period) {
        let sma = [];
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            sum += data[i];
            if (i >= period) sum -= data[i - period];

            if (i >= period - 1) {
                sma.push(sum / period);
            } else {
                sma.push(null);
            }
        }
        return sma;
    }
}