#!/bin/bash

# Battery Buddy Mobile App - Setup Script
# This script automates the setup process

echo "🔋 Battery Buddy Mobile App - Setup"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js detected: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ npm detected: $(npm --version)"
echo ""

# Check if Expo is installed globally
if ! command -v expo &> /dev/null; then
    echo "📦 Installing Expo CLI globally..."
    npm install -g expo-cli
fi

echo "✅ Expo CLI detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "🔐 Setting up environment variables..."
    cp .env.example .env
    
    echo ""
    echo "⚠️  Please edit .env file with your Firebase credentials:"
    echo "   - EXPO_PUBLIC_FIREBASE_API_KEY"
    echo "   - EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"
    echo "   - EXPO_PUBLIC_FIREBASE_PROJECT_ID"
    echo "   - EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"
    echo "   - EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
    echo "   - EXPO_PUBLIC_FIREBASE_APP_ID"
    echo ""
    echo "Get these values from Firebase Console:"
    echo "https://console.firebase.google.com/project/YOUR_PROJECT/settings/general"
    echo ""
    
    read -p "Press Enter after you've configured .env..."
else
    echo "✅ .env file already exists"
fi

echo ""
echo "=================================="
echo "✨ Setup complete!"
echo ""
echo "🚀 To start the app, run:"
echo ""
echo "   npm start"
echo ""
echo "Then:"
echo "   • Press 'i' for iOS Simulator"
echo "   • Press 'a' for Android Emulator"
echo "   • Scan QR code with Expo Go app (physical device)"
echo ""
echo "📚 For more help, see:"
echo "   • QUICK_START.md - 5-minute quick start"
echo "   • SETUP_GUIDE.md - Detailed setup instructions"
echo "   • README.md - Full documentation"
echo ""
