import { TechnicalIndicators } from './indicators.js';

export class CandlestickChart {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        this.width = this.canvas.parentElement.clientWidth;
        this.height = this.canvas.parentElement.clientHeight;

        this.canvas.width = this.width * 2;
        this.canvas.height = this.height * 2;
        this.ctx.scale(2, 2);

        this.candles = [];

        this.candleWidth = 8;
        this.spacing = 4;

        this.upColor = '#10b981';
        this.downColor = '#ef4444';

        this.showSMA = true;
        this.smaPeriod = 20;
        this.smaColor = '#facc15';
    }

    updateData(candles, currentCandle) {
        this.candles = [...candles];
        if (currentCandle) {
            this.candles.push(currentCandle);
        }
        this.draw();
    }

    draw() {
        const currentWidth = this.canvas.parentElement.clientWidth;
        const currentHeight = this.canvas.parentElement.clientHeight;

        if (this.width !== currentWidth || this.height !== currentHeight) {
            this.width = currentWidth;
            this.height = currentHeight;
            this.canvas.width = this.width * 2;
            this.canvas.height = this.height * 2;
            this.ctx.scale(2, 2);
        }

        this.ctx.clearRect(0, 0, this.width, this.height);

        if (this.candles.length === 0) return;

        const maxVisible = Math.floor(this.width / (this.candleWidth + this.spacing));
        const visibleCandles = this.candles.slice(-maxVisible);

        let minPrice = Infinity;
        let maxPrice = -Infinity;

        for (let c of visibleCandles) {
            if (c.low < minPrice) minPrice = c.low;
            if (c.high > maxPrice) maxPrice = c.high;
        }

        let visibleSMA = [];
        if (this.showSMA && this.candles.length >= this.smaPeriod) {
            const closes = this.candles.map(c => c.close);
            const fullSMA = TechnicalIndicators.calculateSMA(closes, this.smaPeriod);
            visibleSMA = fullSMA.slice(-maxVisible);

            for (let val of visibleSMA) {
                if (val !== null) {
                    if (val < minPrice) minPrice = val;
                    if (val > maxPrice) maxPrice = val;
                }
            }
        }


        let priceDiff = maxPrice - minPrice;

        if (priceDiff < 2) {
            priceDiff = 2;
            const centerPrice = (maxPrice + minPrice) / 2;
            minPrice = centerPrice - 1;
            maxPrice = centerPrice + 1;
        }

        const padding = priceDiff * 0.1;
        minPrice -= padding;
        maxPrice += padding;

        let priceRange = maxPrice - minPrice;
        if (priceRange === 0) priceRange = 1;

        const getPos = (price) => {
            return this.height - ((price - minPrice) / priceRange) * this.height;
        };

        let x = this.width - (this.candleWidth + this.spacing);

        for (let i = visibleCandles.length - 1; i >= 0; i--) {
            const c = visibleCandles[i];

            const yOpen = getPos(c.open);
            const yClose = getPos(c.close);
            const yHigh = getPos(c.high);
            const yLow = getPos(c.low);

            const isUp = c.close >= c.open;
            this.ctx.fillStyle = isUp ? this.upColor : this.downColor;
            this.ctx.strokeStyle = isUp ? this.upColor : this.downColor;

            this.ctx.beginPath();
            this.ctx.moveTo(x + this.candleWidth / 2, yHigh);
            this.ctx.lineTo(x + this.candleWidth / 2, yLow);
            this.ctx.stroke();

            const bodyY = Math.min(yOpen, yClose);
            let bodyHeight = Math.abs(yClose - yOpen);
            if (bodyHeight < 1) bodyHeight = 1;

            this.ctx.fillRect(x, bodyY, this.candleWidth, bodyHeight);

            x -= (this.candleWidth + this.spacing);
        }

        if (this.showSMA && this.candles.length >= this.smaPeriod) {

            let smaX = this.width - (this.candleWidth + this.spacing) + (this.candleWidth / 2);
            this.ctx.beginPath();
            let firstPointDrawn = false;

            for (let i = visibleSMA.length - 1; i >= 0; i--) {
                const val = visibleSMA[i];

                if (val !== null) {
                    const y = getPos(val);

                    if (!firstPointDrawn) {
                        this.ctx.moveTo(smaX, y);
                        firstPointDrawn = true;
                    } else {
                        this.ctx.lineTo(smaX, y);
                    }
                }

                smaX -= (this.candleWidth + this.spacing);
            }

            this.ctx.strokeStyle = this.smaColor;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        } 
    } 
}