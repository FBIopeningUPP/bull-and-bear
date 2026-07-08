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
    }

    updateData(candles, currentCandle) {
        this.candles = [...candles];
        if (currentCandle) {
            this.candles.push(currentCandle);
        }
        this.draw();
    }

    draw() {
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

        const padding = (maxPrice - minPrice) * 0.05;
        minPrice -= padding;
        maxPrice += padding;

        const priceRange = maxPrice - minPrice;

        let x = this.width - (this.candleWidth + this.spacing);

        for (let i = visibleCandles.length - 1; i >=0; i--) {
            const c = visibleCandles[i];

            const getPos = (price) => {
                return this.height - ((price - minPrice) / priceRange) * this.height;
            };

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
            if  (bodyHeight < 1) bodyHeight = 1;

            this.ctx.fillRect(x, bodyY, this.candleWidth, bodyHeight);

            x -= (this.candleWidth + this.spacing);
        }
    }
}