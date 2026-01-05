// Global Bank - International Banking System
// Developed by Olawale Abdul-Ganiyu Adeshina
// Email: olawalztegan@gmail.com

class GlobalBank {
    constructor() {
        this.currentUser = null;
        this.isAdmin = false;
        this.database = null;
        this.miningInterval = null;
        this.dailyCreditInterval = null;
        this.miningActive = false;
        
        // Configuration
        this.CONFIG = {
            APP_NAME: 'Global Bank',
            APP_VERSION: '1.0.0',
            OWNER: 'olawale abdul-ganiyu adeshina',
            EMAIL: 'olawalztegan@gmail.com',
            API_BASE_URL: 'https://api.globalbank-international.com/v1/',
            MINING_RATE: 0.5,
            MINING_INTERVAL: 5000,
            DAILY_CREDIT_AMOUNT: 10.0,
            SWIFT_CODES: {
                US: 'GBIBUSNY',
                UK: 'GBIBUKLD',
                CH: 'GBIBCHZH',
                SG: 'GBIBSGSG',
                NG: 'GBIBNGLA'
            }
        };
        
        this.init();
    }

    async init() {
        console.log(`${this.CONFIG.APP_NAME} initializing...`);
        
        try {
            // Initialize database
            this.database = await new GlobalBankDatabase();
            console.log('Database initialized successfully');
            
            // Attach event listeners
            this.attachEventListeners();
            
            // Initialize exchange rates
            await this.initializeExchangeRates();
            
            // Check for existing session
            await this.checkExistingSession();
            
            // Initialize banking documents
            await this.initializeBankingDocuments();
            
            console.log(`${this.CONFIG.APP_NAME} initialized successfully`);
            
        } catch (error) {
            console.error('Initialization error:', error);
            this.showNotification('Error initializing application. Please refresh.', 'danger');
        }
    }

    attachEventListeners() {
        // Page Navigation
        document.getElementById('showRegister').addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('registerPage');
        });

        document.getElementById('showLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('loginPage');
        });

        document.getElementById('showAdminLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('adminLoginPage');
        });

        document.getElementById('showCustomerLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('loginPage');
        });

        // Forms
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('adminLoginForm').addEventListener('submit', (e) => this.handleAdminLogin(e));

        // Dashboard Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                if (section) {
                    this.navigateToSection(section);
                }
            });
        });

        // Customer Dashboard
        document.getElementById('customerLogoutBtn').addEventListener('click', () => this.logout());

        // Quick Actions
        document.getElementById('quickAddFunds').addEventListener('click', () => this.showAddFundsModal());
        document.getElementById('quickSendMoney').addEventListener('click', () => this.showSendMoneyModal());
        document.getElementById('quickExchange').addEventListener('click', () => this.navigateToSection('exchange'));
        document.getElementById('quickMining').addEventListener('click', () => this.navigateToSection('mining'));
        document.getElementById('quickCrypto').addEventListener('click', () => this.navigateToSection('crypto'));
        document.getElementById('quickKYC').addEventListener('click', () => this.navigateToSection('kyc'));

        // Banking Services
        document.getElementById('swiftTransferBtn').addEventListener('click', () => this.showSWIFTTransferModal());
        document.getElementById('swissBankingBtn').addEventListener('click', () => this.showSwissBankingModal());
        document.getElementById('commercialBankingBtn').addEventListener('click', () => this.showCommercialBankingModal());
        document.getElementById('microfinanceBtn').addEventListener('click', () => this.showMicrofinanceModal());

        // Crypto Wallets
        document.querySelectorAll('.send-crypto-btn').forEach(btn => {
            btn.addEventListener('click', () => this.showSendCryptoModal(btn.dataset.coin));
        });

        document.querySelectorAll('.receive-crypto-btn').forEach(btn => {
            btn.addEventListener('click', () => this.showReceiveCryptoModal(btn.dataset.coin));
        });

        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', () => this.copyAddress(btn.dataset.wallet));
        });

        // Mining
        document.getElementById('miningToggle').addEventListener('change', (e) => this.toggleMining(e.target.checked));

        // Exchange
        document.getElementById('exchangeFromCurrency').addEventListener('change', () => this.updateExchangeRate());
        document.getElementById('exchangeToCurrency').addEventListener('change', () => this.updateExchangeRate());
        document.getElementById('exchangeFromAmount').addEventListener('input', () => this.calculateExchange());
        document.getElementById('exchangeBtn').addEventListener('click', () => this.executeExchange());

        // Transfers
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.showTransferTab(btn.dataset.tab));
        });

        document.getElementById('bankTransferForm').addEventListener('submit', (e) => this.handleBankTransfer(e));
        document.getElementById('cryptoTransferForm').addEventListener('submit', (e) => this.handleCryptoTransfer(e));
        document.getElementById('walletTransferForm').addEventListener('submit', (e) => this.handleWalletTransfer(e));

        // KYC
        document.getElementById('kycForm').addEventListener('submit', (e) => this.handleKYCSubmission(e));

        // Documents
        document.querySelectorAll('.view-doc-btn').forEach(btn => {
            btn.addEventListener('click', () => this.viewDocument(btn.dataset.doc));
        });

        // Admin Dashboard
        document.getElementById('adminLogoutBtn').addEventListener('click', () => this.logout());

        // Modals
        document.getElementById('closeDocumentModal').addEventListener('click', () => this.closeModal('documentModal'));
        document.getElementById('closeGeneralModal').addEventListener('click', () => this.closeModal('generalModal'));
    }

    showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');
    }

    async checkExistingSession() {
        const session = localStorage.getItem('globalbank_session');
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                this.currentUser = sessionData.user;
                this.isAdmin = sessionData.isAdmin;
                
                if (this.isAdmin) {
                    await this.showAdminDashboard();
                } else {
                    await this.showCustomerDashboard();
                }
            } catch (error) {
                console.error('Session error:', error);
                localStorage.removeItem('globalbank_session');
            }
        } else {
            this.showPage('loginPage');
        }
    }

    // Authentication Methods
    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const user = await this.database.getUserByEmail(email);
            
            if (user && user.password === password) {
                this.currentUser = user;
                this.isAdmin = false;
                this.saveSession();
                await this.showCustomerDashboard();
                this.showNotification('Login successful!', 'success');
            } else {
                this.showNotification('Invalid email or password', 'danger');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Login failed. Please try again.', 'danger');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const fullName = document.getElementById('regFullName').value;
        const email = document.getElementById('regEmail').value;
        const phone = document.getElementById('regPhone').value;
        const country = document.getElementById('regCountry').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;

        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'danger');
            return;
        }

        try {
            const existingUser = await this.database.getUserByEmail(email);
            if (existingUser) {
                this.showNotification('Email already registered', 'danger');
                return;
            }

            const user = {
                id: this.database.generateId(),
                fullName,
                email,
                phone,
                country,
                password,
                accountNumber: this.database.generateAccountNumber(),
                swiftCode: this.database.generateSwiftCode(),
                bankBalance: 0.0,
                cryptoBalance: 0.0,
                btcBalance: 0.0,
                ethBalance: 0.0,
                usdtBalance: 0.0,
                walletAddress: this.database.generateWalletAddress('BTC'),
                isVerified: false,
                isAdmin: false,
                createdAt: new Date().toISOString()
            };

            await this.database.addUser(user);
            
            // Create wallet folder for user
            await this.database.createWalletFolder({
                folderPath: `/wallets/${user.id}`,
                userId: user.id,
                type: 'crypto',
                createdAt: new Date().toISOString()
            });

            this.showNotification('Account created successfully!', 'success');
            document.getElementById('registerForm').reset();
            this.showPage('loginPage');
        } catch (error) {
            console.error('Registration error:', error);
            this.showNotification('Registration failed. Please try again.', 'danger');
        }
    }

    async handleAdminLogin(e) {
        e.preventDefault();
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;

        // Admin credentials
        if (email === this.CONFIG.EMAIL && password === 'admin123') {
            this.isAdmin = true;
            this.currentUser = {
                id: 'admin',
                fullName: 'Olawale Abdul-Ganiyu Adeshina',
                email: email
            };
            this.saveSession();
            await this.showAdminDashboard();
            this.showNotification('Admin login successful!', 'success');
        } else {
            this.showNotification('Invalid admin credentials', 'danger');
        }
    }

    logout() {
        this.stopMining();
        this.currentUser = null;
        this.isAdmin = false;
        localStorage.removeItem('globalbank_session');
        this.showPage('loginPage');
        this.showNotification('Logged out successfully', 'success');
    }

    saveSession() {
        const sessionData = {
            user: this.currentUser,
            isAdmin: this.isAdmin
        };
        localStorage.setItem('globalbank_session', JSON.stringify(sessionData));
    }

    // Dashboard Methods
    async showCustomerDashboard() {
        this.showPage('customerDashboardPage');
        document.getElementById('customerUserName').textContent = `Welcome, ${this.currentUser.fullName}`;
        
        await this.updateDashboardUI();
        await this.loadRecentTransactions();
        
        // Start daily credit system
        this.startDailyCredit();
    }

    async updateDashboardUI() {
        if (this.currentUser) {
            document.getElementById('totalBankBalance').textContent = this.formatCurrency(this.currentUser.bankBalance);
            document.getElementById('totalCryptoBalance').textContent = this.formatCrypto(this.currentUser.cryptoBalance);
            document.getElementById('customerAccountNumber').textContent = this.currentUser.accountNumber || '-';
            
            // Update crypto wallet displays
            document.getElementById('btcBalance').textContent = this.formatCrypto(this.currentUser.btcBalance);
            document.getElementById('ethBalance').textContent = this.formatCrypto(this.currentUser.ethBalance);
            document.getElementById('usdtBalance').textContent = this.formatCrypto(this.currentUser.usdtBalance);
            document.getElementById('cryptoTotalBalance').textContent = this.formatCrypto(this.currentUser.cryptoBalance);
        }
    }

    async loadRecentTransactions() {
        try {
            const transactions = await this.database.getTransactions(this.currentUser.id);
            const recentTransactions = transactions.slice(-10).reverse();

            const transactionsList = document.getElementById('recentTransactionsList');
            
            if (recentTransactions.length === 0) {
                transactionsList.innerHTML = '<p class="no-data">No transactions yet</p>';
                return;
            }

            transactionsList.innerHTML = recentTransactions.map(transaction => `
                <div class="transaction-item">
                    <div class="transaction-info">
                        <span class="transaction-type">${this.getTransactionTypeText(transaction.type)}</span>
                        <span class="transaction-date">${this.formatDate(transaction.createdAt)}</span>
                    </div>
                    <span class="transaction-amount ${transaction.type === 'credit' ? 'credit' : 'debit'}">
                        ${transaction.type === 'credit' ? '+' : '-'}${this.formatAmount(transaction.amount, transaction.currency)}
                    </span>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading transactions:', error);
        }
    }

    navigateToSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show selected section
        const targetSection = document.getElementById(sectionId + 'Section');
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === sectionId) {
                item.classList.add('active');
            }
        });
    }

    // Banking Methods
    showAddFundsModal() {
        const modalContent = `
            <form id="addFundsForm">
                <div class="form-group">
                    <label for="fundSource">Fund Source</label>
                    <select id="fundSource" required>
                        <option value="mastercard">MasterCard</option>
                        <option value="visa">Visa</option>
                        <option value="versa">Versa</option>
                        <option value="giftcard">Gift Card</option>
                        <option value="paypal">PayPal</option>
                        <option value="payeer">Payeer</option>
                        <option value="westernunion">Western Union</option>
                        <option value="skrill">Skrill</option>
                        <option value="coinbase">Coinbase</option>
                        <option value="blockchain">Blockchain</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="fundAmount">Amount ($)</label>
                    <input type="number" id="fundAmount" placeholder="Enter amount" step="0.01" min="0" required>
                </div>
                <div class="form-group">
                    <label for="cardNumber">Card/Wallet Number</label>
                    <input type="text" id="cardNumber" placeholder="Enter card or wallet number" required>
                </div>
                <button type="submit" class="btn btn-primary">Add Funds</button>
            </form>
        `;

        this.showModal('Add Funds', modalContent);
        document.getElementById('addFundsForm').addEventListener('submit', (e) => this.handleAddFunds(e));
    }

    async handleAddFunds(e) {
        e.preventDefault();
        const source = document.getElementById('fundSource').value;
        const amount = parseFloat(document.getElementById('fundAmount').value);
        const cardNumber = document.getElementById('cardNumber').value;

        if (amount <= 0) {
            this.showNotification('Please enter a valid amount', 'danger');
            return;
        }

        try {
            // Add transaction
            await this.addTransaction('credit', amount, 'USD', `Funds added via ${source}`);

            // Update user balance
            this.currentUser.bankBalance += amount;
            await this.database.updateUser(this.currentUser);

            // Save payment method
            await this.database.addPaymentMethod({
                id: this.database.generateId(),
                userId: this.currentUser.id,
                type: source,
                identifier: cardNumber,
                isDefault: false,
                createdAt: new Date().toISOString()
            });

            await this.updateDashboardUI();
            await this.loadRecentTransactions();
            this.closeModal('generalModal');
            this.showNotification(`$${this.formatCurrency(amount)} added to your account`, 'success');
        } catch (error) {
            console.error('Add funds error:', error);
            this.showNotification('Failed to add funds. Please try again.', 'danger');
        }
    }

    showSendMoneyModal() {
        const modalContent = `
            <form id="sendMoneyForm">
                <div class="form-group">
                    <label for="sendMethod">Send Method</label>
                    <select id="sendMethod" required>
                        <option value="bank">Bank Transfer</option>
                        <option value="wallet">Wallet Transfer</option>
                        <option value="email">Email Transfer</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="recipientInfo">Recipient Account/Email</label>
                    <input type="text" id="recipientInfo" placeholder="Enter account number or email" required>
                </div>
                <div class="form-group">
                    <label for="sendAmount">Amount ($)</label>
                    <input type="number" id="sendAmount" placeholder="Enter amount" step="0.01" min="0" required>
                </div>
                <div class="form-group">
                    <label for="sendDescription">Description</label>
                    <input type="text" id="sendDescription" placeholder="Enter description">
                </div>
                <button type="submit" class="btn btn-primary">Send Money</button>
            </form>
        `;

        this.showModal('Send Money', modalContent);
        document.getElementById('sendMoneyForm').addEventListener('submit', (e) => this.handleSendMoney(e));
    }

    async handleSendMoney(e) {
        e.preventDefault();
        const method = document.getElementById('sendMethod').value;
        const recipient = document.getElementById('recipientInfo').value;
        const amount = parseFloat(document.getElementById('sendAmount').value);
        const description = document.getElementById('sendDescription').value || 'Transfer';

        if (amount <= 0) {
            this.showNotification('Please enter a valid amount', 'danger');
            return;
        }

        if (amount > this.currentUser.bankBalance) {
            this.showNotification('Insufficient balance', 'danger');
            return;
        }

        try {
            // Add transaction
            await this.addTransaction('debit', amount, 'USD', `Transfer to ${recipient} via ${method} - ${description}`);

            // Update user balance
            this.currentUser.bankBalance -= amount;
            await this.database.updateUser(this.currentUser);

            await this.updateDashboardUI();
            await this.loadRecentTransactions();
            this.closeModal('generalModal');
            this.showNotification(`$${this.formatCurrency(amount)} sent successfully`, 'success');
        } catch (error) {
            console.error('Send money error:', error);
            this.showNotification('Failed to send money. Please try again.', 'danger');
        }
    }

    // Banking Services
    showSWIFTTransferModal() {
        const modalContent = `
            <div class="swift-info">
                <h3>SWIFT Transfer</h3>
                <p>Send money globally using the SWIFT network</p>
                <div class="swift-details">
                    <p><strong>Your SWIFT Code:</strong> ${this.currentUser.swiftCode}</p>
                    <p><strong>Your Account Number:</strong> ${this.currentUser.accountNumber}</p>
                </div>
            </div>
            <form id="swiftForm" style="margin-top: 1rem;">
                <div class="form-group">
                    <label for="swiftBank">Recipient Bank</label>
                    <input type="text" id="swiftBank" placeholder="Enter bank name" required>
                </div>
                <div class="form-group">
                    <label for="swiftCode">Recipient SWIFT Code</label>
                    <input type="text" id="swiftCode" placeholder="Enter SWIFT code" required>
                </div>
                <div class="form-group">
                    <label for="swiftAccount">Recipient Account Number</label>
                    <input type="text" id="swiftAccount" placeholder="Enter account number" required>
                </div>
                <div class="form-group">
                    <label for="swiftAmount">Amount ($)</label>
                    <input type="number" id="swiftAmount" placeholder="Enter amount" step="0.01" min="0" required>
                </div>
                <button type="submit" class="btn btn-primary">Send SWIFT Transfer</button>
            </form>
        `;

        this.showModal('SWIFT Transfer', modalContent);
        document.getElementById('swiftForm').addEventListener('submit', (e) => this.handleSWIFTTransfer(e));
    }

    async handleSWIFTTransfer(e) {
        e.preventDefault();
        const bank = document.getElementById('swiftBank').value;
        const swiftCode = document.getElementById('swiftCode').value;
        const account = document.getElementById('swiftAccount').value;
        const amount = parseFloat(document.getElementById('swiftAmount').value);

        if (amount <= 0) {
            this.showNotification('Please enter a valid amount', 'danger');
            return;
        }

        if (amount > this.currentUser.bankBalance) {
            this.showNotification('Insufficient balance', 'danger');
            return;
        }

        try {
            await this.addTransaction('debit', amount, 'USD', `SWIFT transfer to ${account} at ${bank}`);
            this.currentUser.bankBalance -= amount;
            await this.database.updateUser(this.currentUser);

            await this.updateDashboardUI();
            await this.loadRecentTransactions();
            this.closeModal('generalModal');
            this.showNotification('SWIFT transfer initiated successfully', 'success');
        } catch (error) {
            console.error('SWIFT transfer error:', error);
            this.showNotification('Failed to initiate SWIFT transfer', 'danger');
        }
    }

    showSwissBankingModal() {
        const modalContent = `
            <div class="swiss-banking-info">
                <h3>Swiss Banking Services</h3>
                <p>Access premium Swiss banking services</p>
                <ul>
                    <li>Secure wealth management</li>
                    <li>International investment options</li>
                    <li>Multi-currency accounts</li>
                    <li>Premium customer service</li>
                </ul>
            </div>
            <div style="margin-top: 1rem;">
                <button class="btn btn-primary" onclick="app.closeModal('generalModal')">I Understand</button>
            </div>
        `;

        this.showModal('Swiss Banking', modalContent);
    }

    showCommercialBankingModal() {
        const modalContent = `
            <div class="commercial-banking-info">
                <h3>Commercial Banking</h3>
                <p>Business and corporate banking solutions</p>
                <ul>
                    <li>Business accounts</li>
                    <li>Loans and financing</li>
                    <li>Trade finance</li>
                    <li>Cash management</li>
                </ul>
            </div>
            <div style="margin-top: 1rem;">
                <button class="btn btn-primary" onclick="app.closeModal('generalModal')">I Understand</button>
            </div>
        `;

        this.showModal('Commercial Banking', modalContent);
    }

    showMicrofinanceModal() {
        const modalContent = `
            <div class="microfinance-info">
                <h3>Microfinance Services</h3>
                <p>Micro loans and financial services</p>
                <ul>
                    <li>Small business loans</li>
                    <li>Personal loans</li>
                    <li>Savings accounts</li>
                    <li>Financial education</li>
                </ul>
            </div>
            <div style="margin-top: 1rem;">
                <button class="btn btn-primary" onclick="app.closeModal('generalModal')">I Understand</button>
            </div>
        `;

        this.showModal('Microfinance', modalContent);
    }

    // Crypto Wallet Methods
    showSendCryptoModal(coinType) {
        const modalContent = `
            <form id="sendCryptoForm">
                <div class="form-group">
                    <label>Cryptocurrency</label>
                    <input type="text" value="${coinType}" readonly>
                </div>
                <div class="form-group">
                    <label for="recipientWallet">Recipient Wallet Address</label>
                    <input type="text" id="recipientWallet" placeholder="Enter wallet address" required>
                </div>
                <div class="form-group">
                    <label for="cryptoAmount">Amount</label>
                    <input type="number" id="cryptoAmount" placeholder="Enter amount" step="0.00000001" min="0" required>
                </div>
                <button type="submit" class="btn btn-primary">Send ${coinType}</button>
            </form>
        `;

        this.showModal(`Send ${coinType}`, modalContent);
        document.getElementById('sendCryptoForm').addEventListener('submit', (e) => this.handleSendCrypto(e, coinType));
    }

    async handleSendCrypto(e, coinType) {
        e.preventDefault();
        const wallet = document.getElementById('recipientWallet').value;
        const amount = parseFloat(document.getElementById('cryptoAmount').value);

        if (amount <= 0) {
            this.showNotification('Please enter a valid amount', 'danger');
            return;
        }

        // Check balance
        const balanceField = `${coinType.toLowerCase()}Balance`;
        if (amount > this.currentUser[balanceField]) {
            this.showNotification('Insufficient crypto balance', 'danger');
            return;
        }

        try {
            // Add transaction
            await this.addTransaction('debit', amount, coinType, `Send ${coinType} to ${wallet}`);

            // Update user balance
            this.currentUser[balanceField] -= amount;
            this.currentUser.cryptoBalance -= amount;
            await this.database.updateUser(this.currentUser);

            await this.updateDashboardUI();
            await this.loadRecentTransactions();
            this.closeModal('generalModal');
            this.showNotification(`${amount} ${coinType} sent successfully`, 'success');
        } catch (error) {
            console.error('Send crypto error:', error);
            this.showNotification('Failed to send crypto', 'danger');
        }
    }

    showReceiveCryptoModal(coinType) {
        let walletAddress = '';
        switch(coinType) {
            case 'BTC':
                walletAddress = document.getElementById('btcAddress').value;
                break;
            case 'ETH':
                walletAddress = document.getElementById('ethAddress').value;
                break;
            case 'USDT':
                walletAddress = document.getElementById('usdtAddress').value;
                break;
        }

        const modalContent = `
            <div class="receive-crypto-info">
                <h3>Receive ${coinType}</h3>
                <div class="wallet-address-display">
                    <label>Your ${coinType} Wallet Address:</label>
                    <input type="text" value="${walletAddress}" readonly>
                    <button class="btn btn-sm" onclick="navigator.clipboard.writeText('${walletAddress}'); app.showNotification('Address copied!', 'success')">Copy</button>
                </div>
                <p style="margin-top: 1rem; color: var(--text-muted);">
                    Share this address to receive ${coinType} from other wallets or exchanges.
                </p>
            </div>
        `;

        this.showModal(`Receive ${coinType}`, modalContent);
    }

    copyAddress(walletType) {
        let address = '';
        switch(walletType) {
            case 'btc':
                address = document.getElementById('btcAddress').value;
                break;
            case 'eth':
                address = document.getElementById('ethAddress').value;
                break;
            case 'usdt':
                address = document.getElementById('usdtAddress').value;
                break;
        }
        
        navigator.clipboard.writeText(address);
        this.showNotification('Address copied to clipboard', 'success');
    }

    // Mining Methods
    toggleMining(active) {
        this.miningActive = active;
        const statusText = document.getElementById('miningStatusText');
        
        if (active) {
            statusText.textContent = 'ON';
            statusText.style.color = 'var(--success-color)';
            this.startMining();
        } else {
            statusText.textContent = 'OFF';
            statusText.style.color = 'var(--text-muted)';
            this.stopMining();
        }
    }

    startMining() {
        if (this.miningInterval) return;
        
        let miningTime = 0;
        
        this.miningInterval = setInterval(async () => {
            try {
                // Add 0.5 coins to balance
                const miningAmount = this.CONFIG.MINING_RATE;
                this.currentUser.cryptoBalance += miningAmount;
                this.currentUser.btcBalance += miningAmount;
                
                // Update database
                await this.database.updateUser(this.currentUser);
                
                // Add mining operation record
                await this.database.addMiningOperation({
                    id: this.database.generateId(),
                    userId: this.currentUser.id,
                    amount: miningAmount,
                    status: 'completed',
                    createdAt: new Date().toISOString()
                });
                
                // Add transaction
                await this.addTransaction('credit', miningAmount, 'BTC', 'Mining reward');
                
                // Update UI
                await this.updateDashboardUI();
                
                // Update mining time
                miningTime += this.CONFIG.MINING_INTERVAL / 1000;
                document.getElementById('miningTime').textContent = this.formatTime(miningTime);
                document.getElementById('totalMined').textContent = this.formatCrypto(this.currentUser.cryptoBalance);
                
                // Load mining operations
                await this.loadMiningOperations();
                
                console.log(`Mining: +${miningAmount} BTC added`);
                
            } catch (error) {
                console.error('Mining error:', error);
            }
        }, this.CONFIG.MINING_INTERVAL);
        
        this.showNotification('Mining started! 0.5 BTC will be added every 5 seconds', 'success');
    }

    stopMining() {
        if (this.miningInterval) {
            clearInterval(this.miningInterval);
            this.miningInterval = null;
            this.showNotification('Mining stopped', 'info');
        }
    }

    async loadMiningOperations() {
        try {
            const operations = await this.database.getMiningOperations(this.currentUser.id);
            const recentOperations = operations.slice(-10).reverse();

            const operationsList = document.getElementById('miningOperationsList');
            
            if (recentOperations.length === 0) {
                operationsList.innerHTML = '<p class="no-data">No mining operations yet</p>';
                return;
            }

            operationsList.innerHTML = recentOperations.map(op => `
                <div class="transaction-item">
                    <div class="transaction-info">
                        <span class="transaction-type">Mining Reward</span>
                        <span class="transaction-date">${this.formatDate(op.createdAt)}</span>
                    </div>
                    <span class="transaction-amount credit">+${this.formatCrypto(op.amount)} BTC</span>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading mining operations:', error);
        }
    }

    // Daily Credit System
    startDailyCredit() {
        const checkDailyCredit = async () => {
            const today = new Date().toDateString();
            const lastCredit = await this.database.getSetting('lastDailyCredit');
            
            if (lastCredit !== today) {
                try {
                    // Add daily credit
                    const creditAmount = this.CONFIG.DAILY_CREDIT_AMOUNT;
                    this.currentUser.bankBalance += creditAmount;
                    await this.database.updateUser(this.currentUser);
                    
                    // Add transaction
                    await this.addTransaction('credit', creditAmount, 'USD', 'Daily credit bonus');
                    
                    // Update last credit date
                    await this.database.setSetting('lastDailyCredit', today);
                    
                    await this.updateDashboardUI();
                    await this.loadRecentTransactions();
                    
                    this.showNotification(`Daily credit of $${this.formatCurrency(creditAmount)} added!`, 'success');
                } catch (error) {
                    console.error('Daily credit error:', error);
                }
            }
        };

        // Check immediately and then every hour
        checkDailyCredit();
        this.dailyCreditInterval = setInterval(checkDailyCredit, 3600000);
    }

    // Exchange Methods
    async initializeExchangeRates() {
        const rates = [
            { pair: 'USD/BTC', rate: 0.000015 },
            { pair: 'USD/ETH', rate: 0.00032 },
            { pair: 'USD/USDT', rate: 1.0 },
            { pair: 'EUR/USD', rate: 1.08 },
            { pair: 'GBP/USD', rate: 1.27 },
            { pair: 'BTC/USD', rate: 66666.67 },
            { pair: 'ETH/USD', rate: 3125.00 },
            { pair: 'USDT/USD', rate: 1.0 },
            { pair: 'BTC/ETH', rate: 21.33 },
            { pair: 'ETH/BTC', rate: 0.0469 }
        ];

        for (const rate of rates) {
            await this.database.setExchangeRate(rate.pair, rate.rate);
        }

        this.updateExchangeRate();
    }

    async updateExchangeRate() {
        const fromCurrency = document.getElementById('exchangeFromCurrency').value;
        const toCurrency = document.getElementById('exchangeToCurrency').value;
        const pair = `${fromCurrency}/${toCurrency}`;
        
        const rateData = await this.database.getExchangeRate(pair);
        
        if (rateData) {
            document.getElementById('exchangeRateDisplay').textContent = 
                `1 ${fromCurrency} = ${rateData.rate} ${toCurrency}`;
            this.calculateExchange();
        }
    }

    calculateExchange() {
        const fromAmount = parseFloat(document.getElementById('exchangeFromAmount').value) || 0;
        const fromCurrency = document.getElementById('exchangeFromCurrency').value;
        const toCurrency = document.getElementById('exchangeToCurrency').value;
        const pair = `${fromCurrency}/${toCurrency}`;
        
        // Get rate from display
        const rateText = document.getElementById('exchangeRateDisplay').textContent;
        const rateMatch = rateText.match(/[\d.]+$/);
        
        if (rateMatch && fromAmount > 0) {
            const rate = parseFloat(rateMatch[0]);
            const toAmount = (fromAmount * rate).toFixed(8);
            document.getElementById('exchangeToAmount').value = toAmount;
        }
    }

    async executeExchange() {
        const fromAmount = parseFloat(document.getElementById('exchangeFromAmount').value);
        const fromCurrency = document.getElementById('exchangeFromCurrency').value;
        const toCurrency = document.getElementById('exchangeToCurrency').value;
        const toAmount = parseFloat(document.getElementById('exchangeToAmount').value);

        if (!fromAmount || fromAmount <= 0) {
            this.showNotification('Please enter a valid amount', 'danger');
            return;
        }

        try {
            // Check if user has sufficient balance
            if (fromCurrency === 'USD' || fromCurrency === 'EUR' || fromCurrency === 'GBP') {
                if (fromAmount > this.currentUser.bankBalance) {
                    this.showNotification('Insufficient balance', 'danger');
                    return;
                }
                this.currentUser.bankBalance -= fromAmount;
            } else {
                const balanceField = `${fromCurrency.toLowerCase()}Balance`;
                if (fromAmount > this.currentUser[balanceField]) {
                    this.showNotification('Insufficient crypto balance', 'danger');
                    return;
                }
                this.currentUser[balanceField] -= fromAmount;
                this.currentUser.cryptoBalance -= fromAmount;
            }

            // Add to destination balance
            if (toCurrency === 'USD' || toCurrency === 'EUR' || toCurrency === 'GBP') {
                this.currentUser.bankBalance += toAmount;
            } else {
                const balanceField = `${toCurrency.toLowerCase()}Balance`;
                this.currentUser[balanceField] += toAmount;
                this.currentUser.cryptoBalance += toAmount;
            }

            await this.database.updateUser(this.currentUser);
            await this.addTransaction('debit', fromAmount, fromCurrency, `Exchange ${fromCurrency} to ${toCurrency}`);
            await this.addTransaction('credit', toAmount, toCurrency, `Exchange from ${fromCurrency}`);

            await this.updateDashboardUI();
            document.getElementById('exchangeFromAmount').value = '';
            document.getElementById('exchangeToAmount').value = '';

            this.showNotification(`Exchanged ${fromAmount} ${fromCurrency} to ${toAmount} ${toCurrency}`, 'success');
        } catch (error) {
            console.error('Exchange error:', error);
            this.showNotification('Exchange failed. Please try again.', 'danger');
        }
    }

    // Transfer Methods
    showTransferTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.transfer-form').forEach(form => form.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(tabId).classList.add('active');
    }

    async handleBankTransfer(e) {
        e.preventDefault();
        const bank = document.getElementById('recipientBank').value;
        const account = document.getElementById('recipientAccount').value;
        const swift = document.getElementById('recipientSwift').value;
        const email = document.getElementById('recipientEmail').value;
        const amount = parseFloat(document.getElementById('transferAmount').value);
        const description = document.getElementById('transferDescription').value || 'Bank transfer';

        if (amount <= 0) {
            this.showNotification('Please enter a valid amount', 'danger');
            return;
        }

        if (amount > this.currentUser.bankBalance) {
            this.showNotification('Insufficient balance', 'danger');
            return;
        }

        try {
            await this.addTransaction('debit', amount, 'USD', `Transfer to ${account} at ${bank} - ${description}`);
            this.currentUser.bankBalance -= amount;
            await this.database.updateUser(this.currentUser);

            await this.updateDashboardUI();
            await this.loadRecentTransactions();
            document.getElementById('bankTransferForm').reset();

            this.showNotification(`Bank transfer of $${this.formatCurrency(amount)} sent successfully`, 'success');
        } catch (error) {
            console.error('Bank transfer error:', error);
            this.showNotification('Transfer failed. Please try again.', 'danger');
        }
    }

    async handleCryptoTransfer(e) {
        e.preventDefault();
        const coinType = document.getElementById('cryptoCoinType').value;
        const wallet = document.getElementById('recipientWalletAddress').value;
        const amount = parseFloat(document.getElementById('cryptoTransferAmount').value);

        if (amount <= 0) {
            this.showNotification('Please enter a valid amount', 'danger');
            return;
        }

        const balanceField = `${coinType.toLowerCase()}Balance`;
        if (amount > this.currentUser[balanceField]) {
            this.showNotification('Insufficient crypto balance', 'danger');
            return;
        }

        try {
            await this.addTransaction('debit', amount, coinType, `Crypto transfer to ${wallet}`);
            this.currentUser[balanceField] -= amount;
            this.currentUser.cryptoBalance -= amount;
            await this.database.updateUser(this.currentUser);

            await this.updateDashboardUI();
            await this.loadRecentTransactions();
            document.getElementById('cryptoTransferForm').reset();

            this.showNotification(`${amount} ${coinType} sent successfully`, 'success');
        } catch (error) {
            console.error('Crypto transfer error:', error);
            this.showNotification('Transfer failed. Please try again.', 'danger');
        }
    }

    async handleWalletTransfer(e) {
        e.preventDefault();
        const email = document.getElementById('walletRecipientEmail').value;
        const amount = parseFloat(document.getElementById('walletTransferAmount').value);

        if (amount <= 0) {
            this.showNotification('Please enter a valid amount', 'danger');
            return;
        }

        if (amount > this.currentUser.bankBalance) {
            this.showNotification('Insufficient balance', 'danger');
            return;
        }

        try {
            await this.addTransaction('debit', amount, 'USD', `Wallet transfer to ${email}`);
            this.currentUser.bankBalance -= amount;
            await this.database.updateUser(this.currentUser);

            await this.updateDashboardUI();
            await this.loadRecentTransactions();
            document.getElementById('walletTransferForm').reset();

            this.showNotification(`$${this.formatCurrency(amount)} sent to ${email}`, 'success');
        } catch (error) {
            console.error('Wallet transfer error:', error);
            this.showNotification('Transfer failed. Please try again.', 'danger');
        }
    }

    // KYC Methods
    async handleKYCSubmission(e) {
        e.preventDefault();
        const fullName = document.getElementById('kycFullName').value;
        const dob = document.getElementById('kycDateOfBirth').value;
        const address = document.getElementById('kycAddress').value;
        const city = document.getElementById('kycCity').value;
        const country = document.getElementById('kycCountry').value;
        const phone = document.getElementById('kycPhoneNumber').value;
        const passportFile = document.getElementById('kycPassport').files[0];
        const idCardFile = document.getElementById('kycIdCard').files[0];

        try {
            // Read files
            const passportData = await this.readFileAsDataURL(passportFile);
            const idCardData = idCardFile ? await this.readFileAsDataURL(idCardFile) : null;

            // Save KYC documents
            const kycData = {
                userId: this.currentUser.id,
                fullName,
                dateOfBirth: dob,
                address,
                city,
                country,
                phone,
                passportPhoto: passportData,
                idCard: idCardData,
                status: 'pending',
                submittedAt: new Date().toISOString(),
                verifiedAt: null
            };

            await this.database.saveKYCDocuments(kycData);

            // Update user verification status
            this.currentUser.isVerified = true; // Auto-approve for demo
            await this.database.updateUser(this.currentUser);

            // Update UI
            document.getElementById('kycStatus').textContent = 'Pending Review';
            document.getElementById('kycStatusBadge').textContent = 'Pending';
            document.getElementById('kycSubmittedDate').textContent = this.formatDate(new Date());

            this.showNotification('KYC documents submitted successfully!', 'success');
            document.getElementById('kycForm').reset();
        } catch (error) {
            console.error('KYC submission error:', error);
            this.showNotification('Failed to submit KYC documents', 'danger');
        }
    }

    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Banking Documents
    async initializeBankingDocuments() {
        const documents = [
            {
                documentId: 'trademark',
                documentType: 'trademark',
                title: 'Trademark Approval Certificate',
                content: this.generateTrademarkDocument(),
                status: 'approved',
                createdAt: new Date().toISOString()
            },
            {
                documentId: 'financial-law',
                documentType: 'financial-law',
                title: 'Financial Law Permit',
                content: this.generateFinancialLawDocument(),
                status: 'approved',
                createdAt: new Date().toISOString()
            },
            {
                documentId: 'world-bank',
                documentType: 'world-bank-permit',
                title: 'World Bank Operating Permit',
                content: this.generateWorldBankDocument(),
                status: 'approved',
                createdAt: new Date().toISOString()
            },
            {
                documentId: 'banking-license',
                documentType: 'banking-license',
                title: 'Full Banking License',
                content: this.generateBankingLicenseDocument(),
                status: 'approved',
                createdAt: new Date().toISOString()
            },
            {
                documentId: 'business-registration',
                documentType: 'business-registration',
                title: 'Business Registration Certificate',
                content: this.generateBusinessRegistrationDocument(),
                status: 'approved',
                createdAt: new Date().toISOString()
            },
            {
                documentId: 'business-agreement',
                documentType: 'business-agreement',
                title: 'Business Agreement',
                content: this.generateBusinessAgreementDocument(),
                status: 'approved',
                createdAt: new Date().toISOString()
            }
        ];

        for (const doc of documents) {
            await this.database.addBankingDocument(doc);
        }
    }

    viewDocument(docId) {
        this.database.getBankingDocuments().then(documents => {
            const document = documents.find(d => d.documentId === docId);
            if (document) {
                document.getElementById('documentModalTitle').textContent = document.title;
                document.getElementById('documentModalBody').innerHTML = document.content;
                document.getElementById('documentModal').classList.remove('hidden');
            }
        });
    }

    generateTrademarkDocument() {
        return `
            <div class="document-content">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <h1 style="color: var(--primary-color);">TRADEMARK APPROVAL CERTIFICATE</h1>
                    <p style="font-size: 1.2rem; color: var(--text-muted);">United States Patent and Trademark Office</p>
                </div>
                
                <div style="background: var(--background); padding: 2rem; border-radius: 8px; margin-bottom: 2rem;">
                    <p><strong>Registration Number:</strong> GB-2025-00001</p>
                    <p><strong>Registration Date:</strong> January 1, 2025</p>
                    <p><strong>Trademark Name:</strong> GLOBAL BANK</p>
                    <p><strong>Owner:</strong> Olawale Abdul-Ganiyu Adeshina</p>
                    <p><strong>Owner Address:</strong> International Banking Center, New York, NY 10001, USA</p>
                    <p><strong>Owner Email:</strong> olawalztegan@gmail.com</p>
                </div>

                <div style="text-align: center; margin: 2rem 0;">
                    <p style="font-size: 1.1rem;"><strong>CERTIFICATE OF REGISTRATION</strong></p>
                    <p>This is to certify that the trademark "GLOBAL BANK" has been registered in the United States Patent and Trademark Office.</p>
                </div>

                <div style="text-align: center; margin-top: 3rem; border-top: 2px solid var(--primary-color); padding-top: 2rem;">
                    <p><strong>Official Seal</strong></p>
                    <div style="font-size: 3rem; margin: 1rem 0;">🔐</div>
                    <p><strong>United States Patent and Trademark Office</strong></p>
                    <p>Washington, D.C. 20231</p>
                </div>
            </div>
        `;
    }

    generateFinancialLawDocument() {
        return `
            <div class="document-content">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <h1 style="color: var(--primary-color);">FINANCIAL LAW PERMIT</h1>
                    <p style="font-size: 1.2rem; color: var(--text-muted);">International Financial Regulatory Authority</p>
                </div>
                
                <div style="background: var(--background); padding: 2rem; border-radius: 8px; margin-bottom: 2rem;">
                    <p><strong>Permit Number:</strong> IFR-2025-GB-001</p>
                    <p><strong>Issue Date:</strong> January 1, 2025</p>
                    <p><strong>Institution Name:</strong> GLOBAL BANK</p>
                    <p><strong>Institution Type:</strong> International Commercial Bank</p>
                    <p><strong>Licensee:</strong> Olawale Abdul-Ganiyu Adeshina</p>
                    <p><strong>Contact Email:</strong> olawalztegan@gmail.com</p>
                </div>

                <div style="margin: 2rem 0;">
                    <h3>PERMIT DETAILS</h3>
                    <p>This permit authorizes Global Bank to conduct international banking operations including:</p>
                    <ul style="margin-left: 2rem; margin-top: 1rem;">
                        <li>Acceptance of deposits</li>
                        <li>Granting of loans and advances</li>
                        <li>Foreign exchange operations</li>
                        <li>Cryptocurrency services</li>
                        <li>International wire transfers</li>
                        <li>Investment banking services</li>
                    </ul>
                </div>

                <div style="text-align: center; margin-top: 3rem; border-top: 2px solid var(--primary-color); padding-top: 2rem;">
                    <p><strong>Official Seal</strong></p>
                    <div style="font-size: 3rem; margin: 1rem 0;">🏛️</div>
                    <p><strong>International Financial Regulatory Authority</strong></p>
                    <p>Geneva, Switzerland</p>
                </div>
            </div>
        `;
    }

    generateWorldBankDocument() {
        return `
            <div class="document-content">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <h1 style="color: var(--primary-color);">WORLD BANK OPERATING PERMIT</h1>
                    <p style="font-size: 1.2rem; color: var(--text-muted);">World Bank Group</p>
                </div>
                
                <div style="background: var(--background); padding: 2rem; border-radius: 8px; margin-bottom: 2rem;">
                    <p><strong>Permit Number:</strong> WB-2025-INT-001</p>
                    <p><strong>Issue Date:</strong> January 1, 2025</p>
                    <p><strong>Institution:</strong> GLOBAL BANK</p>
                    <p><strong>Permit Holder:</strong> Olawale Abdul-Ganiyu Adeshina</p>
                    <p><strong>Email:</strong> olawalztegan@gmail.com</p>
                </div>

                <div style="margin: 2rem 0;">
                    <h3>AUTHORIZATION</h3>
                    <p>This permit authorizes Global Bank to operate as an international banking institution with full World Bank recognition and support.</p>
                </div>

                <div style="text-align: center; margin-top: 3rem; border-top: 2px solid var(--primary-color); padding-top: 2rem;">
                    <p><strong>Official Seal</strong></p>
                    <div style="font-size: 3rem; margin: 1rem 0;">🌍</div>
                    <p><strong>World Bank Group</strong></p>
                    <p>Washington, D.C. 20433, USA</p>
                </div>
            </div>
        `;
    }

    generateBankingLicenseDocument() {
        return `
            <div class="document-content">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <h1 style="color: var(--primary-color);">FULL BANKING LICENSE</h1>
                    <p style="font-size: 1.2rem; color: var(--text-muted);">International Banking Commission</p>
                </div>
                
                <div style="background: var(--background); padding: 2rem; border-radius: 8px; margin-bottom: 2rem;">
                    <p><strong>License Number:</strong> IBC-2025-FBL-001</p>
                    <p><strong>Issue Date:</strong> January 1, 2025</p>
                    <p><strong>License Holder:</strong> Olawale Abdul-Ganiyu Adeshina</p>
                    <p><strong>Institution:</strong> GLOBAL BANK</p>
                    <p><strong>Email:</strong> olawalztegan@gmail.com</p>
                </div>

                <div style="margin: 2rem 0;">
                    <h3>LICENSE PRIVILEGES</h3>
                    <p>This license grants Global Bank the following privileges:</p>
                    <ul style="margin-left: 2rem; margin-top: 1rem;">
                        <li>Full commercial banking operations</li>
                        <li>International wire transfers</li>
                        <li>Cryptocurrency trading and storage</li>
                        <li>Investment banking services</li>
                        <li>Asset management</li>
                        <li>Foreign exchange services</li>
                    </ul>
                </div>

                <div style="text-align: center; margin-top: 3rem; border-top: 2px solid var(--primary-color); padding-top: 2rem;">
                    <p><strong>Official Seal</strong></p>
                    <div style="font-size: 3rem; margin: 1rem 0;">🏦</div>
                    <p><strong>International Banking Commission</strong></p>
                    <p>London, United Kingdom</p>
                </div>
            </div>
        `;
    }

    generateBusinessRegistrationDocument() {
        return `
            <div class="document-content">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <h1 style="color: var(--primary-color);">BUSINESS REGISTRATION CERTIFICATE</h1>
                    <p style="font-size: 1.2rem; color: var(--text-muted);">Department of Commerce</p>
                </div>
                
                <div style="background: var(--background); padding: 2rem; border-radius: 8px; margin-bottom: 2rem;">
                    <p><strong>Registration Number:</strong> BRC-2025-GB-001</p>
                    <p><strong>Registration Date:</strong> January 1, 2025</p>
                    <p><strong>Business Name:</strong> GLOBAL BANK</p>
                    <p><strong>Business Type:</strong> International Banking Institution</p>
                    <p><strong>Owner:</strong> Olawale Abdul-Ganiyu Adeshina</p>
                    <p><strong>Email:</strong> olawalztegan@gmail.com</p>
                </div>

                <div style="margin: 2rem 0;">
                    <h3>CERTIFICATE OF INCORPORATION</h3>
                    <p>This certifies that GLOBAL BANK has been duly registered as a business entity under the laws of the United States of America.</p>
                </div>

                <div style="text-align: center; margin-top: 3rem; border-top: 2px solid var(--primary-color); padding-top: 2rem;">
                    <p><strong>Official Seal</strong></p>
                    <div style="font-size: 3rem; margin: 1rem 0;">📋</div>
                    <p><strong>Department of Commerce</strong></p>
                    <p>Washington, D.C. 20230</p>
                </div>
            </div>
        `;
    }

    generateBusinessAgreementDocument() {
        return `
            <div class="document-content">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <h1 style="color: var(--primary-color);">BUSINESS AGREEMENT</h1>
                    <p style="font-size: 1.2rem; color: var(--text-muted);">Terms and Conditions</p>
                </div>
                
                <div style="background: var(--background); padding: 2rem; border-radius: 8px; margin-bottom: 2rem;">
                    <p><strong>Agreement Number:</strong> BA-2025-GB-001</p>
                    <p><strong>Date:</strong> January 1, 2025</p>
                    <p><strong>Party A:</strong> GLOBAL BANK</p>
                    <p><strong>Party B (Owner):</strong> Olawale Abdul-Ganiyu Adeshina</p>
                    <p><strong>Contact Email:</strong> olawalztegan@gmail.com</p>
                </div>

                <div style="margin: 2rem 0;">
                    <h3>TERMS AND CONDITIONS</h3>
                    <ol style="margin-left: 2rem; margin-top: 1rem;">
                        <li>Global Bank shall operate as an international banking institution</li>
                        <li>All banking operations shall comply with international financial regulations</li>
                        <li>Customer funds shall be protected and insured</li>
                        <li>All transactions shall be recorded and transparent</li>
                        <li>Privacy and security of customer data shall be maintained</li>
                        <li>Dispute resolution shall follow international banking standards</li>
                    </ol>
                </div>

                <div style="text-align: center; margin-top: 3rem; border-top: 2px solid var(--primary-color); padding-top: 2rem;">
                    <p><strong>Official Seal</strong></p>
                    <div style="font-size: 3rem; margin: 1rem 0;">✍️</div>
                    <p><strong>Global Bank Legal Department</strong></p>
                    <p>New York, NY 10001, USA</p>
                </div>
            </div>
        `;
    }

    // Admin Dashboard
    async showAdminDashboard() {
        this.showPage('adminDashboardPage');
        
        // Load admin statistics
        await this.loadAdminStatistics();
    }

    async loadAdminStatistics() {
        try {
            const users = await this.database.getAllUsers();
            const transactions = await this.database.getAllTransactions();
            
            let totalBankVolume = 0;
            let totalCryptoVolume = 0;
            
            users.forEach(user => {
                totalBankVolume += user.bankBalance || 0;
                totalCryptoVolume += user.cryptoBalance || 0;
            });
            
            document.getElementById('adminTotalUsers').textContent = users.length;
            document.getElementById('adminTotalBankVolume').textContent = this.formatCurrency(totalBankVolume);
            document.getElementById('adminTotalCryptoVolume').textContent = this.formatCrypto(totalCryptoVolume);
            document.getElementById('adminTotalTransactions').textContent = transactions.length;
            
        } catch (error) {
            console.error('Error loading admin statistics:', error);
        }
    }

    // Transaction Methods
    async addTransaction(type, amount, currency, description) {
        const transaction = {
            id: this.database.generateId(),
            userId: this.currentUser.id,
            type,
            amount,
            currency,
            description,
            status: 'completed',
            createdAt: new Date().toISOString()
        };
        
        await this.database.addTransaction(transaction);
    }

    // Modal Methods
    showModal(title, content) {
        document.getElementById('generalModalTitle').textContent = title;
        document.getElementById('generalModalBody').innerHTML = content;
        document.getElementById('generalModal').classList.remove('hidden');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }

    // Utility Methods
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 2rem;
            background: ${type === 'success' ? '#4caf50' : type === 'danger' ? '#f44336' : '#2196f3'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 2000;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    formatCurrency(amount) {
        return parseFloat(amount).toFixed(2);
    }

    formatCrypto(amount) {
        return parseFloat(amount).toFixed(8);
    }

    formatAmount(amount, currency) {
        if (currency === 'USD' || currency === 'EUR' || currency === 'GBP') {
            return this.formatCurrency(amount);
        } else {
            return this.formatCrypto(amount);
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    getTransactionTypeText(type) {
        const types = {
            'credit': 'Credit',
            'debit': 'Debit',
            'transfer': 'Transfer'
        };
        return types[type] || type;
    }
}

// Initialize the application
const app = new GlobalBank();

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);