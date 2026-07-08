export class UIController {
    constructor() {
        this.tabs = document.querySelectorAll('.tab');
        this.btnPause = document.getElementById('btn-pause');
        this.btnSpeed1 = document.getElementById('btn-speed-1');
        this.btnSpeed2 = document.getElementById('btn-speed-2');

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
            this.btnSpeed2.classList.remove('active');
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
                this.btnPause.classList.add('acitve');
            } else {
                this.btnPause.innerText = 'Pause';
                this.btnPause.classList.remove('acitve');
            }

            if (this.onPauseToggle) this.onPauseToggle();
        });
    }
}