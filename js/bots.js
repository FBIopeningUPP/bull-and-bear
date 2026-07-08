class BaseBot {
    constructor(botId, orderBook) {
        this.botId = botId;
        this.orderBook = orderBook;
    }

    act(currentPrice) {
        throw new Error("Bot must implement act() method.");
    }
}

export class MarketMakerBot extends BaseBot {
    constructor(botId, orderBook, maxOrderSize = 50) {
        super(botId, orderBook);
        this.maxOrderSize = maxOrderSize;
    }

    act(currentPrice) {
        if (Math.random() > 0.3) return;

        const side = Math.random() > 0.5 ? 'buy' : 'sell';

        const qty = Math.floor(Math.random() * this.maxOrderSize) + 1;

        const variancePercentage = 0.001 + (Math.random() * 0.004);
        const priceVariance = currentPrice * variancePercentage;

        let targetPrice;
        if (side === 'buy') {
            targetPrice = currentPrice - priceVariance;
        } else {
            targetPrice = currentPrice + priceVariance;
        }

        targetPrice = Math.round(targetPrice * 100) / 100;

        this.orderBook.placeOrder('limit', side, qty, targetPrice);
    }
}


export class WhaleBot extends BaseBot {
    constructor(botId, orderBook) {
        super(botId, orderBook);
    }

    act(currentPrice) {
        if (Math.random() > 0.05) return;

        const side = Math.random() > 0.5 ? 'buy' : 'sell';

        const qty = Math.floor(Math.random() * 4000) + 1000;

        const variancePercentage = 0.01 + (Math.random() * 0.02);
        const priceVariance = currentPrice * variancePercentage;

        let targetPrice;
        if (side === 'buy') {
            targetPrice = currentPrice - priceVariance;
        } else {
            targetPrice = currentPrice + priceVariance;
        }

        targetPrice = Math.round(targetPrice * 100) / 100;
        this.orderBook.placeOrder('limit', side, qty, targetPrice);
    }
}

export class BotManager {
    constructor() {
        this.bots = [];
    } 

    addBot(bot) {
        this.bots.push(bot);
    }

    tick(currentPrice) {
        for (let bot of this.bots) {
            bot.act(currentPrice);

            if (bot.orderBook.bids.length > 30) {
                bot.orderBook.bids.length = 30;
            }
            if (bot.orderBook.asks.length > 30) {
                bot.orderBook.asks.length = 30;
            }
        }
    }
}