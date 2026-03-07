# 🚀 Battery Buddy Mobile - Launch Guide

## ✅ Setup Complete!

Your mobile app has been fully configured and all dependencies are installed. The app is **ready to test**.

---

## 🎯 Quick Start (Choose One Platform)

### Option 1: iOS Simulator (macOS only)
```bash
cd mobile
npm run ios
```
This will:
- Start the Expo dev server
- Launch the iOS Simulator
- Automatically load your app

### Option 2: Android Emulator
```bash
cd mobile
npm run android
```
This will:
- Start the Expo dev server
- Launch the Android Emulator
- Automatically load your app

### Option 3: Physical Device (Recommended for full features)
```bash
cd mobile
npm start
```
Then:
1. **Show QR Code**: Open the Expo CLI menu and select "w" for web or press the platform option
2. **Scan with Expo Go**:
   - Download the [Expo Go app](https://expo.dev/go) on your phone
   - Open the app and scan the QR code shown in terminal
   - Your app will open on the device!

---

## 🔧 First Run Checklist

### Before you launch:
- [ ] Firebase config in `.env` (optional - app can run without for testing)
- [ ] Port 8081 is available (or Expo will use 8082)
- [ ] At least 2GB free disk space
- [ ] Node.js/npm is available in terminal

### During first launch:
- [ ] Allow permissions when prompted
- [ ] Wait for Expo bundler to finish (may take 1-2 minutes first run)
- [ ] Don't close the terminal - it keeps the dev server running

---

## 🧪 Test the App

Once the app loads, test these features:

### 1. Authentication
```
✓ Click "Sign Up"
✓ Enter email and password (min 8 chars with A-Z, a-z, 0-9, special char)
✓ Verify password requirements are checked ✓
✓ Create account
✓ You should see Dashboard
```

### 2. Dashboard
```
✓ See "Welcome, [Your Name]"
✓ Check Battery Health stats
✓ See "Logout" button in top right
```

### 3. Battery Management
```
✓ Go to "Monitor" tab
✓ Click "Add Battery" button
✓ Fill in battery details:
  - Type: Li-ion (from dropdown)
  - Manufacturer: TestCorp
  - Serial: SN123456
  - Voltage: 12.5
  - Temperature: 25
  - Cycles: 500
  - Capacity: 100
✓ Click "Register Battery"
✓ Battery should appear in list
```

### 4. Other Features
```
✓ Alerts tab: View sample alerts
✓ Chat tab: Interact with chatbot
✓ Settings tab: View account and preferences
```

---

## 🐛 Troubleshooting

### Issue: "Port 8081 is already in use"
**Solution:**
```bash
# Kill process using port 8081
# On Windows:
netstat -ano | findstr :8081
taskkill /PID <process_id> /F

# Then try again:
npm start
```

### Issue: "Unable to find expo in this project"
**Solution:**
```bash
cd mobile
npm install
```

### Issue: "Metro bundler failed"
**Solution:**
```bash
# Clear cache and try again
npm start -- --clear
```

### Issue: "App is blank/white screen"
**Solution:**
1. Check browser console for errors
2. Ensure `.env` file exists (or .env.example as fallback)
3. Check App.tsx imports by running: `npm run type-check`
4. Hard refresh: Kill dev server, delete cache, restart

### Issue: "Module not found" errors
**Solution:**
```bash
rm -rf node_modules
npm install
```

### Issue: "Firebase connection errors"
**Solution:**
- This is normal if `.env` is not configured
- App will still work in demo mode with mock data
- To enable real Firebase:
  1. Copy `.env.example` to `.env`
  2. Add your Firebase credentials
  3. Restart dev server

---

## 📱 Platform-Specific Notes

### iOS Simulator
- Requires macOS and Xcode
- First run downloads simulator image (~2-3 GB)
- Swipe right to go back between screens

### Android Emulator
- Requires Android Studio
- More demanding on RAM
- Scroll horizontally to see all buttons on smaller screens
- Back button (hardware) closes modals

### Physical Device
- **iOS**: Tap back with gesture (swipe left)
- **Android**: Use hardware back button
- **Both**: Gestures may vary from simulator
- **Both**: Network must be same as development machine

---

## 🎨 Customization

### Change App Colors
Edit `App.tsx` - look for color values like `#10b981` (emerald green)

### Change App Name
Edit `package.json` → `"expo.name"`

### Change Splash Screen
Replace `mobile/assets/splash.png` with your image

### Change App Icon
Replace `mobile/assets/icon.png` with your image (1024x1024)

---

## 📊 Development Commands

```bash
# Start development server (all platforms)
npm start

# Run on specific platform
npm run ios       # iOS Simulator
npm run android   # Android Emulator
npm run web       # Web browser (if configured)

# Check TypeScript
npm run type-check

# Lint code
npm run lint

# Build for production
npm run build:ios
npm run build:android

# Submit to app stores
npm run submit:ios
npm run submit:android
```

---

## 🔐 Security Notes

- API keys in `.env` are private - never commit to git
- `.gitignore` excludes `.env` automatically
- Firebase security rules should be configured in Firebase Console
- Test with real Firebase credentials before production

---

## 📚 Next Steps

### After First Test:
1. ✅ Verify app loads and no crashes
2. ✅ Test each screen manually
3. ✅ Configure Firebase credentials in `.env`
4. ✅ Test with real data
5. ✅ Check console for any warnings

### For Production:
1. Update app version in `package.json`
2. Create app icons and splash screens
3. Generate signing certificates
4. Run `npm run build:ios` and `npm run build:android`
5. Submit to App Store and Google Play

### Learn More:
- [Expo Documentation](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [Firebase Setup](https://firebase.google.com/docs)
- [EAS Build Guide](https://docs.expo.dev/build/setup)

---

## 💬 Getting Help

If you encounter issues:

1. **Check the console** in Expo CLI for error messages
2. **Clear cache**: `npm start -- --clear`
3. **Reinstall dependencies**: `rm -rf node_modules && npm install`
4. **Check TypeScript**: `npm run type-check`
5. **Check `.env` file** exists with proper formatting

---

## 🎉 You're Ready!

Everything is set up. Your app is ready to run. Choose a platform above and launch!

```bash
npm start
# Then select your platform (i for iOS, a for Android, etc.)
```

**Happy coding! 🚀**
