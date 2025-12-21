#!/bin/bash

echo "============================================="
echo "  RootCause - Cross-Browser Build Script    "
echo "============================================="
echo ""

# Function to copy extension files to build directory
copy_extension_files() {
    local build_dir=$1
    
    # Create directory structure
    mkdir -p "$build_dir"/{background,core,devtools/{panel},icons,popup}
    
    # Copy core files
    cp -r background/* "$build_dir/background/"
    cp -r core/* "$build_dir/core/"
    cp -r devtools/* "$build_dir/devtools/"
    cp -r icons/* "$build_dir/icons/"
    cp -r popup/* "$build_dir/popup/"
    cp test-page.html "$build_dir/"
}

# Function to build Chrome/Chromium package
build_chrome() {
    echo "📦 Building Chrome/Chromium package..."
    local build_dir="build/chrome"
    
    copy_extension_files "$build_dir"
    cp manifest.json "$build_dir/"
    
    echo "✅ Chrome package built in: $build_dir"
    echo "   Install by loading unpacked extension from chrome://extensions/"
    echo ""
}

# Function to build Firefox package
build_firefox() {
    echo "🦊 Building Firefox package..."
    local build_dir="build/firefox"
    
    copy_extension_files "$build_dir"
    cp manifest-firefox.json "$build_dir/manifest.json"
    
    # Create web-ext compatible package
    if command -v web-ext &> /dev/null; then
        echo "📋 Creating Firefox .xpi package..."
        cd "$build_dir"
        web-ext build --overwrite-dest
        cd - > /dev/null
        echo "✅ Firefox .xpi created in: $build_dir/web-ext-artifacts/"
    else
        echo "✅ Firefox package built in: $build_dir"
        echo "   Install web-ext for .xpi packaging: npm install -g web-ext"
    fi
    
    echo "   Install by going to about:debugging -> This Firefox -> Load Temporary Add-on"
    echo ""
}

# Function to build Edge package
build_edge() {
    echo "🌐 Building Microsoft Edge package..."
    local build_dir="build/edge"
    
    copy_extension_files "$build_dir"
    cp manifest-edge.json "$build_dir/manifest.json"
    
    echo "✅ Edge package built in: $build_dir"
    echo "   Install by loading unpacked extension from edge://extensions/"
    echo ""
}

# Function to build Safari package placeholder
build_safari() {
    echo "🍎 Building Safari package placeholder..."
    local build_dir="build/safari"
    
    copy_extension_files "$build_dir"
    cp manifest.json "$build_dir/"
    
    # Create Safari-specific instructions
    cat > "$build_dir/SAFARI_INSTRUCTIONS.md" << 'EOF'
# Safari Extension Setup

Safari extensions require additional steps due to Apple's security requirements:

## Requirements
- Xcode 12+
- macOS 10.14.6+
- Apple Developer Account (for distribution)

## Steps
1. Convert this extension using Safari's web extension converter:
   ```bash
   xcrun safari-web-extension-converter /path/to/this/folder
   ```

2. Open the generated Xcode project
3. Build and run in Xcode
4. Enable the extension in Safari Preferences > Extensions

## Note
Safari has limited support for some extension APIs. Some features may not work as expected.
EOF
    
    echo "✅ Safari package prepared in: $build_dir"
    echo "   See SAFARI_INSTRUCTIONS.md for conversion steps"
    echo ""
}

# Function to create package.json for build tools
create_package_json() {
    if [ ! -f "package.json" ]; then
        echo "📋 Creating package.json for build tools..."
        cat > package.json << 'EOF'
{
  "name": "rootcause-extension",
  "version": "1.0.0",
  "description": "Cross-browser performance analysis extension",
  "scripts": {
    "build": "./build.sh",
    "build:chrome": "./build.sh chrome",
    "build:firefox": "./build.sh firefox", 
    "build:edge": "./build.sh edge",
    "build:safari": "./build.sh safari",
    "build:all": "./build.sh all"
  },
  "devDependencies": {
    "web-ext": "^7.0.0"
  }
}
EOF
        echo "✅ Created package.json"
    fi
}

# Main build function
main() {
    # Check if we're in the right directory
    if [ ! -f "manifest.json" ]; then
        echo "❌ Error: manifest.json not found. Please run this script from the extension directory."
        exit 1
    fi
    
    # Create build directory
    mkdir -p build
    
    # Create package.json if it doesn't exist
    create_package_json
    
    # Parse arguments
    local target=${1:-all}
    
    case $target in
        chrome)
            build_chrome
            ;;
        firefox)
            build_firefox
            ;;
        edge)
            build_edge
            ;;
        safari)
            build_safari
            ;;
        all)
            build_chrome
            build_firefox
            build_edge
            build_safari
            ;;
        *)
            echo "Usage: $0 [chrome|firefox|edge|safari|all]"
            echo ""
            echo "Examples:"
            echo "  $0           # Build all browsers"
            echo "  $0 chrome    # Build only Chrome"
            echo "  $0 firefox   # Build only Firefox"
            exit 1
            ;;
    esac
    
    echo "============================================="
    echo "🎉 Build complete!"
    echo ""
    echo "Browser-specific packages are in the build/ directory:"
    echo "  📁 build/chrome/   - Chrome/Chromium"
    echo "  📁 build/firefox/  - Firefox"
    echo "  📁 build/edge/     - Microsoft Edge"
    echo "  📁 build/safari/   - Safari (requires Xcode)"
    echo ""
    echo "For installation instructions, see the README in each build folder."
    echo "============================================="
}

# Run main function with all arguments
main "$@"
