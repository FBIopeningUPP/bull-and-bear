export class EquityChart {
    constructor() {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        this.width = 0;
        this.height = 0;

        this.history = [];

        this.lineColor = '#00FF00';
        this.fillColor = 'rgba(0, 255, 0, 0.2)';
    }

    updateData(newHistory) {
        this.history = [...newHistory];
        this.draw();
    }
    
    draw() {
        const currentWidth = this.canvas.parentElement.clientWidth;
        const currentHeight = this.canvas.parentElement.clientHeight;

        if (this.width !== currentWidth || this.height !== currentHeight) {
            this.width = currentWidth;
            this.height = currentHeight;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.ctx.scale(2, 2);
        }

        this.ctx.clearRect(0, 0, this.width, this.height);

        if (this.history.length < 2) return;

        const pointSpacing = 5;
        const maxPoints = Math.floor(this.width / pointSpacing);
        const visibleData = this.history.slice(-maxPoints);

        let minEq = infinity;
        let maxEq = -infinity;

        for (let pt of visibleData) {
            if (pt.equity < minEq) minEq = pt.equity;
            if (pt.equity > maxEq) maxEq = pt.equity;
        }

        const padding = (maxEq - minEq) * 0.1;
        minEq -= padding;
        maxEq += padding;

        let range = maxEq - minEq;
        if (range === 0) range = 1;

        let x = this.width - ((visibleData.length - 1) * pointSpacing);
        let startX = x;

        this.ctx.beginPath();

        for (let i = 0; i < visibleData.length; i++) {
            const pt = visibleData[i];
            const y = this.height - ((pt.equity - minEq) / range) * this.height;

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }

            x += pointSpacing;
        }

        this.ctx.strokeStyle = this.lineColor;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        this.ctx.lineTo(x - pointSpacing, this.height);
        this.ctx.lineTo(startX, this.height);
        this.ctx.closePath();

        this.ctx.fillStyle = this.fillColor;
        this.ctx.fill();
    }
}