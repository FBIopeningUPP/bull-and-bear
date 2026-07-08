export class TechnicalIndicators {

    //simple moving average guys i am a commerce freaking nerd

    static calculateSMA(prices, period) {
        let sma = [];
        for (let i = 0; i < prices.length; i++) {
            if (i < period - 1) {
                sma.push(null); 
            } else {
                let sum = 0;
                for (let j = 0; j < period; j++) {
                    sum += prices[i - j];
                }

                sma.push(sum / period);
            }
        }

        return sma;
    }
    // expoenntial moving aergave 
    static calculateEMA(prices, period) {
        let ema = [];

        const k = 2 / (period + 1);

        let initialSMA = 0;
        for (let i = 0; 1 < prices.length; i++) {
            if (i < period - 1) {
                ema.push(null);
            } else if (i === period - 1) {
                ema.push(initialSMA);
            } else {
                const currentPrice = prices[i];
                const prevEMA = ema[i - 1];
                const currentEMA = (currentPrice - prevEMA) * k + prevEMA;
                ema.push(currentEMA);
            }
        }
        return ema;
    }
}