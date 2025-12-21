# RootCause 🔍

**A Root-Cause Explainer for Web Performance**

RootCause is a Chrome DevTools extension that replaces technical "Audit Scores" with Root-Cause Narratives. Instead of telling you *what* is wrong (e.g., "LCP is 4.2s"), it tells you *why* it's happening in plain English (e.g., "Your hero image is waiting for a low-priority tracking script to finish").

## The Problem

Web performance tools like Lighthouse are **Data-Rich but Insight-Poor**:
- Developers get a list of 20+ "failed audits" but don't know the sequence of failure
- They don't know which fix will actually move the needle
- Performance engineering is a "dependency chain" problem—solving the wrong thing first provides zero results

## The Solution

RootCause provides three core features:

### 1. 🔍 The Dependency Tracer
Analyzes the Critical Rendering Path and identifies the "Longest Pole in the Tent"—the specific resource that held up the first paint.

### 2. 💬 The Human-Language Translator
Converts technical metrics into actionable stories:
- **TTFB** → "Your server took too long to respond. Is your database slow?"
- **Render Blocking** → "The browser froze because it was reading a massive CSS file it didn't need yet."
- **CLS** → "The page jumped because this image doesn't have a reserved height."

### 3. 🎯 The "Impact-First" Priority List
Instead of a score of 0–100, provides a timeline of fixes:
- **Critical**: "Fix this to see an immediate ~1s improvement."
- **Optimization**: "Do this to make the page feel smoother on mobile."
- **Micro-win**: "This is a small cleanup, but not a priority."

## Installation

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the extension directory

## Usage

1. Open Chrome DevTools (F12 or Cmd+Option+I on Mac)
2. Look for the "RootCause" tab
3. Click "Analyze Page" to start the investigation
4. Read the root-cause narratives and follow the prioritized fixes

## Technical Stack

- **Manifest V3**: Latest Chrome Extension standard
- **Navigation Timing API & Resource Timing API**: Millisecond-accurate performance data
- **PerformanceObserver**: Real-time Layout Shift and Long Task detection
- **chrome.debugger API**: Watch the "birth" of the page and identify Long Tasks

## Target Users

- **Frustrated Developers**: Who see a red Lighthouse score but don't know where to start
- **Business Owners**: Who know their site is "slow" but can't explain why to their dev team
- **Performance Engineers**: Who want a faster way to identify root causes

## Features

✅ Critical Rendering Path analysis  
✅ Root-cause narratives in plain English  
✅ Impact-first priority list  
✅ Dependency timeline visualization  
✅ Layout Shift detection  
✅ Long Task identification  
✅ Server response time analysis  
✅ Memory usage monitoring  

## Development

The extension is built with vanilla JavaScript and follows modern ES6+ patterns:

```
/Extenction
├── manifest.json           # Extension manifest
├── background/
│   └── service-worker.js   # Background script, handles analysis
├── devtools/
│   ├── devtools.html       # DevTools entry point
│   ├── devtools.js         # Creates the panel
│   └── panel/
│       ├── panel.html      # Main UI
│       ├── panel.css       # Styling
│       └── panel.js        # UI controller
├── core/
│   ├── analyzer.js         # Performance metric analyzer
│   ├── dependency-tracer.js # Critical path tracer
│   ├── human-translator.js # Translates to narratives
│   └── priority-engine.js  # Prioritizes issues
├── popup/
│   ├── popup.html          # Extension popup
│   └── popup.js            # Popup logic
└── icons/                  # Extension icons
```

## Contributing

Contributions are welcome! This is a comprehensive project with room for improvements:

- Enhanced Long Task detection using PerformanceObserver
- More sophisticated dependency chain analysis
- Integration with real Lighthouse scores
- Export reports as PDF or Markdown
- Historical tracking and performance trends
- Custom thresholds and recommendations

## License

MIT License - feel free to use and modify

## Author

Built with ❤️ for developers who want to understand *why* their sites are slow, not just *what* is wrong.

---

**Note**: This extension requires Chrome DevTools to be open and uses the `debugger` API, which will show a warning banner while active. This is normal and required for the deep performance analysis.
