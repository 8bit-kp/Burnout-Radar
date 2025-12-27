#!/bin/bash

# Personal Signal Intelligence - Quick Start Script

echo "🚀 Personal Signal Intelligence - Setup"
echo "========================================"
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "✅ .env.local file found"
else
    echo "⚠️  .env.local file not found"
    echo "Creating from template..."
    cp .env.example .env.local
    echo "✅ Created .env.local from .env.example"
    echo ""
    echo "🔧 IMPORTANT: You must edit .env.local with your Firebase and Gemini API credentials"
    echo ""
    echo "To get Firebase credentials:"
    echo "  1. Go to https://console.firebase.google.com"
    echo "  2. Create a new project"
    echo "  3. Enable Authentication (Email/Password)"
    echo "  4. Create Firestore Database"
    echo "  5. Copy credentials to .env.local"
    echo ""
    echo "To get Gemini API key:"
    echo "  1. Go to https://makersuite.google.com/app/apikey"
    echo "  2. Create an API key"
    echo "  3. Add to .env.local"
    echo ""
    read -p "Press Enter after you've configured .env.local to continue..."
fi

echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "🏗️  Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "⚠️  Build completed with warnings (this is normal if Firebase credentials are not yet configured)"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser"
echo ""
echo "📚 Documentation:"
echo "  - README.md - Full documentation"
echo "  - SETUP.md - Step-by-step setup guide"
echo "  - CHECKLIST.md - Pre-launch checklist"
echo "  - PROJECT_SUMMARY.md - Project overview"
echo ""
