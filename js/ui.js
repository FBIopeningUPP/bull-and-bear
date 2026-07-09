export class UIController {
    constructor() {
        this.tabs = document.querySelectorAll('.tab');
        this.btnPause = document.getElementById('btn-pause');
        this.btnSpeed1 = document.getElementById('btn-speed-1');
        this.btnSpeed5 = document.getElementById('btn-speed-5');

        this.toggleOrder = document.getElementById('toggle-order');
        this.toggleBook = document.getElementById('toggle-book');
        this.toggleLedger = document.getElementById('toggle-ledger');

        this.chartView = document.getElementById('chart-view');
        this.portfolioView = document.getElementById('portfolio-view');

        this.onOrderSubmit = null;
        this.onTabChange = null;
        this.onSpeedChange = null;
        this.onPauseToggle = null;

        this.toggleAlgo = document.getElementById('toggle-algo');
        this.onRunAlgo = null;

        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'btn-buy') {
                const type = document.getElementById('order-type').value;
                const qty = document.getElementById('order-qty').value;
                const price = document.getElementById('order-price').value;
                if (this.onOrderSubmit) this.onOrderSubmit(type, 'buy', qty, price);
            }

            if (e.target && e.target.id === 'btn-sell') {
                const type = document.getElementById('order-type').value;
                const qty = document.getElementById('order-qty').value;
                const price = document.getElementById('order-price').value;
                if (this.onOrderSubmit) this.onOrderSubmit(type, 'sell', qty, price);
            }

            if (e.target && e.target.id === 'btn-run-algo') {
                const strategy = document.getElementById('algo-strategy').value;
                if (this.onRunAlgo) this.onRunAlgo(strategy);
            }
        });

        const toggleWindow = (windowId) => {
            const win = document.getElementById(windowId);
            if (win) {
                if (win.style.display === 'none') {
                    win.style.display = 'flex';
                    win.style.zIndex = 9999;
            } else {
                win.style.display = 'none';
            }
        }
    };

    this.toggleOrder.addEventListener('click', () => toggleWindow('win-order-entry'));
    this.toggleBook.addEventListener('click', () => toggleWindow('win-order-book'));
    this.toggleLedger.addEventListener('click', () => toggleWindow('win-trade-ledger'));

    this.tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            this.tabs.forEach(t => t.classList.remove('active'));
            const clickedTab = e.currentTarget;
            clickedTab.classList.add('active');
            
            const assetName = clickedTab.getAttribute('data-asset');
            if (assetName === 'PORTFOLIO') {
                this.chartView.classList.add('hidden');
                this.portfolioView.classList.remove('hidden');
            } else {
                this.chartView.classList.remove('hidden');
                this.portfolioView.classList.add('hidden');
            }
            if (this.onTabChange) this.onTabChange(assetName);
        });
    })

    this.btnSpeed1.addEventListener('click', () => {
        this.btnSpeed1.classList.add('active');
        this.btnSpeed5.classList.remove('active');
        if (this.onSpeedChange) this.onSpeedChange(500);
    });

    this.btnSpeed5.addEventListener('click', () => {
        this.btnSpeed5.classList.add('active');
        this.btnSpeed1.classList.remove('active');
        if (this.onSpeedChange) this.onSpeedChange(100);
    });

    this.btnPause.addEventListener('click', () => {
        if (this.btnPause.innerText === 'Pause') {
            this.btnPause.innerText = 'Play';
            this.btnPause.classList.add('active');
        } else {
            this.btnPause.innerText = 'Pause';
            this.btnPause.classList.remove('active');
        }
        if (this.onPauseToggle) this.onPauseToggle();
    }); 
    
    this.toggleAlgo.addEventListener('click', () => toggleWindow('win-algo-terminal'));
}

    renderOrderBook(orderBook, currentPrice) {
        const display = document.getElementById('order-book-display');

        let html = '<div class="order-book-header">';
        html += `<div style="type-align:center; padding-bottom:10px; border-bottom: 1px solid #333; margin-bottom: 10px;">`;
        html += `<strong>${orderBook.assetName} Order Book</strong></div>`;
        html += '<div style="display: flex; justify-content: space-between; color:#94a3b8; font-size:0.8rem; padding-bottom:5px;">';
        html += '<span>Price</span><span>Qty</span></div>';
        html += '</div>'

        html += '<div class="asks-container" style="display: flex; flex-direction: column-reverse; margin-bottom: 10px;">';

        const topAsks = orderBook.asks.slice(0, 12);
        for (let ask of topAsks) {
            html += `<div style="display:flex; justify-content:space-between; color:#ef4444; padding:2px 0;">`;
            html += `<span>$${ask.price.toFixed(2)}</span>`;
            html += `<span>${ask.qty}</span>`;
            html += `</div>`;
        }
        html += '</div>';

        html += `<div style="text-align:center; padding:5px 0; border-top:1px solid #333; border-bottom:1px solid #333; color:#f8fafc; font-weight:bold; margin-bottom:10px; font-size:1.1rem;">`;
        html += `$${currentPrice.toFixed(2)}`;
        html += `</div>`;

        html += '<div class="bids-container" style="display:flex; flex-direction:columns;">';
        const topBids = orderBook.bids.slice(0, 12);
        for (let bid of topBids) {
            html += `<div style="display:flex; justify-content:space-between; color:#22c55e; padding:2px 0;">`;
            html += `<span>$${bid.price.toFixed(2)}</span>`;
            html += `<span>${bid.qty}</span>`;
            html += `</div>`;
        }

        html += '</div>';

        display.innerHTML = html;
    }

    addLedgerEntry(trade, asset) {
        const ledgerBody = document.getElementById('ledger-body');
        if (!ledgerBody) return;

        const row = document.createElement('tr');
        const colorClass = trade.side === 'buy' ? 'ledger-row-buy' : 'ledger-row-sell';
        const timeStr = new Date(trade.executeTime).toLocaleTimeString();

        row.innerHTML = `
            <td>${timeStr}</td>
            <td>${asset}</td>
            <td class="${colorClass}">${trade.side.toUpperCase()}</td>
            <td>${trade.qty}</td>
            <td>$${trade.executePrice.toFixed(2)}</td>
        `;

        ledgerBody.prepend(row);

        if (ledgerBody.childElementCount > 50) {
            ledgerBody.removeChild(ledgerBody.lastChild);
        }
    }
}