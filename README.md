# MiniPay Application Ecosystem

**Developed by Olawale Abdul-Ganiyu**
**Email: olawalztegan@gmail.com**

A comprehensive global digital wallet application ecosystem consisting of Web, Android (Android 15), and Desktop versions.

## 🌟 Features

### Core Features Across All Platforms
- ✅ User registration and authentication
- ✅ Admin login and dashboard
- ✅ Credit and debit balance management
- ✅ Account number generation and management
- ✅ Send and receive money functionality
- ✅ Transaction history tracking
- ✅ Real-time balance updates
- ✅ Secure data storage
- ✅ Custom API integration
- ✅ Google account integration (olawalztegan@gmail.com)

### Web Application Features
- Modern, responsive UI design
- Single-page application architecture
- Real-time notifications
- Modal-based interactions
- Transaction filtering and search
- Export functionality
- Admin user management
- System statistics dashboard

### Android Application Features
- Android 15 optimized
- Material Design 3 UI
- Biometric authentication support
- Google Sign-In integration
- Push notifications
- Offline mode support
- SQLite local database
- Retrofit API integration
- Coroutines for async operations

### Desktop Application Features
- Electron-based cross-platform app
- Native menu integration
- File system access
- Import/export data
- Keyboard shortcuts
- System tray integration
- Auto-updates support
- Secure local storage encryption

## 📁 Project Structure

```
minipay-ecosystem/
├── minipay-web/              # Web Application
│   ├── index.html           # Main HTML file
│   ├── styles.css           # CSS styling
│   ├── app.js               # JavaScript application logic
│   └── README.md            # Web app documentation
│
├── minipay-android/         # Android Application
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── java/com/olawale/minipay/
│   │   │   │   ├── MiniPayApplication.kt
│   │   │   │   ├── data/
│   │   │   │   │   ├── models/
│   │   │   │   │   │   ├── User.kt
│   │   │   │   │   │   └── Transaction.kt
│   │   │   │   │   └── api/
│   │   │   │   │       └── MiniPayApiService.kt
│   │   │   │   └── ui/
│   │   │   │       └── dashboard/
│   │   │   │           └── DashboardActivity.kt
│   │   │   └── build.gradle.kts
│   │   └── build.gradle.kts
│   └── README.md           # Android app documentation
│
├── minipay-desktop/         # Desktop Application
│   ├── main.js             # Electron main process
│   ├── index.html          # Desktop UI
│   ├── renderer.js         # Renderer process logic
│   ├── package.json        # Node.js dependencies
│   └── README.md           # Desktop app documentation
│
└── README.md               # This file
```

## 🚀 Getting Started

### Web Application

1. Navigate to the `minipay-web` directory
2. Open `index.html` in a web browser
3. Alternatively, use a local server:
   ```bash
   cd minipay-web
   python -m http.server 8000
   # or
   npx serve
   ```

### Android Application

**Prerequisites:**
- Android Studio Hedgehog or newer
- JDK 17
- Android SDK 35
- Gradle 8.5+

**Setup:**
1. Open the `minipay-android` directory in Android Studio
2. Sync Gradle files
3. Configure `google-services.json` for Firebase
4. Build and run the app

**Build Commands:**
```bash
cd minipay-android
./gradlew assembleDebug      # Debug build
./gradlew assembleRelease    # Release build
```

### Desktop Application

**Prerequisites:**
- Node.js 18+
- npm or yarn

**Setup:**
```bash
cd minipay-desktop
npm install                  # Install dependencies
npm start                    # Run in development
```

**Build for Production:**
```bash
npm run build               # Build for current platform
npm run build-win           # Build for Windows
npm run build-mac           # Build for macOS
npm run build-linux         # Build for Linux
```

## 🔧 Configuration

### API Configuration

All applications use different API base URLs:

- **Web App:** `https://api.olawale-minipay.com/v1/`
- **Android App:** `https://api.olawale-minipay.com/v2/`
- **Desktop App:** `https://api.olawale-minipay.com/v3/`

### Admin Credentials

```
Email: olawalztegan@gmail.com
Password: admin123 (Web/Desktop)
Password: admin_secure_2025 (Android)
```

### Google Account Integration

```
Google Account: olawalztegan@gmail.com
Owner Name: olawale abdul-ganiyu
```

## 📱 Platform-Specific Features

### Web Application
- Responsive design for all screen sizes
- Modern JavaScript (ES6+)
- CSS Grid and Flexbox layouts
- Local Storage for data persistence
- Real-time UI updates

### Android Application
- Kotlin programming language
- Jetpack Compose UI
- Room Database for local storage
- Firebase Authentication
- Retrofit for API calls
- Coroutines for async operations
- Biometric authentication
- Material Design 3 components

### Desktop Application
- Electron framework
- Node.js backend
- Secure local storage (electron-store)
- Native OS integration
- File system operations
- Keyboard shortcuts
- System tray integration

## 🔒 Security Features

- Encrypted local storage
- Secure API communication
- Biometric authentication (Android)
- Password hashing
- Session management
- CSRF protection
- XSS prevention

## 🌐 Network Configuration

All applications share the same network infrastructure but use different API versions:

- API v1: Web Application
- API v2: Android Application  
- API v3: Desktop Application

This allows for:
- Platform-specific optimizations
- Independent versioning
- Enhanced security
- Better error handling
- Custom response formats

## 📊 Data Models

### User Model
```json
{
  "id": "string",
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "accountNumber": "string",
  "balance": "number",
  "currency": "USD",
  "isVerified": "boolean",
  "isAdmin": "boolean",
  "googleAccount": "string",
  "createdAt": "string",
  "updatedAt": "string"
}
```

### Transaction Model
```json
{
  "id": "string",
  "userId": "string",
  "type": "CREDIT|DEBIT|TRANSFER_SEND|TRANSFER_RECEIVE",
  "amount": "number",
  "currency": "USD",
  "description": "string",
  "recipientName": "string",
  "recipientAccount": "string",
  "status": "PENDING|COMPLETED|FAILED|CANCELLED",
  "fee": "number",
  "createdAt": "string",
  "completedAt": "string"
}
```

## 🎨 UI/UX Design

### Design Principles
- Clean, modern interface
- Intuitive navigation
- Consistent branding across platforms
- Accessibility compliance
- Mobile-first responsive design

### Color Scheme
- Primary: `#07955f` (Green)
- Secondary: `#057a4d` (Dark Green)
- Accent: `#00d68f` (Light Green)
- Success: `#10b981`
- Danger: `#ef4444`
- Warning: `#f59e0b`

## 🔄 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/google` - Google Sign-In
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh token

### User Operations
- `GET /users/me` - Get current user
- `PUT /users/me` - Update current user
- `GET /users/{userId}` - Get user by ID
- `GET /users/account/{accountNumber}` - Get user by account number

### Balance Operations
- `GET /balance/me` - Get user balance
- `POST /balance/credit` - Add credit
- `POST /balance/debit` - Add debit
- `PUT /balance/update` - Update balance

### Transactions
- `GET /transactions` - Get transactions
- `GET /transactions/{transactionId}` - Get transaction by ID
- `POST /transactions/transfer` - Send money
- `POST /transactions/deposit` - Deposit money
- `POST /transactions/withdraw` - Withdraw money

### Admin Operations
- `GET /admin/users` - Get all users
- `PUT /admin/users/{userId}/balance` - Update user balance
- `GET /admin/transactions` - Get all transactions
- `GET /admin/stats` - Get system statistics

## 🧪 Testing

### Web Application
```bash
cd minipay-web
# Open in browser and test all features manually
```

### Android Application
```bash
cd minipay-android
./gradlew test
./gradlew connectedAndroidTest
```

### Desktop Application
```bash
cd minipay-desktop
npm test
```

## 📝 Development Guidelines

### Code Style
- Follow platform-specific conventions
- Use meaningful variable names
- Add comments for complex logic
- Maintain consistent formatting

### Git Workflow
- Create feature branches
- Write descriptive commit messages
- Use pull requests for review
- Tag releases

## 🐛 Troubleshooting

### Common Issues

**Web App Issues:**
- Clear browser cache
- Check browser console for errors
- Verify Local Storage is enabled

**Android App Issues:**
- Clear app data
- Check logcat for errors
- Verify API configuration
- Ensure Google Play Services are updated

**Desktop App Issues:**
- Clear app cache
- Check developer console
- Verify Node.js version
- Reinstall dependencies

## 📄 License

MIT License - Copyright (c) 2025 Olawale Abdul-Ganiyu

## 👤 Developer

**Olawale Abdul-Ganiyu**
- Email: olawalztegan@gmail.com
- Role: Full Stack Developer
- Specialization: Financial Technology Applications

## 🙏 Acknowledgments

- MiniPay (Opera) for inspiration
- Open Source Community
- Android Developers
- Electron Community

## 📞 Support

For support, please contact:
- Email: olawalztegan@gmail.com
- Subject: MiniPay Support Request

---

**Version:** 2.0.0  
**Last Updated:** 2025  
**Status:** Production Ready