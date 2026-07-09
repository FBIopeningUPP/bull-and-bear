export class DatabaseManager {
    constructor(dbName = 'BullAndBearOS', version = 1) {
        this.dbName = dbName;
        this.version = version;
        this.db = null;
    }

    connect() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if(!db.objectStoreNames.contains('trades')) {
                    const tradeStore = db.createObjectStore('trades', { keyPath: 'id', autoIncrement: true });
                    tradeStore.createIndex('asset', 'asset', { unique: false });
                    tradeStore.createIndex('executeTime', 'executeTime', { unique: false });    
                }

                if (!db.objectStoreNames.contains('algo_reports')) {
                    const algoStore = db.createObjectStore('algo_reports', { keyPath: 'id', autoIncrement: true });
                    algoStore.createIndex('strategy', 'strategy', { unique: false });
                    algoStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log(`[DB] Connected to ${this.dbName} v${this.version}`);
                resolve(this.db);
            };

            request.onerror = (event) => {
                console.error(`[DB] Connection Error:`, event.target.error);
                reject(event.target.error);
            };
        });
    }

    async insert(storeName, data) {
        if (!this.db) await this.connect();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);

            const request = store.add(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject(e.target.error);
        });
    }

    async getAll(storeName) {
        if (!this.db) await this.connect();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => reject(e.target.error);
        });
    }

    async saveSetting(key, value) {
        if (!this.db) await this.connect();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');
            const request = store.put({ key: key, value: value });

            request.onsuccess = () => resolve(true);
            request.onerror = (e) => reject(e.target.error);
        });
    }
}