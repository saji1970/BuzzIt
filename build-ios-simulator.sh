#!/bin/bash

echo "🍎 Building iOS App for Simulator"
echo "==================================="
echo ""

# Function to find and setup Node.js
setup_nodejs() {
    # Try to source common profile files
    [ -f ~/.bash_profile ] && source ~/.bash_profile 2>/dev/null
    [ -f ~/.zshrc ] && source ~/.zshrc 2>/dev/null
    [ -f ~/.bashrc ] && source ~/.bashrc 2>/dev/null
    
    # Check if node is now available
    if command -v node >/dev/null 2>&1; then
        echo "✅ Found Node.js: $(node --version)"
        return 0
    fi
    
    # Try to find node in common locations
    if [ -f "/usr/local/bin/node" ]; then
        export PATH="/usr/local/bin:$PATH"
        echo "✅ Found Node.js in /usr/local/bin"
        return 0
    fi
    
    # Try nvm locations
    if [ -d "$HOME/.nvm" ]; then
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
        if command -v node >/dev/null 2>&1; then
            echo "✅ Found Node.js via nvm: $(node --version)"
            return 0
        fi
    fi
    
    # Try homebrew
    if [ -f "/opt/homebrew/bin/node" ]; then
        export PATH="/opt/homebrew/bin:$PATH"
        echo "✅ Found Node.js via Homebrew"
        return 0
    fi
    
    echo "❌ Node.js not found. Please install Node.js or add it to your PATH"
    return 1
}

# Setup Node.js
if ! setup_nodejs; then
    exit 1
fi

# Check if we're in the right directory
if [ ! -d "ios" ]; then
    echo "❌ Error: ios directory not found!"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Check for Xcode
if ! command -v xcodebuild >/dev/null 2>&1; then
    echo "❌ Error: xcodebuild not found!"
    echo "Please install Xcode from the Mac App Store"
    echo "Then run: sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer"
    exit 1
fi

echo "✅ Found Xcode: $(xcodebuild -version | head -1)"
echo ""

# Check for CocoaPods
if ! command -v pod >/dev/null 2>&1; then
    echo "⚠️  CocoaPods not found"
    echo "   Install via: sudo gem install cocoapods"
    echo ""
fi

echo "📦 Checking dependencies..."
echo "----------------------------"
# Make sure node modules are installed
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    if command -v npm >/dev/null 2>&1; then
        npm install
    else
        echo "❌ npm not found. Please install Node.js"
        exit 1
    fi
fi

echo ""
echo "🔨 Building for iOS Simulator with React Native CLI..."
echo "------------------------------------------------------"
echo ""
echo "This will build and launch the app in the iOS Simulator"
echo "This may take a few minutes on first build..."
echo ""

# Make sure CocoaPods dependencies are installed
if [ ! -d "ios/Pods" ]; then
    echo "Installing CocoaPods dependencies..."
    (cd ios && pod install)
fi

# Use React Native CLI to build and launch the app
if command -v npx >/dev/null 2>&1; then
    npx react-native run-ios "$@"
else
    echo "❌ npx not found. Please install Node.js (which includes npx)"
    exit 1
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build and launch completed successfully!"
    echo ""
    echo "📱 The app should now be running in the iOS Simulator"
    echo ""
    echo "💡 Build output location (for reference):"
    echo "   ios/build/Build/Products/Debug-iphonesimulator/"
    echo ""
else
    echo ""
    echo "❌ Build failed!"
    echo "Please check the error messages above"
    echo ""
    echo "💡 Alternative: You can also build manually:"
    echo "   1. cd ios && pod install && cd .."
    echo "   2. open ios/Buzzit.xcworkspace"
    echo "   3. Select simulator in Xcode and press Cmd+R"
    exit 1
fi

