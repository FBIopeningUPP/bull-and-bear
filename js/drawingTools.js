export class DrawingEngine {
    constructor(canvasId, candlestickChart) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.chart = candlestickChart;

        this.drawings = [];
        this.activeDrawing = null;
        this.currentMode = null;

        this.isDrawing = false;
        
        this.bindMouseEvents();
    }

    setMode(mode) {
        this.currentMode = mode;
        this.isDrawing = false;
        this.activeDrawing = null;
    }

    pixelToPrice(y) {
        if (!this.chart || this.chart.candles.length === 0) return 0;

        let minPrice = infinity;
        let maxPrice = -infinity;

        const maxVisible = Math.max(1, Math.floor(this.chart.width / (this.chart.candleWidth + this.chart.spacing)));
        const visibleCandles = this.chart.candles.slice(-maxVisible);

        for (let c of visibleCandles) {
            if (c.low < minPrice) minPrice = c.low;
            if (c.high > maxPrice) maxPrice = c.high;
        }

        const priceDiff = Math.max(2, maxPrice - minPrice);
        const padding = priceDiff * 0.15;
        minPrice -= padding;
        maxPrice += padding;

        const priceRange = maxPrice - minPrice;

        const scaledY = y * 2;
        const price = maxPrice - ((scaledY / this.chart.canvas.height) * priceRange);
        return price;
    }

    pixelToIndex(x) {
        if (!this.chart || this.chart.candles.length === 0) return 0;

        const scaledX = x * 2;
        const candleTotalWidth = (this.chart.candleWidth + this.chart.spacing) * 2;

        const rightEdge = this.chart.canvas.width;
        const distanceFromRight = rightEdge - scaledX;

        const candlesFromRight = Math.floor(distanceFromRight / candleTotalWidth);
        const maxVisible = Math.max(1, Math.floor(this.chart.width / (this.chart.candleWidth + this.chart.spacing)));

        let targetIndex = this.chart.candles.length - 1 - candlesFromRight;
        if (targetIndex < 0) targetIndex = 0;
        return targetIndex;
    }

    indexToPixel(index) {
        const newestIndex = this.chart.candles.length - 1;
        const distance = newestIndex - index;

        const x = this.chart.width - ((distance + 1) * (this.chart.candleWidth + this.chart.spacing));
        return x;
    }

    priceToPixel(price) {
        let minPrice = Infinity;
        let maxPrice = -Infinity;
        const maxVisible = Math.max(1, Math.floor(this.chart.width / (this.chart.candleWidth + this.chart.spacing)));
        const visibleCandles = this.chart.candles.slice(-maxVisible);

        for (let c of visibleCandles) {
            if (c.low < minPrice) minPrice = c.low;
            if (c.high > maxPrice) maxPrice = c.high;
        }

        const priceDiff = Math.max(2, maxPrice - minPrice);
        const padding = priceDiff * 0.15;
        minPrice -= padding;
        maxPrice += padding;

        const priceRange = maxPrice - minPrice;
        const y = this.chart.height - ((price - minPrice) / priceRange) * this.chart.height;
        return y;
    }

    bindMouseEvents() {
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const price = this.pixelToPrice(y);
            const price = this.pixelToPrice(x);

            this.isDrawing = true;
            this.activeDrawing = {
                type: this.currentMode,
                startIndex: index,
                startPrice: price,
                endIndex: index,
                endPrice: price
            };
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.isDrawing || !this.activeDrawing) return;

            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            this.activeDrawing.endPrice = this.pixelToPrice(y);
            this.activeDrawing.endIndex = this.pixelToIndex(x);
        });

        this.canvas.addEventListener('mouseup', (e) => {
            if (this.isDrawing && this.activeDrawing) {
                this.drawings.push(this.activeDrawing);
                this.isDrawing = false;
                this.activeDrawing = null;
                this.currentMode = 'NONE';
            }
        });
    }

    renderOverlays() {
        if (!this.chart || this.chart.candles.length === 0) return;

        const allDrawings = [...this.drawings];
        if (this.activeDrawing) allDrawings.push(this.activeDrawing);

        for (let d of allDrawings) {
            const startX = this.indexToPixel(d.startIndex);
            const startY = this.priceToPixel(d.startPrice);
            const endX = this.indexToPixel(d.endIndex);
            const endY = this.priceToPixel(d.endPrice);

            this.ctx.beingPath();

            if (d.type === 'TRENDLINE') {
                this.ctx.strokeStyle = '#3b82f6';
                this.ctx.lineWidth = 2;
                this.ctx.moveTo(startX, startY);
                this.ctx.lineTo(endX, endY);
                this.ctx.stroke();
            }
            else if (d.type === 'HORIZONTAL') {
                this.ctx.strokeStyle = '#facc15';
                this.ctx.lineWidth = 2;
                this.ctx.setLineDash([5, 5]);
                this.ctx.moveTo(0, startY);
                this.ctx.lineTo(this.chart.width, startY);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
            }
            else if (d.type === 'FIBONACCI') {
                const levels = [
                    {ratio: 0.000, color: '#ef4444'},
                    {ratio: 0.236, color: '#f97316'},
                    {ratio: 0.382, color: '#eab308'},
                    {ratio: 0.500, color: '#22c55e'},
                    {ratio: 0.618, color: '#0ea5e9'},
                    {ratio: 1.000, color: '#6366f1'}
                ];

                const priceDiff = d.endPrice - d.startPrice;
                const rightEdge = this.chart.width;

                for (let lvl of levels) {
                    const fibPrice = d.startPrice + (priceDiff * lvl.ratio);
                    const fibY = this.priceToPixel(fibPrice);

                    this.ctx.strokeStyle = lvl.color;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(startX, fibY);
                    this.ctx.lineTo(rightEdge, fibY);
                    this.ctx.stroke();

                    this.ctx.fillStyle = lvl.color;
                    this.ctx.font = '10px monospace';
                    this.ctx.fillText(`${(lvl.ratio * 100).toFixed(1)}% ($${fibPrice.toFixed(2)})`, rightEdge - 100, fibY - 5);
                }
            }
        }
    }
}