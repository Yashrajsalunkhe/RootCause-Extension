# RootCause - Cross-Browser Performance Extension

RootCause is a cross-browser DevTools extension that explains **WHY** your website is slow in plain English, not just **WHAT** is wrong. Get root-cause narratives with actionable fixes.

## 🌐 Browser Support

| Browser | Status | Installation Method | Manifest Version |
|---------|--------|-------------------|------------------|
| **Chrome** | ✅ Full Support | Load Unpacked | V3 |
| **Chromium** | ✅ Full Support | Load Unpacked | V3 |
| **Microsoft Edge** | ✅ Full Support | Load Unpacked | V3 |
| **Firefox** | ✅ Full Support | Temporary Add-on | V2 |
| **Safari** | ⚠️ Limited Support | Requires Conversion | V3 |

## 🚀 Quick Install

### Option 1: Auto-Installer (Recommended)
```bash
git clone https://github.com/Yashrajsalunkhe/RootCause-Extension.git
cd RootCause-Extension
./install.sh
```

### Option 2: Build for Specific Browser
```bash
./build.sh chrome    # Chrome/Chromium
./build.sh firefox   # Firefox
./build.sh edge      # Microsoft Edge
./build.sh safari    # Safari (requires Xcode)
./build.sh all       # All browsers
```

## 📋 Manual Installation

### Google Chrome / Chromium
1. Open `chrome://extensions/`
2. Enable "Developer mode" (top-right toggle)
3. Click "Load unpacked"
4. Select the extension directory

### Mozilla Firefox
1. Open `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on"
4. Select `manifest-firefox.json`

### Microsoft Edge
1. Run `./build.sh edge`
2. Open `edge://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select `build/edge/` directory

### Safari
1. Install Xcode from App Store
2. Run `./build.sh safari`
3. Follow instructions in `build/safari/SAFARI_INSTRUCTIONS.md`

## 🔧 Browser-Specific Features

### All Browsers
- ✅ Performance timeline analysis
- ✅ Critical path identification
- ✅ Resource optimization suggestions
- ✅ Plain English explanations
- ✅ DevTools panel integration

### Chrome/Edge (Manifest V3)
- ✅ Service Worker background processing
- ✅ Advanced scripting API
- ✅ Full debugger access

### Firefox (Manifest V2)
- ✅ Background script processing
- ✅ Legacy scripting API
- ✅ Full debugger access
- ⚠️ Some V3 features unavailable

### Safari
- ⚠️ Limited extension API support
- ⚠️ Requires Xcode conversion
- ⚠️ Some features may not work

## 🛠️ Development

### Building for Development
```bash
# Install build dependencies (optional)
npm install

# Build all browser versions
npm run build

# Build specific browser
npm run build:chrome
npm run build:firefox
npm run build:edge
npm run build:safari
```

### File Structure
```
RootCause-Extension/
├── manifest.json           # Chrome/Edge manifest (V3)
├── manifest-firefox.json   # Firefox manifest (V2)
├── manifest-edge.json      # Edge-specific manifest (V3)
├── background/
│   └── service-worker.js   # Cross-browser background script
├── devtools/
│   ├── devtools.js         # Cross-browser devtools
│   └── panel/
│       ├── panel.html
│       ├── panel.js        # Cross-browser panel
│       └── panel.css
├── popup/
│   ├── popup.html
│   └── popup.js            # Cross-browser popup
├── core/                   # Core analysis modules
├── icons/                  # Browser icons
├── build.sh               # Cross-browser build script
└── install.sh             # Interactive installer
```

## 🔍 How It Works

1. **Inject Analysis Scripts**: Extension injects performance monitoring
2. **Collect Metrics**: Gathers timing, resources, and runtime data
3. **AI Analysis**: Processes data through dependency tracer and priority engine
4. **Human Translation**: Converts technical metrics to plain English
5. **Actionable Insights**: Provides specific optimization recommendations

## 📊 What It Analyzes

- **Critical Rendering Path**: Find the longest pole in the tent
- **Resource Dependencies**: Identify blocking resources
- **JavaScript Performance**: Detect long tasks and execution issues
- **Layout Stability**: Measure and explain layout shifts
- **Network Performance**: Analyze request timing and optimization
- **Bundle Analysis**: Identify optimization opportunities

## 🎯 Browser-Specific Notes

### Chrome/Chromium
- Best overall experience
- Full API support
- Fastest performance analysis

### Microsoft Edge
- Same features as Chrome
- Built-in privacy features
- Excellent development tools

### Firefox
- Uses Manifest V2 for compatibility
- Some advanced features limited
- Strong privacy protection

### Safari
- Requires Xcode for conversion
- Limited extension API support
- Manual installation process
- Some features may not work

## 🔧 Troubleshooting

### Common Issues

**Extension not loading:**
- Ensure you're using the correct manifest for your browser
- Check browser developer mode is enabled
- Verify all files are present

**DevTools panel not appearing:**
- Refresh the page after installing
- Check browser console for errors
- Try reloading the extension

**Analysis not working:**
- Ensure the website allows extension access
- Check if CSP policies block the extension
- Try on a different website

### Firefox Specific
```bash
# If temporary add-on installation fails
./build.sh firefox
# Then install from build/firefox/
```

### Safari Specific
```bash
# Requires Xcode and conversion
./build.sh safari
# Follow detailed instructions in build folder
```

## 🤝 Contributing

1. Fork the repository
2. Test across multiple browsers
3. Ensure cross-browser compatibility
4. Update browser support table
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙋 Support

- **Issues**: GitHub Issues
- **Documentation**: See `/docs` folder
- **Browser Compatibility**: Check browser support table above

---

**Made with ❤️ for web developers who want to understand performance, not just measure it.**
