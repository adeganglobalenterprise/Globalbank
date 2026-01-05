// Global Bank - International Banking System Database
// Developed by Olawale Abdul-Ganiyu Adeshina
// Email: olawalztegan@gmail.com

class GlobalBankDatabase {
    constructor() {
        this.dbName = 'GlobalBankDB';
        this.version = 1;
        this.db = null;
        this.initPromise = this.initializeDatabase();
    }

    async initializeDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = (event) => {
                console.error('Database error:', event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('Database initialized successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Users Store
                if (!db.objectStoreNames.contains('users')) {
                    const userStore = db.createObjectStore('users', { keyPath: 'id' });
                    userStore.createIndex('email', 'email', { unique: true });
                    userStore.createIndex('accountNumber', 'accountNumber', { unique: true });
                    userStore.createIndex('walletAddress', 'walletAddress', { unique: true });
                    userStore.createIndex('swiftCode', 'swiftCode', { unique: true });
                }

                // Transactions Store
                if (!db.objectStoreNames.contains('transactions')) {
                    const transactionStore = db.createObjectStore('transactions', { keyPath: 'id' });
                    transactionStore.createIndex('userId', 'userId', { unique: false });
                    transactionStore.createIndex('type', 'type', { unique: false });
                    transactionStore.createIndex('status', 'status', { unique: false });
                    transactionStore.createIndex('createdAt', 'createdAt', { unique: false });
                }

                // Crypto Wallets Store
                if (!db.objectStoreNames.contains('cryptoWallets')) {
                    const cryptoStore = db.createObjectStore('cryptoWallets', { keyPath: 'address' });
                    cryptoStore.createIndex('userId', 'userId', { unique: false });
                    cryptoStore.createIndex('coinType', 'coinType', { unique: false });
                    cryptoStore.createIndex('balance', 'balance', { unique: false });
                }

                // Bank Accounts Store
                if (!db.objectStoreNames.contains('bankAccounts')) {
                    const bankStore = db.createObjectStore('bankAccounts', { keyPath: 'accountNumber' });
                    bankStore.createIndex('userId', 'userId', { unique: false });
                    bankStore.createIndex('bankType', 'bankType', { unique: false });
                    bankStore.createIndex('swiftCode', 'swiftCode', { unique: false });
                }

                // Payment Methods Store
                if (!db.objectStoreNames.contains('paymentMethods')) {
                    const paymentStore = db.createObjectStore('paymentMethods', { keyPath: 'id' });
                    paymentStore.createIndex('userId', 'userId', { unique: false });
                    paymentStore.createIndex('type', 'type', { unique: false });
                    paymentStore.createIndex('isDefault', 'isDefault', { unique: false });
                }

                // KYC Documents Store
                if (!db.objectStoreNames.contains('kycDocuments')) {
                    const kycStore = db.createObjectStore('kycDocuments', { keyPath: 'userId' });
                    kycStore.createIndex('status', 'status', { unique: false });
                    kycStore.createIndex('submittedAt', 'submittedAt', { unique: false });
                }

                // Exchange Rates Store
                if (!db.objectStoreNames.contains('exchangeRates')) {
                    const exchangeStore = db.createObjectStore('exchangeRates', { keyPath: 'pair' });
                    exchangeStore.createIndex('from', 'from', { unique: false });
                    exchangeStore.createIndex('to', 'to', { unique: false });
                    exchangeStore.createIndex('updatedAt', 'updatedAt', { unique: false });
                }

                // Mining Operations Store
                if (!db.objectStoreNames.contains('miningOperations')) {
                    const miningStore = db.createObjectStore('miningOperations', { keyPath: 'id' });
                    miningStore.createIndex('userId', 'userId', { unique: false });
                    miningStore.createIndex('status', 'status', { unique: false });
                    miningStore.createIndex('createdAt', 'createdAt', { unique: false });
                }

                // Wallet Folders Store
                if (!db.objectStoreNames.contains('walletFolders')) {
                    const folderStore = db.createObjectStore('walletFolders', { keyPath: 'folderPath' });
                    folderStore.createIndex('userId', 'userId', { unique: false });
                    folderStore.createIndex('type', 'type', { unique: false });
                }

                // System Settings Store
                if (!db.objectStoreNames.contains('systemSettings')) {
                    db.createObjectStore('systemSettings', { keyPath: 'key' });
                }

                // Banking Documents Store
                if (!db.objectStoreNames.contains('bankingDocuments')) {
                    const docStore = db.createObjectStore('bankingDocuments', { keyPath: 'documentId' });
                    docStore.createIndex('documentType', 'documentType', { unique: false });
                    docStore.createIndex('status', 'status', { unique: false });
                }

                console.log('All database stores created');
            };
        });
    }

    async ready() {
        await this.initPromise;
        return this.db;
    }

    // User Operations
    async addUser(user) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readwrite');
            const store = transaction.objectStore('users');
            const request = store.add(user);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getUser(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readonly');
            const store = transaction.objectStore('users');
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getUserByEmail(email) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readonly');
            const store = transaction.objectStore('users');
            const index = store.index('email');
            const request = index.get(email);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async updateUser(user) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readwrite');
            const store = transaction.objectStore('users');
            const request = store.put(user);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllUsers() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['users'], 'readonly');
            const store = transaction.objectStore('users');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Transaction Operations
    async addTransaction(transaction) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['transactions'], 'readwrite');
            const store = tx.objectStore('transactions');
            const request = store.add(transaction);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getTransactions(userId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['transactions'], 'readonly');
            const store = transaction.objectStore('transactions');
            const index = store.index('userId');
            const request = index.getAll(userId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllTransactions() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['transactions'], 'readonly');
            const store = transaction.objectStore('transactions');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Crypto Wallet Operations
    async addCryptoWallet(wallet) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['cryptoWallets'], 'readwrite');
            const store = transaction.objectStore('cryptoWallets');
            const request = store.add(wallet);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getCryptoWallets(userId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['cryptoWallets'], 'readonly');
            const store = transaction.objectStore('cryptoWallets');
            const index = store.index('userId');
            const request = index.getAll(userId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async updateCryptoWallet(wallet) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['cryptoWallets'], 'readwrite');
            const store = transaction.objectStore('cryptoWallets');
            const request = store.put(wallet);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Bank Account Operations
    async addBankAccount(account) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['bankAccounts'], 'readwrite');
            const store = transaction.objectStore('bankAccounts');
            const request = store.add(account);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getBankAccounts(userId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['bankAccounts'], 'readonly');
            const store = transaction.objectStore('bankAccounts');
            const index = store.index('userId');
            const request = index.getAll(userId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Payment Methods Operations
    async addPaymentMethod(method) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['paymentMethods'], 'readwrite');
            const store = transaction.objectStore('paymentMethods');
            const request = store.add(method);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getPaymentMethods(userId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['paymentMethods'], 'readonly');
            const store = transaction.objectStore('paymentMethods');
            const index = store.index('userId');
            const request = index.getAll(userId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // KYC Documents Operations
    async saveKYCDocuments(kycData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['kycDocuments'], 'readwrite');
            const store = transaction.objectStore('kycDocuments');
            const request = store.put(kycData);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getKYCDocuments(userId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['kycDocuments'], 'readonly');
            const store = transaction.objectStore('kycDocuments');
            const request = store.get(userId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Exchange Rates Operations
    async setExchangeRate(pair, rate) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['exchangeRates'], 'readwrite');
            const store = transaction.objectStore('exchangeRates');
            const rateData = {
                pair,
                from: pair.split('/')[0],
                to: pair.split('/')[1],
                rate,
                updatedAt: new Date().toISOString()
            };
            const request = store.put(rateData);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getExchangeRate(pair) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['exchangeRates'], 'readonly');
            const store = transaction.objectStore('exchangeRates');
            const request = store.get(pair);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllExchangeRates() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['exchangeRates'], 'readonly');
            const store = transaction.objectStore('exchangeRates');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Mining Operations
    async addMiningOperation(operation) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['miningOperations'], 'readwrite');
            const store = transaction.objectStore('miningOperations');
            const request = store.add(operation);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getMiningOperations(userId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['miningOperations'], 'readonly');
            const store = transaction.objectStore('miningOperations');
            const index = store.index('userId');
            const request = index.getAll(userId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Wallet Folders Operations
    async createWalletFolder(folder) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['walletFolders'], 'readwrite');
            const store = transaction.objectStore('walletFolders');
            const request = store.add(folder);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getWalletFolders(userId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['walletFolders'], 'readonly');
            const store = transaction.objectStore('walletFolders');
            const index = store.index('userId');
            const request = index.getAll(userId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // System Settings
    async setSetting(key, value) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['systemSettings'], 'readwrite');
            const store = transaction.objectStore('systemSettings');
            const request = store.put({ key, value });

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getSetting(key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['systemSettings'], 'readonly');
            const store = transaction.objectStore('systemSettings');
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result ? request.result.value : null);
            request.onerror = () => reject(request.error);
        });
    }

    // Banking Documents
    async addBankingDocument(document) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['bankingDocuments'], 'readwrite');
            const store = transaction.objectStore('bankingDocuments');
            const request = store.add(document);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getBankingDocuments() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['bankingDocuments'], 'readonly');
            const store = transaction.objectStore('bankingDocuments');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Utility Methods
    generateId() {
        return 'gb_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateAccountNumber() {
        return 'GB' + Math.floor(Math.random() * 9000000000 + 1000000000).toString();
    }

    generateSwiftCode() {
        const banks = ['GBIB', 'GBNK', 'GBMC', 'GBMF', 'GBCB'];
        const countries = ['US', 'UK', 'EU', 'CH', 'SG'];
        const locations = ['NY', 'LD', 'BR', 'ZH', 'SG'];
        const bank = banks[Math.floor(Math.random() * banks.length)];
        const country = countries[Math.floor(Math.random() * countries.length)];
        const location = locations[Math.floor(Math.random() * locations.length)];
        const branch = Math.floor(Math.random() * 900 + 100);
        return `${bank}${country}${location}${branch}`;
    }

    generateWalletAddress(coinType) {
        const prefixes = {
            'BTC': 'bc1q',
            'ETH': '0x',
            'USDT': 'T',
            'USDC': '0x',
            'LTC': 'ltc1',
            'BCH': 'bitcoincash:',
            'XRP': 'r'
        };
        const prefix = prefixes[coinType] || '0x';
        const randomPart = Array.from({ length: 40 }, () => 
            Math.floor(Math.random() * 16).toString(16)
        ).join('');
        return prefix + randomPart;
    }
}

// Initialize database instance
const db = new GlobalBankDatabase();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GlobalBankDatabase;
}