// MiniPay Application - Full JavaScript Implementation
// Developed by Olawale Abdul-Ganiyu

class MiniPayApp {
    constructor() {
        this.currentUser = null;
        this.isAdmin = false;
        this.API_BASE_URL = 'https://api.olawale-minipay.com/v1';
        this.ADMIN_CREDENTIALS = {
            email: 'olawalztegan@gmail.com',
            password: 'admin123' // In production, this should be properly hashed
        };
        
        this.init();
    }

    init() {
        this.initializeData();
        this.attachEventListeners();
        this.checkExistingSession();
    }

    initializeData() {
        // Initialize local storage with default data
        if (!localStorage.getItem('minipay_users')) {
            const defaultUsers = [];
            localStorage.setItem('minipay_users', JSON.stringify(defaultUsers));
        }

        if (!localStorage.getItem('minipay_transactions')) {
            const defaultTransactions = [];
            localStorage.setItem('minipay_transactions', JSON.stringify(defaultTransactions));
        }

        if (!localStorage.getItem('minipay_system')) {
            const systemSettings = {
                totalVolume: 0,
                apiVersion: '1.0.0',
                owner: 'olawale abdul-ganiyu',
                googleAccount: 'olawalztegan@gmail.com',
                createdAt: new Date().toISOString()
            };
            localStorage.setItem('minipay_system', JSON.stringify(systemSettings));
        }
    }

    attachEventListeners() {
        // Page navigation
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

        // Dashboard actions
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        document.getElementById('addCreditBtn').addEventListener('click', () => this.showAddCreditModal());
        document.getElementById('addDebitBtn').addEventListener('click', () => this.showAddDebitModal());
        document.getElementById('editBalanceBtn').addEventListener('click', () => this.showEditBalanceModal());
        document.getElementById('sendMoneyBtn').addEventListener('click', () => this.showSendMoneyModal());
        document.getElementById('receiveMoneyBtn').addEventListener('click', () => this.showReceiveMoneyModal());
        document.getElementById('historyBtn').addEventListener('click', () => this.showTransactionHistory());

        // Admin dashboard actions
        document.getElementById('adminLogoutBtn').addEventListener('click', () => this.logout());
        document.getElementById('manageUsersBtn').addEventListener('click', () => this.showManageUsersModal());
        document.getElementById('viewAllTransactionsBtn').addEventListener('click', () => this.showAllTransactionsModal());
        document.getElementById('editUserBalanceBtn').addEventListener('click', () => this.showEditUserBalanceModal());
        document.getElementById('systemSettingsBtn').addEventListener('click', () => this.showSystemSettingsModal());

        // Modal close
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('modalOverlay').addEventListener('click', (e) => {
            if (e.target === document.getElementById('modalOverlay')) {
                this.closeModal();
            }
        });
    }

    showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');
    }

    checkExistingSession() {
        const session = localStorage.getItem('minipay_session');
        if (session) {
            const sessionData = JSON.parse(session);
            this.currentUser = sessionData.user;
            this.isAdmin = sessionData.isAdmin;
            
            if (this.isAdmin) {
                this.showAdminDashboard();
            } else {
                this.showDashboard();
            }
        }
    }

    // Authentication Methods
    handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        const users = this.getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            this.currentUser = user;
            this.isAdmin = false;
            this.saveSession();
            this.showDashboard();
            this.showNotification('Login successful!', 'success');
        } else {
            this.showNotification('Invalid email or password', 'danger');
        }
    }

    handleRegister(e) {
        e.preventDefault();
        const fullName = document.getElementById('regFullName').value;
        const email = document.getElementById('regEmail').value;
        const phone = document.getElementById('regPhone').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;

        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'danger');
            return;
        }

        const users = this.getUsers();
        if (users.find(u => u.email === email)) {
            this.showNotification('Email already registered', 'danger');
            return;
        }

        const newUser = {
            id: this.generateId(),
            fullName,
            email,
            phone,
            password,
            accountNumber: this.generateAccountNumber(),
            balance: 0,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        this.saveUsers(users);

        this.showNotification('Account created successfully!', 'success');
        document.getElementById('registerForm').reset();
        this.showPage('loginPage');
    }

    handleAdminLogin(e) {
        e.preventDefault();
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;

        if (email === this.ADMIN_CREDENTIALS.email && password === this.ADMIN_CREDENTIALS.password) {
            this.isAdmin = true;
            this.currentUser = {
                id: 'admin',
                fullName: 'Olawale Abdul-Ganiyu',
                email: email
            };
            this.saveSession();
            this.showAdminDashboard();
            this.showNotification('Admin login successful!', 'success');
        } else {
            this.showNotification('Invalid admin credentials', 'danger');
        }
    }

    logout() {
        this.currentUser = null;
        this.isAdmin = false;
        localStorage.removeItem('minipay_session');
        this.showPage('loginPage');
        this.showNotification('Logged out successfully', 'success');
    }

    saveSession() {
        const sessionData = {
            user: this.currentUser,
            isAdmin: this.isAdmin
        };
        localStorage.setItem('minipay_session', JSON.stringify(sessionData));
    }

    // Dashboard Methods
    showDashboard() {
        this.showPage('dashboardPage');
        this.updateDashboardUI();
        this.loadRecentTransactions();
    }

    updateDashboardUI() {
        if (this.currentUser) {
            document.getElementById('userName').textContent = `Welcome, ${this.currentUser.fullName}`;
            document.getElementById('totalBalance').textContent = this.formatCurrency(this.currentUser.balance);
            document.getElementById('accountNumber').textContent = this.currentUser.accountNumber || '-';
            document.getElementById('accountHolder').textContent = this.currentUser.fullName;
        }
    }

    loadRecentTransactions() {
        const transactions = this.getTransactions();
        const userTransactions = transactions.filter(t => t.userId === this.currentUser.id);
        const recentTransactions = userTransactions.slice(-10).reverse();

        const transactionsList = document.getElementById('transactionsList');
        
        if (recentTransactions.length === 0) {
            transactionsList.innerHTML = '<p class="no-transactions">No transactions yet</p>';
            return;
        }

        transactionsList.innerHTML = recentTransactions.map(transaction => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <span class="transaction-type">${this.getTransactionTypeText(transaction.type)}</span>
                    <span class="transaction-date">${this.formatDate(transaction.createdAt)}</span>
                </div>
                <span class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'credit' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                </span>
            </div>
        `).join('');
    }

    // Transaction Methods
    showAddCreditModal() {
        const modalContent = `
            <form id="addCreditForm">
                <div class="form-group">
                    <label for="creditAmount">Amount ($)</label>
                    <input type="number" id="creditAmount" placeholder="Enter amount" step="0.01" min="0" required>
                </div>
                <div class="form-group">
                    <label for="creditDescription">Description</label>
                    <input type="text" id="creditDescription" placeholder="Enter description">
                </div>
                <button type="submit" class="btn btn-primary">Add Credit</button>
            </form>
        `;

        this.showModal('Add Credit', modalContent);
        document.getElementById('addCreditForm').addEventListener('submit', (e) => this.handleAddCredit(e));
    }

    handleAddCredit(e) {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('creditAmount').value);
        const description = document.getElementById('creditDescription').value || 'Credit added';

        if (amount <= 0) {
            this.showNotification('Please enter a valid amount', 'danger');
            return;
        }

        this.addTransaction('credit', amount, description);
        this.currentUser.balance += amount;
        this.updateUser(this.currentUser);
        this.updateDashboardUI();
        this.loadRecentTransactions();
        this.closeModal();
        this.showNotification(`$${this.formatCurrency(amount)} added to your balance`, 'success');
    }

    showAddDebitModal() {
        const modalContent = `
            <form id="addDebitForm">
                <div class="form-group">
                    <label for="debitAmount">Amount ($)</label>
                    <input type="number" id="debitAmount" placeholder="Enter amount" step="0.01" min="0" required>
                </div>
                <div class="form-group">
                    <label for="debitDescription">Description</label>
                    <input type="text" id="debitDescription" placeholder="Enter description">
                </div>
                <button type="submit" class="btn btn-primary">Add Debit</button>
            </form>
        `;

        this.showModal('Add Debit', modalContent);
        document.getElementById('addDebitForm').addEventListener('submit', (e) => this.handleAddDebit(e));
    }

    handleAddDebit(e) {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('debitAmount').value);
        const description = document.getElementById('debitDescription').value || 'Debit added';

        if (amount <= 0) {
            this.showNotification('Please enter a valid amount', 'danger');
            return;
        }

        if (amount > this.currentUser.balance) {
            this.showNotification('Insufficient balance', 'danger');
            return;
        }

        this.addTransaction('debit', amount, description);
        this.currentUser.balance -= amount;
        this.updateUser(this.currentUser);
        this.updateDashboardUI();
        this.loadRecentTransactions();
        this.closeModal();
        this.showNotification(`$${this.formatCurrency(amount)} deducted from your balance`, 'success');
    }

    showEditBalanceModal() {
        const modalContent = `
            <form id="editBalanceForm">
                <div class="form-group">
                    <label for="newBalance">New Balance ($)</label>
                    <input type="number" id="newBalance" placeholder="Enter new balance" step="0.01" min="0" value="${this.currentUser.balance}" required>
                </div>
                <div class="form-group">
                    <label for="editReason">Reason</label>
                    <input type="text" id="editReason" placeholder="Enter reason for balance change">
                </div>
                <button type="submit" class="btn btn-primary">Update Balance</button>
            </form>
        `;

        this.showModal('Edit Balance', modalContent);
        document.getElementById('editBalanceForm').addEventListener('submit', (e) => this.handleEditBalance(e));
    }

    handleEditBalance(e) {
        e.preventDefault();
        const newBalance = parseFloat(document.getElementById('newBalance').value);
        const reason = document.getElementById('editReason').value || 'Balance edited';

        if (newBalance < 0) {
            this.showNotification('Balance cannot be negative', 'danger');
            return;
        }

        const difference = newBalance - this.currentUser.balance;
        
        if (difference > 0) {
            this.addTransaction('credit', difference, reason);
        } else if (difference < 0) {
            this.addTransaction('debit', Math.abs(difference), reason);
        }

        this.currentUser.balance = newBalance;
        this.updateUser(this.currentUser);
        this.updateDashboardUI();
        this.loadRecentTransactions();
        this.closeModal();
        this.showNotification('Balance updated successfully', 'success');
    }

    showSendMoneyModal() {
        const modalContent = `
            <form id="sendMoneyForm">
                <div class="form-group">
                    <label for="recipientAccount">Recipient Account Number</label>
                    <input type="text" id="recipientAccount" placeholder="Enter account number" required>
                </div>
                <div class="form-group">
                    <label for="sendAmount">Amount ($)</label>
                    <input type="number" id="sendAmount" placeholder="Enter amount" step="0.01" min="0" required>
                </div>
                <div class="form-group">
                    <label for="sendDescription">Description (Optional)</label>
                    <input type="text" id="sendDescription" placeholder="Enter description">
                </div>
                <button type="submit" class="btn btn-primary">Send Money</button>
            </form>
        `;

        this.showModal('Send Money', modalContent);
        document.getElementById('sendMoneyForm').addEventListener('submit', (e) => this.handleSendMoney(e));
    }

    handleSendMoney(e) {
        e.preventDefault();
        const recipientAccount = document.getElementById('recipientAccount').value;
        const amount = parseFloat(document.getElementById('sendAmount').value);
        const description = document.getElementById('sendDescription').value || 'Transfer';

        if (amount <= 0) {
            this.showNotification('Please enter a valid amount', 'danger');
            return;
        }

        if (amount > this.currentUser.balance) {
            this.showNotification('Insufficient balance', 'danger');
            return;
        }

        const users = this.getUsers();
        const recipient = users.find(u => u.accountNumber === recipientAccount);

        if (!recipient) {
            this.showNotification('Recipient account not found', 'danger');
            return;
        }

        if (recipient.id === this.currentUser.id) {
            this.showNotification('Cannot send money to yourself', 'danger');
            return;
        }

        // Deduct from sender
        this.addTransaction('debit', amount, `Transfer to ${recipient.fullName} - ${description}`);
        this.currentUser.balance -= amount;

        // Add to recipient
        const recipientTransaction = {
            id: this.generateId(),
            userId: recipient.id,
            type: 'credit',
            amount: amount,
            description: `Transfer from ${this.currentUser.fullName} - ${description}`,
            createdAt: new Date().toISOString()
        };
        
        const transactions = this.getTransactions();
        transactions.push(recipientTransaction);
        this.saveTransactions(transactions);

        recipient.balance += amount;
        this.updateUser(recipient);
        this.updateUser(this.currentUser);

        this.updateDashboardUI();
        this.loadRecentTransactions();
        this.closeModal();
        this.showNotification(`$${this.formatCurrency(amount)} sent to ${recipient.fullName}`, 'success');
    }

    showReceiveMoneyModal() {
        const currentUser = this.currentUser;
        const modalContent = `
            <div class="receive-money-content">
                <div class="form-group">
                    <label>Your Account Number</label>
                    <div class="account-number-display">
                        <input type="text" value="${currentUser.accountNumber}" readonly>
                        <button id="copyAccountNumber" class="btn btn-sm">Copy</button>
                    </div>
                </div>
                <div class="form-group">
                    <label>Your Name</label>
                    <input type="text" value="${currentUser.fullName}" readonly>
                </div>
                <p class="text-center mt-2">Share this account number to receive money</p>
            </div>
        `;

        this.showModal('Receive Money', modalContent);
        document.getElementById('copyAccountNumber').addEventListener('click', () => {
            navigator.clipboard.writeText(currentUser.accountNumber);
            this.showNotification('Account number copied to clipboard', 'success');
        });
    }

    showTransactionHistory() {
        const transactions = this.getTransactions();
        const userTransactions = transactions.filter(t => t.userId === this.currentUser.id);
        const allTransactions = userTransactions.reverse();

        let content = '';
        
        if (allTransactions.length === 0) {
            content = '<p class="no-transactions">No transactions yet</p>';
        } else {
            content = '<div class="transactions-list">' +
                allTransactions.map(transaction => `
                    <div class="transaction-item">
                        <div class="transaction-info">
                            <span class="transaction-type">${this.getTransactionTypeText(transaction.type)}</span>
                            <span class="transaction-date">${this.formatDate(transaction.createdAt)}</span>
                            <small>${transaction.description}</small>
                        </div>
                        <span class="transaction-amount ${transaction.type}">
                            ${transaction.type === 'credit' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                        </span>
                    </div>
                `).join('') +
                '</div>';
        }

        this.showModal('Transaction History', content);
    }

    // Admin Dashboard Methods
    showAdminDashboard() {
        this.showPage('adminDashboardPage');
        this.updateAdminDashboardUI();
        this.loadUsersTable();
    }

    updateAdminDashboardUI() {
        document.getElementById('adminUserName').textContent = 'Admin: Olawale Abdul-Ganiyu';
        
        const users = this.getUsers();
        const transactions = this.getTransactions();
        const system = this.getSystemSettings();

        document.getElementById('totalUsers').textContent = users.length;
        document.getElementById('totalTransactions').textContent = transactions.length;
        document.getElementById('totalVolume').textContent = this.formatCurrency(system.totalVolume);
    }

    loadUsersTable() {
        const users = this.getUsers();
        const tableBody = document.getElementById('usersTableBody');

        if (users.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No users registered</td></tr>';
            return;
        }

        tableBody.innerHTML = users.map(user => `
            <tr>
                <td>${user.fullName}</td>
                <td>${user.email}</td>
                <td>${user.accountNumber}</td>
                <td>${this.formatCurrency(user.balance)}</td>
                <td>
                    <button class="btn btn-sm" onclick="app.editUserFromAdmin('${user.id}')">Edit</button>
                </td>
            </tr>
        `).join('');
    }

    showManageUsersModal() {
        const users = this.getUsers();
        let content = '<div class="users-list">';

        if (users.length === 0) {
            content += '<p class="no-transactions">No users registered</p>';
        } else {
            content += users.map(user => `
                <div class="user-card">
                    <h4>${user.fullName}</h4>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Account:</strong> ${user.accountNumber}</p>
                    <p><strong>Balance:</strong> ${this.formatCurrency(user.balance)}</p>
                    <button class="btn btn-sm" onclick="app.editUserFromAdmin('${user.id}')">Edit User</button>
                </div>
            `).join('');
        }

        content += '</div>';
        this.showModal('Manage Users', content);
    }

    showAllTransactionsModal() {
        const transactions = this.getTransactions().reverse();
        let content = '';

        if (transactions.length === 0) {
            content = '<p class="no-transactions">No transactions yet</p>';
        } else {
            content = '<div class="transactions-list">' +
                transactions.map(transaction => {
                    const user = this.getUserById(transaction.userId);
                    const userName = user ? user.fullName : 'Unknown User';
                    return `
                        <div class="transaction-item">
                            <div class="transaction-info">
                                <span class="transaction-type">${userName}</span>
                                <span class="transaction-date">${this.formatDate(transaction.createdAt)}</span>
                                <small>${transaction.description}</small>
                            </div>
                            <span class="transaction-amount ${transaction.type}">
                                ${transaction.type === 'credit' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                            </span>
                        </div>
                    `;
                }).join('') +
                '</div>';
        }

        this.showModal('All Transactions', content);
    }

    showEditUserBalanceModal() {
        const users = this.getUsers();
        let userOptions = users.map(user => 
            `<option value="${user.id}">${user.fullName} - ${user.accountNumber}</option>`
        ).join('');

        const modalContent = `
            <form id="editUserBalanceForm">
                <div class="form-group">
                    <label for="selectUser">Select User</label>
                    <select id="selectUser" required>
                        <option value="">Choose a user...</option>
                        ${userOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label for="userNewBalance">New Balance ($)</label>
                    <input type="number" id="userNewBalance" placeholder="Enter new balance" step="0.01" min="0" required>
                </div>
                <button type="submit" class="btn btn-primary">Update Balance</button>
            </form>
        `;

        this.showModal('Edit User Balance', modalContent);
        document.getElementById('editUserBalanceForm').addEventListener('submit', (e) => this.handleEditUserBalance(e));
    }

    handleEditUserBalance(e) {
        e.preventDefault();
        const userId = document.getElementById('selectUser').value;
        const newBalance = parseFloat(document.getElementById('userNewBalance').value);

        if (!userId) {
            this.showNotification('Please select a user', 'danger');
            return;
        }

        const user = this.getUserById(userId);
        if (!user) {
            this.showNotification('User not found', 'danger');
            return;
        }

        const difference = newBalance - user.balance;
        
        if (difference > 0) {
            this.addTransaction(userId, 'credit', difference, 'Balance adjustment by admin');
        } else if (difference < 0) {
            this.addTransaction(userId, 'debit', Math.abs(difference), 'Balance adjustment by admin');
        }

        user.balance = newBalance;
        this.updateUser(user);
        
        this.updateAdminDashboardUI();
        this.loadUsersTable();
        this.closeModal();
        this.showNotification(`Balance updated for ${user.fullName}`, 'success');
    }

    showSystemSettingsModal() {
        const system = this.getSystemSettings();
        const modalContent = `
            <div class="system-settings">
                <div class="form-group">
                    <label>Owner</label>
                    <input type="text" value="${system.owner}" readonly>
                </div>
                <div class="form-group">
                    <label>Google Account</label>
                    <input type="text" value="${system.googleAccount}" readonly>
                </div>
                <div class="form-group">
                    <label>API Version</label>
                    <input type="text" value="${system.apiVersion}" readonly>
                </div>
                <div class="form-group">
                    <label>API Base URL</label>
                    <input type="text" value="${this.API_BASE_URL}" readonly>
                </div>
                <div class="form-group">
                    <label>Total Volume</label>
                    <input type="text" value="${this.formatCurrency(system.totalVolume)}" readonly>
                </div>
                <div class="form-group">
                    <label>Created At</label>
                    <input type="text" value="${this.formatDate(system.createdAt)}" readonly>
                </div>
            </div>
        `;

        this.showModal('System Settings', modalContent);
    }

    editUserFromAdmin(userId) {
        const user = this.getUserById(userId);
        if (!user) return;

        const modalContent = `
            <form id="editUserDetailsForm">
                <div class="form-group">
                    <label for="editUserName">Full Name</label>
                    <input type="text" id="editUserName" value="${user.fullName}" required>
                </div>
                <div class="form-group">
                    <label for="editUserEmail">Email</label>
                    <input type="email" id="editUserEmail" value="${user.email}" required>
                </div>
                <div class="form-group">
                    <label for="editUserPhone">Phone</label>
                    <input type="tel" id="editUserPhone" value="${user.phone}" required>
                </div>
                <div class="form-group">
                    <label for="editUserAccount">Account Number</label>
                    <input type="text" id="editUserAccount" value="${user.accountNumber}" readonly>
                </div>
                <div class="form-group">
                    <label for="editUserBalance">Balance ($)</label>
                    <input type="number" id="editUserBalance" value="${user.balance}" step="0.01" min="0" required>
                </div>
                <button type="submit" class="btn btn-primary">Update User</button>
            </form>
        `;

        this.showModal('Edit User Details', modalContent);
        document.getElementById('editUserDetailsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            
            user.fullName = document.getElementById('editUserName').value;
            user.email = document.getElementById('editUserEmail').value;
            user.phone = document.getElementById('editUserPhone').value;
            user.balance = parseFloat(document.getElementById('editUserBalance').value);
            
            this.updateUser(user);
            this.updateAdminDashboardUI();
            this.loadUsersTable();
            this.closeModal();
            this.showNotification('User updated successfully', 'success');
        });
    }

    // Helper Methods
    getUsers() {
        return JSON.parse(localStorage.getItem('minipay_users') || '[]');
    }

    saveUsers(users) {
        localStorage.setItem('minipay_users', JSON.stringify(users));
    }

    getTransactions() {
        return JSON.parse(localStorage.getItem('minipay_transactions') || '[]');
    }

    saveTransactions(transactions) {
        localStorage.setItem('minipay_transactions', JSON.stringify(transactions));
    }

    getSystemSettings() {
        return JSON.parse(localStorage.getItem('minipay_system') || '{}');
    }

    saveSystemSettings(system) {
        localStorage.setItem('minipay_system', JSON.stringify(system));
    }

    getUserById(userId) {
        const users = this.getUsers();
        return users.find(u => u.id === userId);
    }

    updateUser(user) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === user.id);
        if (index !== -1) {
            users[index] = user;
            this.saveUsers(users);
        }
    }

    addTransaction(type, amount, description) {
        const transaction = {
            id: this.generateId(),
            userId: this.currentUser.id,
            type: type,
            amount: amount,
            description: description,
            createdAt: new Date().toISOString()
        };

        const transactions = this.getTransactions();
        transactions.push(transaction);
        this.saveTransactions(transactions);

        // Update system volume
        const system = this.getSystemSettings();
        system.totalVolume += amount;
        this.saveSystemSettings(system);
    }

    showModal(title, content) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = content;
        document.getElementById('modalOverlay').classList.remove('hidden');
    }

    closeModal() {
        document.getElementById('modalOverlay').classList.add('hidden');
    }

    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 2rem;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
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

    generateId() {
        return 'id_' + Math.random().toString(36).substr(2, 9) + Date.now();
    }

    generateAccountNumber() {
        return 'MP' + Math.random().toString(10).substr(2, 8);
    }

    formatCurrency(amount) {
        return parseFloat(amount).toFixed(2);
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

    getTransactionTypeText(type) {
        const types = {
            'credit': 'Credit',
            'debit': 'Debit',
            'transfer': 'Transfer'
        };
        return types[type] || type;
    }

    // API Integration Methods (for future backend integration)
    async apiCall(endpoint, method = 'GET', data = null) {
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.currentUser?.token || ''}`
                }
            };

            if (data) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(`${this.API_BASE_URL}${endpoint}`, options);
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
}

// Initialize the application
const app = new MiniPayApp();

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
    
    .account-number-display {
        display: flex;
        gap: 0.5rem;
    }
    
    .account-number-display input {
        flex: 1;
    }
    
    .user-card {
        background: #f9f9f9;
        padding: 1rem;
        margin-bottom: 1rem;
        border-radius: 8px;
    }
    
    .user-card h4 {
        margin-bottom: 0.5rem;
        color: #1a1a1a;
    }
    
    .user-card p {
        margin-bottom: 0.25rem;
        font-size: 0.9rem;
        color: #666;
    }
`;
document.head.appendChild(style);