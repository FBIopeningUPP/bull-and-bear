// fake news that makes the market go shit pans //
export class NewsEngine {
    constructor() {
        this.feeds = feeds;

        this.newsDatabase = [
            {
                headline: "BREAKING: Fed Raises Interest Rates Unexpectedly! Tech stocks plummet.",
                targetAsset: "TECH",
                effect: "crash",
                shockMultiplier: 5.0
            },
            {
                headline: "RUMOR: Major Crypto Exchange Hacked! Millions stolen.",
                targetAsset: "CRYPTO",
                effect: "crash",
                shockMultiplier: 8.0
            },
            {
                headline: "NEWS: Global Central Banks Announce Massive Gold Purchases.",
                targetAsset: "GOLD",
                effect: "moon",
                shockMultiplier: 4.0
            },
            {
                headline: "TECH: Revolutionary Breakthrough in Artificial Intelligence Announced!",
                targetAsset: "TECH",
                effect: "moon",
                shockMultiplier: 6.0
            }
        ];

        this.activeEvents = null;
        this.cooldown = 100;
    }

    tick() {
        if (this.cooldown > 0) {
            this.cooldown--;
            return null;
        }

        if (Math.random() < 0.01) {
            return this.triggerRandomEvent();
        }

        return null;
    }

    triggerRandomEvent() {
        const randomIndex = Math.floor(Math.random() * this.newsDatabase.length);
        const event = this.newsDatabase[randomIndex];

        const targetFeed = this.feeds[event.targetAsset];
        if (!targetFeed) return null;

        const shock = targetFeed.sigma * event.shockMultiplier;

        if (event.effect === "crash") {
            targetFeed.currentPrice = targetFeed.currentPrice * Math.exp(-shock);
        } else if (event.effect === "moon") {
            targetFeed.currentPrice = targetFeed.currentPrice * Math.exp(shock);
        }

        this.cooldown = 250;

        console.log("NEWS EVENT TRIGGERED:", event.headline);
        return event.headline;
    }
}