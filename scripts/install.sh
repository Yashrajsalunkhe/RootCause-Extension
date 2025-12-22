#!/bin/bash

echo "=================================================="
echo "  RootCause - Cross-Browser Extension Installer  "
echo "=================================================="
echo ""

# Check if we're in the right directory
if [ ! -f "manifest.json" ]; then
    echo "❌ Error: manifest.json not found. Please run this script from the extension directory."
    exit 1
fi

echo "✅ Found manifest.json"

# Generate icons if they don't exist
if [ ! -f "icons/icon16.png" ] || [ ! -f "icons/icon48.png" ] || [ ! -f "icons/icon128.png" ]; then
    echo "📦 Generating icons..."
    ./generate-icons.sh
    if [ $? -ne 0 ]; then
        echo "⚠️  Warning: Icon generation failed. You may need to create icons manually."
    fi
else
    echo "✅ Icons already exist"
fi

echo ""
echo "=================================================="
echo "  Browser Selection"
echo "=================================================="
echo ""
echo "Choose your browser for installation instructions:"
echo "1) Chrome/Chromium"
echo "2) Firefox"
echo "3) Microsoft Edge"
echo "4) Safari"
echo "5) Build for all browsers"
echo "6) Show all installation methods"
echo ""

read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        echo ""
        echo "=================================================="
        echo "  Google Chrome / Chromium Installation"
        echo "=================================================="
        echo ""
        echo "1. Open Google Chrome or Chromium"
        echo "2. Navigate to: chrome://extensions/"
        echo "3. Enable 'Developer mode' (toggle in top-right)"
        echo "4. Click 'Load unpacked'"
        echo "5. Select this directory: $(pwd)"
        ;;
    2)
        echo ""
        echo "=================================================="
        echo "  Firefox Installation"
        echo "=================================================="
        echo ""
        echo "Option A - Temporary Installation:"
        echo "1. Open Firefox"
        echo "2. Navigate to: about:debugging"
        echo "3. Click 'This Firefox' in the sidebar"
        echo "4. Click 'Load Temporary Add-on'"
        echo "5. Select: $(pwd)/manifest-firefox.json"
        echo ""
        echo "Option B - Build Package:"
        echo "1. Run: ./build.sh firefox"
        echo "2. Install from: build/firefox/"
        ;;
    3)
        echo ""
        echo "=================================================="
        echo "  Microsoft Edge Installation"
        echo "=================================================="
        echo ""
        echo "1. Open Microsoft Edge"
        echo "2. Navigate to: edge://extensions/"
        echo "3. Enable 'Developer mode' (toggle in bottom-left)"
        echo "4. Click 'Load unpacked'"
        echo "5. Run: ./build.sh edge"
        echo "6. Select: build/edge/ directory"
        ;;
    4)
        echo ""
        echo "=================================================="
        echo "  Safari Installation"
        echo "=================================================="
        echo ""
        echo "Safari requires additional steps:"
        echo "1. Install Xcode from the App Store"
        echo "2. Run: ./build.sh safari"
        echo "3. Follow instructions in: build/safari/SAFARI_INSTRUCTIONS.md"
        echo ""
        echo "Note: Safari has limited extension API support."
        ;;
    5)
        echo ""
        echo "=================================================="
        echo "  Building for All Browsers"
        echo "=================================================="
        echo ""
        ./build.sh all
        exit 0
        ;;
    6)
        echo ""
        echo "=================================================="
        echo "  All Installation Methods"
        echo "=================================================="
        echo ""
        echo "🌐 CHROME/CHROMIUM:"
        echo "   1. Open chrome://extensions/"
        echo "   2. Enable Developer mode"
        echo "   3. Load unpacked from: $(pwd)"
        echo ""
        echo "🦊 FIREFOX:"
        echo "   1. Open about:debugging"
        echo "   2. Load temporary add-on"
        echo "   3. Select: manifest-firefox.json"
        echo ""
        echo "💙 MICROSOFT EDGE:"
        echo "   1. Run: ./build.sh edge"
        echo "   2. Open edge://extensions/"
        echo "   3. Load unpacked from: build/edge/"
        echo ""
        echo "🍎 SAFARI:"
        echo "   1. Run: ./build.sh safari"
        echo "   2. Follow Safari conversion guide"
        echo ""
        ;;
    *)
        echo "Invalid choice. Showing Chrome instructions as default."
        choice=1
        ;;
esac
echo ""
echo "=================================================="
echo "  Testing Instructions"
echo "=================================================="
echo ""
echo "After installation:"
echo "1. Navigate to any website (or open test-page.html)"
echo "2. Open Browser DevTools:"
echo "   - Chrome/Edge: F12 or Ctrl+Shift+I"
echo "   - Firefox: F12 or Ctrl+Shift+K"
echo "   - Safari: Cmd+Option+I"
echo "3. Look for the 'RootCause' tab in DevTools"
echo "4. Click 'Analyze Page' to see performance insights"
echo ""
echo "For detailed testing instructions, see TESTING.md"
echo ""
echo "=================================================="
echo "  Quick Test Page"
echo "=================================================="
echo ""
echo "Test page location:"
echo "file://$(pwd)/test-page.html"
echo ""
echo "Open with your browser:"
if command -v google-chrome &> /dev/null; then
    echo "  google-chrome test-page.html"
fi
if command -v firefox &> /dev/null; then
    echo "  firefox test-page.html"
fi
if command -v microsoft-edge &> /dev/null; then
    echo "  microsoft-edge test-page.html"
fi
echo ""
echo "=================================================="

# Try to open browser extensions page
if command -v xdg-open &> /dev/null; then
    case $choice in
        1)
            read -p "Open chrome://extensions/ now? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                xdg-open "chrome://extensions/" 2>/dev/null || google-chrome "chrome://extensions/" 2>/dev/null
                echo "✅ Opening Chrome extensions page..."
            fi
            ;;
        2)
            read -p "Open about:debugging now? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                xdg-open "about:debugging" 2>/dev/null || firefox "about:debugging" 2>/dev/null
                echo "✅ Opening Firefox debugging page..."
            fi
            ;;
        3)
            read -p "Open edge://extensions/ now? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                xdg-open "edge://extensions/" 2>/dev/null || microsoft-edge "edge://extensions/" 2>/dev/null
                echo "✅ Opening Edge extensions page..."
            fi
            ;;
    esac
fi

echo ""
echo "✅ Setup complete! Follow the installation instructions above."
echo ""
echo "💡 Pro tip: Run './build.sh' to create browser-specific packages"
echo ""
