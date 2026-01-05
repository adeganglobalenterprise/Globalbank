const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const Store = require('electron-store');

/**
 * MiniPay Desktop Application
 * Developed by Olawale Abdul-Ganiyu
 * Global Digital Wallet - Desktop Version
 * API Base URL: https://api.olawale-minipay.com/v3/
 */

// Application Configuration
const CONFIG = {
    APP_NAME: 'MiniPay Desktop',
    APP_VERSION: '2.0.0',
    OWNER: 'olawale abdul-ganiyu',
    GOOGLE_ACCOUNT: 'olawalztegan@gmail.com',
    API_BASE_URL: 'https://api.olawale-minipay.com/v3/',
    API_TIMEOUT: 30000,
    ENCRYPTION_KEY: 'MiniPay_Desktop_Secure_2025'
};

// Initialize secure storage
const store = new Store({
    name: 'minipay-data',
    encryptionKey: CONFIG.ENCRYPTION_KEY
});

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        icon: path.join(__dirname, 'assets', 'icon.png'),
        title: `${CONFIG.APP_NAME} - ${CONFIG.OWNER}`
    });

    // Load the HTML file
    mainWindow.loadFile('index.html');

    // Create menu
    createMenu();

    // Open DevTools in development mode
    if (process.argv.includes('--dev')) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function createMenu() {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New Transaction',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        mainWindow.webContents.send('new-transaction');
                    }
                },
                {
                    label: 'Export Data',
                    click: async () => {
                        const data = store.store;
                        const { filePath } = await dialog.showSaveDialog(mainWindow, {
                            defaultPath: 'minipay-export.json',
                            filters: [
                                { name: 'JSON Files', extensions: ['json'] }
                            ]
                        });
                        if (filePath) {
                            const fs = require('fs');
                            fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                        }
                    }
                },
                { type: 'separator' },
                {
                    label: 'Settings',
                    accelerator: 'CmdOrCtrl+,',
                    click: () => {
                        mainWindow.webContents.send('open-settings');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Exit',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { label: 'Undo', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
                { label: 'Redo', accelerator: 'CmdOrCtrl+Y', role: 'redo' },
                { type: 'separator' },
                { label: 'Cut', accelerator: 'CmdOrCtrl+X', role: 'cut' },
                { label: 'Copy', accelerator: 'CmdOrCtrl+C', role: 'copy' },
                { label: 'Paste', accelerator: 'CmdOrCtrl+V', role: 'paste' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { label: 'Reload', accelerator: 'CmdOrCtrl+R', role: 'reload' },
                { label: 'Force Reload', accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
                { label: 'Toggle Developer Tools', accelerator: 'CmdOrCtrl+Shift+I', role: 'toggleDevTools' },
                { type: 'separator' },
                { label: 'Actual Size', accelerator: 'CmdOrCtrl+0', role: 'resetZoom' },
                { label: 'Zoom In', accelerator: 'CmdOrCtrl+Plus', role: 'zoomIn' },
                { label: 'Zoom Out', accelerator: 'CmdOrCtrl+-', role: 'zoomOut' },
                { type: 'separator' },
                { label: 'Toggle Fullscreen', accelerator: 'F11', role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About MiniPay',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'About MiniPay',
                            message: `${CONFIG.APP_NAME}`,
                            detail: `Version: ${CONFIG.APP_VERSION}\nDeveloper: ${CONFIG.OWNER}\nEmail: ${CONFIG.GOOGLE_ACCOUNT}\n\nGlobal Digital Wallet Application\n\n© 2025 Olawale Abdul-Ganiyu. All rights reserved.`
                        });
                    }
                },
                {
                    label: 'API Documentation',
                    click: () => {
                        require('electron').shell.openExternal('https://api.olawale-minipay.com/docs');
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// IPC Handlers
ipcMain.handle('get-config', () => {
    return CONFIG;
});

ipcMain.handle('get-user', () => {
    return store.get('user', null);
});

ipcMain.handle('set-user', (event, user) => {
    store.set('user', user);
    return true;
});

ipcMain.handle('logout', () => {
    store.delete('user');
    return true;
});

ipcMain.handle('get-users', () => {
    return store.get('users', []);
});

ipcMain.handle('set-users', (event, users) => {
    store.set('users', users);
    return true;
});

ipcMain.handle('get-transactions', () => {
    return store.get('transactions', []);
});

ipcMain.handle('set-transactions', (event, transactions) => {
    store.set('transactions', transactions);
    return true;
});

ipcMain.handle('get-system', () => {
    return store.get('system', {
        totalVolume: 0,
        apiVersion: CONFIG.APP_VERSION,
        owner: CONFIG.OWNER,
        googleAccount: CONFIG.GOOGLE_ACCOUNT,
        createdAt: new Date().toISOString()
    });
});

ipcMain.handle('set-system', (event, system) => {
    store.set('system', system);
    return true;
});

// API Call Handler
ipcMain.handle('api-call', async (event, endpoint, method, data, token) => {
    try {
        const axios = require('axios');
        const response = await axios({
            method: method,
            url: `${CONFIG.API_BASE_URL}${endpoint}`,
            data: data,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
                'X-App-Version': CONFIG.APP_VERSION,
                'X-Platform': 'Desktop',
                'X-Owner': CONFIG.OWNER
            },
            timeout: CONFIG.API_TIMEOUT
        });
        return { success: true, data: response.data };
    } catch (error) {
        return { 
            success: false, 
            error: error.message,
            details: error.response?.data || null
        };
    }
});

// Generate Account Number
ipcMain.handle('generate-account-number', () => {
    return 'MP' + Math.floor(Math.random() * 9000000000 + 1000000000).toString();
});

// Generate Transaction ID
ipcMain.handle('generate-transaction-id', () => {
    return 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
});

// Export data
ipcMain.handle('export-data', async () => {
    const data = {
        config: CONFIG,
        user: store.get('user'),
        users: store.get('users', []),
        transactions: store.get('transactions', []),
        system: store.get('system'),
        exportedAt: new Date().toISOString()
    };
    
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
        defaultPath: `minipay-export-${Date.now()}.json`,
        filters: [
            { name: 'JSON Files', extensions: ['json'] }
        ]
    });
    
    if (filePath) {
        const fs = require('fs');
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return { success: true, filePath };
    }
    
    return { success: false };
});

// Import data
ipcMain.handle('import-data', async () => {
    const { filePaths } = await dialog.showOpenDialog(mainWindow, {
        filters: [
            { name: 'JSON Files', extensions: ['json'] }
        ]
    });
    
    if (filePaths && filePaths.length > 0) {
        try {
            const fs = require('fs');
            const data = JSON.parse(fs.readFileSync(filePaths[0], 'utf8'));
            
            // Import data (validation should be added in production)
            if (data.users) store.set('users', data.users);
            if (data.transactions) store.set('transactions', data.transactions);
            if (data.system) store.set('system', data.system);
            
            return { success: true, imported: filePaths[0] };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    return { success: false };
});

// App events
app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

app.on('before-quit', () => {
    // Cleanup before quitting
    console.log('MiniPay Desktop is shutting down...');
});