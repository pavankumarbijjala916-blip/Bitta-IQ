# Battery Buddy Mobile App - React Native Setup Guide

## 📱 Overview

Battery Buddy Mobile is a React Native application for iOS and Android that connects to the same Firebase backend as your web application. It provides battery monitoring, health assessment, and intelligent recommendations on the go.

## ✨ Features

- **User Authentication** - Secure login/registration with Firebase
- **Battery Monitoring** - Track multiple batteries with real-time health status
- **Battery Registration** - Easy form-based battery data entry
- **Health Assessment** - AI-powered battery health predictions
- **Alerts & Notifications** - Real-time alerts for battery issues
- **Chatbot Assistant** - AI-powered guidance on battery care
- **Settings Management** - Manage account, preferences, and notifications

## 🛠️ Prerequisites

Before you start, ensure you have:

1. **Node.js** (v18+) - [Download](https://nodejs.org/)
2. **npm** or **yarn** - Comes with Node.js
3. **Expo CLI** - Install with `npm install -g expo-cli`
4. **Firebase Project** - Use the same project as your web app
5. **iOS Requirements** (for iOS build):
   - macOS
   - Xcode 14+
   - iOS 13+

6. **Android Requirements** (for Android build):
   - Android Studio
   - Android SDK (API 21+)
   - Java JDK 11+

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd mobile
npm install
# or
yarn install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your Firebase credentials:

```
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Get these values from:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click ⚙️ Settings → Project Settings
4. Copy the config values

### 3. Start Development Server

```bash
# Start Expo development server
npm start

# Then choose:
# Press 'i' - Open iOS simulator
# Press 'a' - Open Android emulator
# Scan QR code - Use Expo Go app on physical device
```

## 📦 Project Structure

```
mobile/
├── App.tsx                 # Main app entry point
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── .env.example           # Environment variables template
├── src/
│   ├── screens/
│   │   ├── auth/          # Login, Register, Forgot Password
│   │   └── main/          # Dashboard, Monitor, Alerts, Settings, Chat
│   ├── components/        # Reusable components
│   ├── services/          # Firebase & API services
│   ├── stores/            # Zustand state management
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
└── assets/                # App icons and images
```

## 🔐 Authentication Flow

1. **Login** → User enters email/password
2. **Register** → Create new account with password validation
3. **Forgot Password** → Request email reset link
4. **Session Management** → Automatic token refresh

## 📡 Firebase Integration

### Real-time Database Structure

```
users/{userId}/
  ├── email
  ├── displayName
  └── createdAt

batteries/{batteryId}/
  ├── userId
  ├── batteryType
  ├── voltage
  ├── temperature
  ├── chargeCycles
  └── healthStatus

notifications/{notificationId}/
  ├── userId
  ├── type
  ├── message
  └── timestamp
```

## 🎯 Core Screens

### 1. **Login Screen** (`LoginScreen.tsx`)
- Email/password authentication
- Forgot password link
- Sign up navigation

### 2. **Register Screen** (`RegisterScreen.tsx`)
- Form-based registration
- Real-time password validation
- Security requirements checklist

### 3. **Dashboard** (`DashboardScreen.tsx`)
- Health statistics (Good/Moderate/Poor)
- Quick actions
- Recent batteries
- Welcome message

### 4. **Battery Monitor** (`BatteryMonitorScreen.tsx`)
- List all batteries
- Battery health indicators
- Quick stats view
- Add new battery button

### 5. **Battery Details** (`BatteryDetailsScreen.tsx`)
- Complete battery specifications
- Health assessment
- Recommendations
- Edit/delete options

### 6. **Register Battery** (`RegisterBatteryScreen.tsx`)
- Battery type selection
- Specification input (voltage, temp, cycles, capacity)
- Form validation
- Success confirmation

### 7. **Alerts** (`AlertsScreen.tsx`)
- Real-time alert notifications
- Alert severity levels
- Mark as read functionality
- Empty state handling

### 8. **Chatbot** (`ChatbotScreen.tsx`)
- AI-powered assistant
- Battery care guidance
- Health recommendations
- Message history

### 9. **Settings** (`SettingsScreen.tsx`)
- Account management
- Notification preferences
- Privacy settings
- About & Help

## 🔌 API Integration

### Authentication Service
```typescript
useAuthStore.login(email, password)
useAuthStore.register(email, password, displayName)
useAuthStore.logout()
```

### Battery Service
```typescript
useBatteryStore.fetchBatteries()
useBatteryStore.addBattery(batteryData)
useBatteryStore.updateBattery(id, updates)
useBatteryStore.deleteBattery(id)
```

## 🎨 Styling

The app uses:
- **Tailwind CSS** - For web-to-mobile color consistency
- **React Native StyleSheet** - Native performance
- **Linear Gradient** - Beautiful gradient effects
- **Material Community Icons** - 6000+ icons

### Color Scheme

```
Primary: #10b981 (Emerald)
Success: #10b981
Warning: #f59e0b (Amber)
Error: #ef4444 (Red)
Dark: #1f2937
Light: #f9fafb
```

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Test Coverage
```bash
npm test -- --coverage
```

### E2E Testing
```bash
npm run test:e2e
```

## 📱 Building for Distribution

### iOS Build
```bash
npm run build:ios

# or with EAS (recommended)
eas build --platform ios
```

### Android Build
```bash
npm run build:android

# or with EAS
eas build --platform android
```

### Submit to App Stores
```bash
# iOS App Store
eas submit --platform ios

# Google Play
eas submit --platform android
```

## 🔑 Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| React | 18.2.0 | UI Framework |
| React Native | 0.73.0 | Mobile Framework |
| Expo | 50.0.0 | Development & Build |
| Firebase | 10.7.0 | Backend Services |
| Zustand | 4.4.0 | State Management |
| React Navigation | 6.1.9 | Routing |
| TypeScript | 5.3.0 | Type Safety |

## 🐛 Troubleshooting

### **Metro Bundler Issues**
```bash
# Clear cache and restart
expo start --clear
```

### **Firebase Connection Error**
- Verify `.env` credentials
- Check Firebase security rules
- Ensure app is registered in Firebase Console

### **iOS Build Fails**
```bash
# Clean Xcode build
rm -rf ios/Pods
cd ios && pod install && cd ..
```

### **Android Build Fails**
```bash
# Clean Gradle
cd android && ./gradlew clean && cd ..
```

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Firebase Mobile Guide](https://firebase.google.com/docs/guides)
- [React Navigation](https://reactnavigation.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

To contribute to Battery Buddy Mobile:

1. Create a feature branch (`git checkout -b feature/new-feature`)
2. Commit changes (`git commit -am 'Add new feature'`)
3. Push to branch (`git push origin feature/new-feature`)
4. Create Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 📞 Support

For issues or questions:
1. Check [Troubleshooting](#-troubleshooting) section
2. Search existing [GitHub Issues](https://github.com/your-repo/issues)
3. Create a new issue with detailed information
4. Contact support: support@batterbuddy.com

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Status**: Ready for Development
