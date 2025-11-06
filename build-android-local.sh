#!/bin/bash

echo "🤖 Building Android APK Locally"
echo "=================================="
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
    echo ""
    echo "You can install Node.js from:"
    echo "  - https://nodejs.org/"
    echo "  - Or use Homebrew: brew install node"
    echo "  - Or use nvm: curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    return 1
}

# Setup Node.js
if ! setup_nodejs; then
    exit 1
fi

# Check if we're in the right directory
if [ ! -d "android" ]; then
    echo "❌ Error: android directory not found!"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Navigate to android directory
cd android

echo ""
echo "📦 Checking dependencies..."
echo "----------------------------"
# Make sure node modules are installed
cd ..
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    if command -v npm >/dev/null 2>&1; then
        npm install
    else
        echo "❌ npm not found. Please install Node.js"
        exit 1
    fi
fi
cd android

echo ""
echo "🔨 Building Release APK..."
echo "--------------------------"
echo ""
echo "This may take a few minutes..."
echo ""

# Check for Java
if ! command -v java >/dev/null 2>&1; then
    echo "⚠️  Warning: Java not found in PATH. Make sure Java is installed."
    echo "   Android builds require Java JDK (version 11 or higher recommended)"
fi

# Make gradlew executable
chmod +x gradlew

# Ensure Node.js is in PATH for Gradle
export PATH="$PATH:$(dirname $(which node 2>/dev/null || echo ''))"

# Build the release APK
# Pass PATH to Gradle so it can find node
PATH="$PATH" ./gradlew assembleRelease

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build completed successfully!"
    echo ""
    
    # Find the APK file
    APK_PATH=$(find app/build/outputs/apk/release -name "*.apk" 2>/dev/null | head -1)
    
    if [ -n "$APK_PATH" ]; then
        APK_FULL_PATH=$(pwd)/$APK_PATH
        APK_SIZE=$(du -h "$APK_FULL_PATH" | cut -f1)
        
        echo "📱 APK Location:"
        echo "   $APK_FULL_PATH"
        echo ""
        echo "📊 APK Size: $APK_SIZE"
        echo ""
        echo "📲 To install on your Android device:"
        echo "   1. Transfer the APK to your device"
        echo "   2. Enable 'Install from Unknown Sources' in Settings"
        echo "   3. Tap the APK file to install"
        echo ""
        echo "💡 Quick copy command (if on same machine):"
        echo "   adb install $APK_FULL_PATH"
        echo ""
    else
        echo "⚠️  APK file not found in expected location"
        echo "   Check: android/app/build/outputs/apk/release/"
    fi
else
    echo ""
    echo "❌ Build failed!"
    echo "Please check the error messages above"
    exit 1
fi

