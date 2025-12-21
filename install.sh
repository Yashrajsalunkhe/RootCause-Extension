#!/bin/bash

echo "======================================"
echo "  Performance Detective - Installer  "
echo "======================================"
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
echo "======================================"
echo "  Installation Instructions"
echo "======================================"
echo ""
echo "1. Open Google Chrome"
echo "2. Navigate to: chrome://extensions/"
echo "3. Enable 'Developer mode' (toggle in top-right)"
echo "4. Click 'Load unpacked'"
echo "5. Select this directory:"
echo "   $(pwd)"
echo ""
echo "======================================"
echo "  Testing Instructions"
echo "======================================"
echo ""
echo "1. Navigate to any website (or open test-page.html)"
echo "2. Open Chrome DevTools (F12 or Cmd+Option+I)"
echo "3. Click the 'Performance Detective' tab"
echo "4. Click 'Analyze Page'"
echo "5. Review the results!"
echo ""
echo "For more details, see TESTING.md"
echo ""
echo "======================================"
echo "  Quick Test Page"
echo "======================================"
echo ""
echo "Test page location:"
echo "file://$(pwd)/test-page.html"
echo ""
echo "Or run:"
echo "  google-chrome test-page.html"
echo ""
echo "======================================"

# Try to open Chrome extensions page (if on Linux with xdg-open)
if command -v xdg-open &> /dev/null; then
    read -p "Would you like to open chrome://extensions/ now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        xdg-open "chrome://extensions/" 2>/dev/null || google-chrome "chrome://extensions/" 2>/dev/null
        echo "✅ Opening Chrome extensions page..."
    fi
fi

echo ""
echo "✅ Setup complete! Follow the installation instructions above."
echo ""
