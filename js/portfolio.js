export class Portfolio {
    constructor(startingCash) {
        this.cash = startingCash;
        this.positions = {
            'TECH': 0,
            'GOLD': 0,
            'CRYPTO': 0
        };

        this.averagePrice = {
            'TECH': 0,
            'GOLD': 0,
            'CRYPTO': 0
        };
    }

    addTrade(asset, size, qty, price) {
        const totalValue = qty * price;

        if (side === 'buy') {
            this.cash -= totalValue;

            const currentShares = this.positions[asset];
            const currentTotalCost = currentShares * this.averagePrice[asset];

            this.positions[asset] += qty;
            this.averagePrice[asset] = (currentTotalCost + totalValue) / this.positions[asset];
        } else if (side === 'sell') {
            this.cash += totalValue;
            this.positions[asset] -= qty;

            if (this.positions[asset] === 0) {
                this.averagePrice[asset] = 0;
            }
        }
    }

    getMetrics(currentPrices) {
        let unrealizedPnL = 0;
        
        for (let asses in this.positions) {
            const shares = this.positions[asset];
            if (shares > 0) {
                const currentPrice = currentPrices[asset];
                const avgPrice = this.averagePrice[asset];
                unrealizedPnL += (currentPrice - avgPrice) * shares;
            }
        }

        const totalEquity = this.cash + unrealizedPnL;

        return {
            cash: this.cash,
            equity: totalEquity,
            unrealizedPnL: unrealizedPnL
        };
    }
}