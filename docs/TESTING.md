# Testing Guide for Performance Detective

## Quick Start

### 1. Load the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the `/home/yashraj/YASHRAJ/Extenction` directory
5. The extension should now appear in your extensions list

### 2. Test the Extension

1. Navigate to any website (e.g., https://example.com)
2. Open Chrome DevTools:
   - Press `F12`, or
   - Right-click → "Inspect", or
   - `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows/Linux)
3. Look for the "Performance Detective" tab in DevTools
4. Click the tab to open the panel
5. Click "Analyze Page" button
6. Wait for the analysis to complete (5-10 seconds)
7. Review the results!

## Test Sites

Test the extension on various types of sites to see different performance issues:

### Fast Sites (Baseline)
- https://example.com
- https://google.com
- Should show mostly green results

### Slow Sites (Good for Testing)
- News sites with lots of ads
- E-commerce sites with heavy JavaScript
- Sites with large images

### Test Specific Issues

**Test Render Blocking:**
- Find sites with large CSS files loaded in `<head>`
- Should identify CSS as render blocker

**Test Large Images:**
- Sites with unoptimized hero images
- Should identify LCP issues

**Test Third-Party Scripts:**
- Sites with tracking scripts, ads, analytics
- Should identify long tasks

**Test Layout Shifts:**
- Sites that load ads or images without dimensions
- Should detect CLS issues

## Expected Results

### Critical Issues
- Slow server response (TTFB > 800ms)
- Render-blocking resources
- Large primary blocker (LCP element)
- High memory usage

### Optimizations
- Moderate TTFB (400-800ms)
- Long tasks (100-200ms)
- Render blockers with medium impact

### Micro-Wins
- Small optimizations
- Minor issues

### Timeline
- Should show chronological events:
  - DNS Lookup
  - Connection
  - TTFB
  - DOM Content Loaded
  - Paint events
  - Page fully loaded

## Debugging

### If the extension doesn't appear:
1. Check for errors in `chrome://extensions/`
2. Click "Errors" button if present
3. Verify all files are in the correct locations

### If analysis fails:
1. Open DevTools Console (while on the Performance Detective panel)
2. Look for error messages
3. Check Background Service Worker logs:
   - Go to `chrome://extensions/`
   - Find Performance Detective
   - Click "service worker" link
   - Check console for errors

### Common Issues:

**"Debugger already attached"**
- Another extension or DevTools protocol client is using the debugger
- Close other debugging tools and try again

**"Cannot access chrome.debugger"**
- Permission issue
- Verify `debugger` permission in manifest.json

**No results showing**
- Check if the site loaded correctly
- Try analyzing again
- Check console for JavaScript errors

## Development Tips

### Reload After Changes:
1. Make code changes
2. Go to `chrome://extensions/`
3. Click the refresh icon on Performance Detective
4. Reload the page you're testing
5. Re-open DevTools and analyze again

### View Background Logs:
```
chrome://extensions/ → Performance Detective → service worker
```

### View Panel Logs:
- Open DevTools on the page
- Open Performance Detective tab
- Open a second DevTools window (Cmd+Option+I while focused on DevTools)
- This shows console logs for the panel

## Known Limitations

1. **Debugger Warning**: While analyzing, Chrome shows "Debugging this browser" banner - this is normal
2. **Page Reload**: The extension reloads the page to collect fresh data
3. **Analysis Time**: Takes 5-10 seconds to complete analysis
4. **Single Tab**: Can only analyze one tab at a time

## Success Criteria

✅ Extension loads without errors  
✅ DevTools panel appears  
✅ "Analyze Page" button works  
✅ Loading state shows during analysis  
✅ Results display with issues categorized  
✅ Timeline shows key events  
✅ Human-readable narratives appear  
✅ Fix suggestions are provided  

## Next Steps

After basic testing:
1. Test on real-world sites
2. Compare findings with Lighthouse
3. Verify fix suggestions are accurate
4. Test on various page types (SPA, static, e-commerce, etc.)
5. Check performance on low-end devices

## Feedback

As you test, note:
- Are the narratives clear and helpful?
- Are the priorities correct?
- Are the fix suggestions actionable?
- Is the timeline accurate?
- Any bugs or crashes?
