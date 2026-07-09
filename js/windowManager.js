export class WindowManager {
    constructor(containerId) {
        this.desktop = document.getElementById(containerId);
        this.windows = [];
        this.activeWindow = null;
        this.highestZIndex = 100;

        this.isDragging = false;
        this.isResizing = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.initialWindowX = 0;
        this.initialWindowY = 0;
        this.initialWindowWidth = 0;
        this.initialWindowHeight = 0;
        this.resizeDirection = '';
        this.bindGlobalEvents();
    }

     bindGlobalEvents() {
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging && this.activeWindow) {
            const dx = e.clientX - this.dragStartX;
            const dy = e.clientY - this.dragStartY;

            let newX = this.initialWindowX + dx;
            let newY = this.initialWindowY + dy;

            if (newY < 0) newY = 0;

            this.activeWindow.style.left = `${newX}px`;
            this.activeWindow.style.top = `${newY}px`;
            }

            if (this.isResizing && this.activeWindow) {
                const dx = e.clientX - this.dragStartX;
                const dy = e.clientY - this.dragStartY;

                if (this.resizeDirection.includes('e')) {
                    this.activeWindow.style.width = `${Math.max(200, this.initialWindowWidth + dx)}px`;
                }
                if (this.resizeDirection.includes('s')) {
                    this.activeWindow.style.height = `${Math.max(150, this.initialWindowHeight + dy)}px`;
                }
            }
        });

        document.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.isResizing = false;
            if (this.activeWindow) {
                this.activeWindow.style.opacity = '1';
                if (this.dbManager) {
                    this.dbManager.saveSetting(`win_${this.activeWindow.id}_pos`, { 
                        x: this.activeWindow.style.left, 
                        y: this.activeWindow.style.top 
                    });
                }
            }
        });
    }

    createWindow(id, title, contentHTML, x = 100, y = 100, width = 400, height = 300) {
        const win = document.createElement('div');
        win.id = id;
        win.className = 'floating-window glass-panel';
        win.style.left = `${x}px`;
        win.style.top = `${y}px`;
        win.style.width = `${width}px`;
        win.style.height = `${height}px`;
        
        this.highestZIndex++;
        win.style.zIndex = this.highestZIndex;

        win.innerHTML = `
            <div class="window-header">
                <div class="window-title">${title}</div>
                <div class="window-controls">
                    <button class="btn-win min">-</button>
                    <button class="btn-win max">+</button>
                    <button class="btn-win close">x</button>
                </div>
            </div>
            <div class="window-content">
                ${contentHTML}
            </div>
            <div class="resize-handle se"></div>
            <div class="resize-handle e"></div>
            <div class="resize-handle s"></div>
        `;

        this.desktop.appendChild(win);
        this.windows.push(win);

        this.attachWindowEvents(win);
        return win;
    }

    attachWindowEvents(win) {
        const header = win.querySelector('.window-header');
        const btnClose = win.querySelector('.btn-win.close');
        const btnMin = win.querySelector('.btn-win.min');
        const btnMax = win.querySelector('.btn-win.max');
        const resizeSE = win.querySelector('.resize-handle.se');
        const resizeE = win.querySelector('.resize-handle.e');
        const resizeS = win.querySelector('.resize-handle.s');

        win.addEventListener('mousedown', () => {
            this.bringToFront(win);
        });

        header.addEventListener('mousedown', (e) => {
            if (e.target.tagName === 'BUTTON') return; 

            this.isDragging = true;
            this.activeWindow = win;
            this.dragStartX = e.clientX;
            this.dragStartY = e.clientY;
            
            const rect = win.getBoundingClientRect();
            this.initialWindowX = rect.left;
            this.initialWindowY = rect.top;

            win.style.opacity = '0.8';
        });

        resizeSE.addEventListener('mousedown', (e) => {
            this.startResize(e, win, 'se');
        });

        resizeE.addEventListener('mousedown', (e) => {
            this.startResize(e, win, 'e');
        });

        resizeS.addEventListener('mousedown', (e) => {
            this.startResize(e, win, 's');
        });

        btnClose.addEventListener('click', () => {
            win.style.display = 'none';
        });

        btnMin.addEventListener('click', () => {
            const content = win.querySelector('.window-content');
            if (content.style.display === 'none') {
                content.style.display = 'block';
                win.style.height = win.getAttribute('data-prev-height');
            } else {
                win.setAttribute('data-prev-height', win.style.height);
                content.style.display = 'none';
                win.style.height = '30px';
            }
        });

        btnMax.addEventListener('click', () => {
            if (win.classList.contains('maximized')) {
                win.classList.remove('maximized');
                win.style.left = win.getAttribute('data-prev-x');
                win.style.top = win.getAttribute('data-prev-y');
                win.style.width = win.getAttribute('data-prev-width');
                win.style.height = win.getAttribute('data-prev-height');
            } else {
                win.setAttribute('data-prev-x', win.style.left);
                win.setAttribute('data-prev-y', win.style.top);
                win.setAttribute('data-prev-width', win.style.width);
                win.setAttribute('data-prev-height', win.style.height);

                win.classList.add('maximized');
                win.style.left = '0px';
                win.style.top = '60px';
                win.style.width = '100vw';
                win.style.height = 'calc(100vh - 120px)';
            }
        });
    }

    startResize(e, win, direction) {
        this.isResizing = true;
        this.activeWindow = win;
        this.resizeDirection = direction;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;

        const rect = win.getBoundingClientRect();
        this.initialWindowWidth = rect.width;
        this.initialWindowHeight = rect.height;
        e.stopPropagation();
    }

    bringToFront(win) {
        this.highestZIndex++;
        win.style.zIndex = this.highestZIndex;
        this.activeWindow = win;
    }
}