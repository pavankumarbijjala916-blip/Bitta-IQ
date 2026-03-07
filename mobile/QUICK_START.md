# Battery Buddy Mobile App - Quick Start

## ⚡ 5-Minute Quick Start

### 1. **Install & Setup** (2 minutes)

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install
```

### 2. **Configure Firebase** (1 minute)

Copy your Firebase config:

```bash
cp .env.example .env
```

Edit `.env` and paste your Firebase credentials from the web project.

### 3. **Run the App** (2 minutes)

```bash
# Start Expo
npm start

# Choose your platform:
# Type 'i' for iOS simulator
# Type 'a' for Android emulator
# Scan QR for physical device with Expo Go app
```

✅ App is now running!

---

## 🎯 What's Available

### 📱 **Screens**

| Screen | Path | Features |
|--------|------|----------|
| **Login** | Auth | Email/password, forgot password option |
| **Register** | Auth | Create account, password validation |
| **Dashboard** | Main | Battery stats, quick actions, recent batteries |
| **Monitor** | Main | List all batteries, add new battery |
| **Battery Details** | Main | Full specs, health assessment, recommendations |
| **Alerts** | Main | Real-time notifications, severity levels |
| **Chat** | Main | AI assistant for battery guidance |
| **Settings** | Main | Account, notifications, preferences |

### 🔑 **Key Features**

✅ Firebase authentication (login/register)  
✅ Real-time battery monitoring  
✅ Health assessment & predictions  
✅ Multi-battery management  
✅ Push notifications  
✅ AI-powered chatbot  
✅ Offline support (AsyncStorage)  
✅ Full TypeScript support  

---

## 📁 Project Structure

```
mobile/
├── App.tsx                      # Entry point & Navigation
├── src/
│   ├── screens/auth/           # Login, Register, Forgot Password
│   ├── screens/main/           # All main app screens
│   ├── services/firebase.ts    # Firebase configuration
│   ├── stores/                 # Zustand state (auth, battery)
│   ├── components/             # Reusable components
│   └── types/                  # TypeScript definitions
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
└── .env.example               # Environment template
```

---

## 🚀 Common Commands

```bash
# Start development server
npm start

# Start with specific platform
npm run android
npm run ios
npm run web

# Lint code
npm run lint

# Type check
npm run type-check

# Build for production
npm run build:ios
npm run build:android

# Test
npm test
```

---

## 🔐 Authentication

### **Login**
1. Tap "Sign In" on login screen
2. Enter email and password
3. App authenticates with Firebase
4. Session saved to device

### **Register**
1. Tap "Sign Up" link
2. Enter email, full name, password
3. Password must meet requirements:
   - ✓ 8+ characters
   - ✓ Uppercase letter
   - ✓ Lowercase letter
   - ✓ Number
   - ✓ Special character

### **Forgot Password**
1. Tap "Forgot Password?" on login
2. Enter email
3. Check email for reset link
4. Click link to reset password

---

## 📋 Using the App

### **Add a Battery**

1. Tap **Monitor** tab
2. Tap **+ Add New Battery** button
3. Fill in details:
   - Battery Type (Li-ion, Lead-Acid, etc.)
   - Manufacturer
   - Serial Number
   - Voltage, Temperature, Cycles, Capacity
4. Tap **Register Battery**

### **Check Battery Health**

1. Go to **Dashboard** or **Monitor**
2. Tap a battery card
3. View:
   - Health status (Good/Moderate/Poor)
   - Specifications
   - Recommendations
   - Last assessment date

### **Get Battery Help**

1. Tap **Chat** tab (speech bubble icon)
2. Ask questions like:
   - "What's a good battery health?"
   - "How to recycle batteries?"
   - "What do charge cycles mean?"
3. Get instant AI responses

### **Manage Alerts**

1. Tap **Alerts** tab
2. View all notifications
3. Tap to mark as read
4. See unread badge (red dot)

### **Configure Settings**

1. Tap **Settings** tab (gear icon)
2. Manage:
   - Change password
   - Link account info
   - Enable/disable notifications
   - Set preferences
3. Tap **Sign Out** to logout

---

## 🎨 UI/UX Features

✨ **Modern Design**
- Clean, intuitive interface
- Smooth animations
- Responsive layouts
- Material Design icons (6000+ icons)

🎯 **Accessibility**
- Clear color contrast
- Readable fonts
- Touch-friendly buttons
- Logical tab order

📱 **Mobile Optimized**
- Full-screen experiences
- Bottom tab navigation
- Safe area handling
- Keyboard-aware forms

---

## 🔄 Syncing with Web App

The mobile app uses the **same Firebase backend** as your web app:

✅ Login on mobile → See data from web  
✅ Register battery on app → See on web  
✅ Delete on web → Gone from mobile  
✅ All data synchronized in real-time  

---

## 📝 Customization

### **Change Colors**

Edit color scheme in screen files:

```typescript
// Primary color: #10b981
// Success: #10b981
// Warning: #f59e0b
// Error: #ef4444

// Update in any StyleSheet
backgroundColor: '#10b981'  // Change to your color
```

### **Add New Screen**

1. Create new file in `src/screens/main/NewScreen.tsx`
2. Add to `App.tsx` navigation
3. Add tab icon in `Tab.Navigator`
4. Import and use!

### **Customize Theme**

Edit `App.tsx` to change:
- Tab bar colors
- Header styles
- Navigation animations
- Font sizes

---

## 🐛 Common Issues

### **"Firebase is not initialized"**
→ Check `.env` file has correct Firebase credentials

### **"App won't start"**
→ Run `npm install` again
→ Clear cache: `expo start --clear`

### **"Can't connect to Firebase"**
→ Check internet connection
→ Verify Firebase security rules allow read/write
→ Check if app is registered in Firebase Console

### **"Login not working"**
→ Verify email/password is correct
→ Check if user exists in Firebase
→ Ensure Firebase Auth is enabled

---

## 📚 Learning Resources

- **Expo Docs**: https://docs.expo.dev/
- **React Native**: https://reactnative.dev/
- **Firebase**: https://firebase.google.com/docs/
- **TypeScript**: https://www.typescriptlang.org/docs/

---

## 🎯 Next Steps

1. ✅ Install dependencies
2. ✅ Configure Firebase
3. ✅ Run `npm start`
4. ✅ Login or register account
5. ✅ Add your first battery
6. ✅ Check health assessment
7. ✅ Explore all features

---

## 📞 Need Help?

1. Check **Troubleshooting** section above
2. Review screen-specific documentation
3. Check Firebase security rules
4. Increase debug logging:

```typescript
// In App.tsx
import { enableLogging } from 'firebase/app'
enableLogging(true)
```

---

**Version**: 1.0.0  
**Platform Support**: iOS 13+ | Android 21+  
**Backend**: Firebase  
**Status**: Production Ready  

Happy monitoring! 🔋✨
