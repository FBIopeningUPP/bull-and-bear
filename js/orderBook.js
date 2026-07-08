export class OrderBook {
    constructor(assetName) {
        this.assetName = assetName;
        
        this.bids = [];
        this.asks = [];

        this.onTrade = null;
    }

    sortBooks() {
        this.bids.sort((a, b) => b.price - a.price);
        this.asks.sort((a, b) => a.price - b.price);
    }

    placeOrder(type, side, qty, price=0) {
        const order = {
            id: Math.random().toString(36).substr(2, 9),
            type: type, 
            side: side,
            qty: parseInt(qty),
            price: parseFloat(price),
            timestamp: Date.now()
        };

        if (type === 'market') {
            return order;
        }

        if (type === 'limit') {
            if (side === 'buy') this.bids.push(order);
            if (side === 'sell') this.asks.push(order);
            this.sortBooks();
        }
        return order;
    }
    ///usage of ai was there in this block
    processTick(currentPrice, incomingMarketOrders = null){
        let fills = [];

        if (incomingMarketOrders) {
            fills.push({
                ...incomingMarketOrders,
                executePrice: currentPrice,
                executeTime: Date.now()
            });
        }

        while (this.bids.length > 0 && currentPrice <= this.bids[0].price) {
            const filledOrder = this.bids.shift();
            fills.push({
                ...filledOrder,
                executePrice: currentPrice,
                executeTime: Date.now()
            });
        }

        while (this.asks.length > 0 && currentPrice >= this.asks[0].price) {
            const filledOrder = this.asks.shift();
            fills.push({
                ...filledOrder,
                executePrice: currentPrice,
                executeTime: Date.now()
            });
        }

        for (let trade of fills) {
            if (this.onTrade) this.onTrade(trade, this.assetName);
        }

        return fills;
    }
}