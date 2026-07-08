export class UIController {
    constructor() {
        this.tabs = document.querySelectorAll('.tab');
        this.btnPause = document.getElementById('btn-pause');
        this.btnSpeed1 = document.getElementById('btn-speed-1');
        this.btnSpeed5 = document.getElementById('btn-speed-5');

        this.btnBuy = document.getElementById('btn-buy');
        this.btnSell = document.getElementById('btn-sell');
        this.inputType = document.getElementById('order-type');
        this.inputQty = document.getElementById('order-qty');
        this.inputPrice = document.getElementById('order-price');

        this.onOrderSubmit = null;
        this.onTabChange = null;
        this.onSpeedChange = null;
        this.onPauseToggle = null;

        this.bindEvents();
    }

    bindEvents() {
        this.tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.tabs.forEach(t => t.classList.remove('active'));

                const clickedTab = e.currentTarget;
                clickedTab.classList.add('active');

                const assetName = clickedTab.getAttribute('data-asset');

                if (this.onTabChange) this.onTabChange(assetName);
            });
        });

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

            this.btnBuy.addEventListener('click', () => {
                if (this.onOrderSubmit) {
                    this.onOrderSubmit(this.inputType.value, 'buy', this.inputQty.value, this.inputPrice.value);
                }
            });

            this.btnSell.addEventListener('click', () => {
                if (this.onOrderSubmit) {
                    this.onOrderSubmit(this.inputType.value, 'sell', this.inputQty.value, this.inputPrice.value);
                }
            });

            if (this.onPauseToggle) this.onPauseToggle();
        });
    }
}