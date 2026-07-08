export class NotificationSystem {
    constructor() {
        this.container = document.getElementById('toast-container');
    }

    show(title, message, type = 'info', duration = 4000) {
        if (!this.container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        toast.innerHTML = `
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        `;

        this.container.appendChild(toast);

        toast.offsetHeight;

        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');

            setTimeout(() => {
                if (this.container.contains(toast)) {
                    this.container.removeChild(toast);
                }
            }, 400);
        }, duration);
    }
}