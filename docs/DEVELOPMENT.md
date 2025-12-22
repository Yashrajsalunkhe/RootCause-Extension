# Development Guide - Performance Detective

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Chrome Browser                           │
│                                                              │
│  ┌────────────────┐         ┌──────────────────┐           │
│  │  Web Page      │         │  DevTools Panel   │           │
│  │  (Inspected)   │◄────────│  (UI)             │           │
│  └────────────────┘         └──────────────────┘           │
│         ▲                            │                       │
│         │                            │                       │
│         │                            ▼                       │
│  ┌──────┴──────────────────┬─────────────────┐             │
│  │  chrome.debugger API    │  chrome.runtime  │             │
│  └─────────────────────────┴─────────────────┘             │
│                            │                                 │
│                            ▼                                 │
│              ┌──────────────────────────┐                   │
│              │  Background Service      │                   │
│              │  Worker                  │                   │
│              │  - Collects data         │                   │
│              │  - Runs analysis         │                   │
│              └──────────────────────────┘                   │
│                            │                                 │
│              ┌─────────────┼─────────────┐                  │
│              ▼             ▼             ▼                   │
│        ┌─────────┐  ┌──────────┐  ┌──────────┐             │
│        │Analyzer │  │ Tracer   │  │Translator│             │
│        └─────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. DevTools Panel (`devtools/panel/`)

**Purpose**: User interface for displaying results

**Files**:
- `panel.html` - Structure
- `panel.css` - Styling
- `panel.js` - Controller logic

**Key Functions**:
```javascript
analyze()           // Triggers analysis
displayResults()    // Shows results
createIssueCard()   // Renders issue cards
```

### 2. Background Service Worker (`background/service-worker.js`)

**Purpose**: Main analysis orchestrator

**Key Functions**:
```javascript
analyzePerformance()         // Main entry point
collectPerformanceData()     // Gathers timing data
createTimeline()             // Builds event timeline
```

**Flow**:
1. Receive message from panel
2. Attach debugger to tab
3. Enable Performance/Network/Page domains
4. Reload page (to get fresh data)
5. Collect timing data via Runtime.evaluate
6. Run analysis pipeline
7. Detach debugger
8. Return results

### 3. Core Analysis Engine (`core/`)

#### 3.1 Analyzer (`analyzer.js`)
- Extracts raw metrics from performance data
- Calculates TTFB, FCP, LCP, CLS, etc.
- Analyzes resource types and sizes

#### 3.2 Dependency Tracer (`dependency-tracer.js`)
- Finds critical rendering path
- Identifies primary blocker
- Detects render-blocking resources
- Finds long tasks
- Tracks layout shifts

#### 3.3 Human Translator (`human-translator.js`)
- Converts technical metrics to narratives
- Generates plain-English explanations
- Creates actionable fix suggestions
- Formats resource sizes and timings

#### 3.4 Priority Engine (`priority-engine.js`)
- Categorizes issues (critical/optimization/micro)
- Scores impact of each issue
- Sorts by potential improvement
- Adds synthetic issues (TTFB, memory)

## Data Flow

```
Web Page → Chrome APIs → Service Worker → Analysis Pipeline → UI

1. chrome.debugger.attach()
2. Performance.enable(), Network.enable()
3. Page.reload()
4. Runtime.evaluate() [collect timing data]
5. PerformanceAnalyzer.analyze()
6. DependencyTracer.analyze()
7. HumanTranslator.translate()
8. PriorityEngine.prioritize()
9. Return to panel
10. Render results
```

## Key APIs Used

### Navigation Timing API
```javascript
performance.getEntriesByType('navigation')[0]
```
Provides:
- fetchStart, domainLookupStart/End
- connectStart/End, secureConnectionStart
- requestStart, responseStart/End
- domContentLoadedEventStart/End
- loadEventStart/End

### Resource Timing API
```javascript
performance.getEntriesByType('resource')
```
Provides for each resource:
- name (URL)
- initiatorType (script, link, img, etc.)
- startTime, duration
- transferSize, encodedBodySize

### Paint Timing API
```javascript
performance.getEntriesByType('paint')
```
Provides:
- first-paint (FP)
- first-contentful-paint (FCP)

### Layout Shift API
```javascript
performance.getEntriesByType('layout-shift')
```
Provides:
- value (shift score)
- startTime
- hadRecentInput

## Adding New Features

### Add a New Issue Type

1. **Detect in Tracer** (`dependency-tracer.js`):
```javascript
static findNewIssue(performanceData) {
  // Detection logic
  return issueData;
}
```

2. **Translate to Narrative** (`human-translator.js`):
```javascript
static translateNewIssue(issue) {
  return {
    type: 'new-issue',
    title: '...',
    narrative: '...',
    fix: '...',
    severity: 'critical|optimization|micro'
  };
}
```

3. **Score Impact** (`priority-engine.js`):
```javascript
static getImpactScore(narrative) {
  if (narrative.type === 'new-issue') {
    return /* score */;
  }
}
```

### Add New Metrics

In `analyzer.js`:
```javascript
static analyzeMetrics(performanceData) {
  // Add new metric calculation
  metrics.newMetric = /* calculation */;
  return metrics;
}
```

### Customize UI

In `panel.css`:
- Modify color scheme (`.issues-section` classes)
- Adjust layout (flexbox/grid)
- Change animations

In `panel.html`:
- Add new sections
- Modify card structure

## Debugging Tips

### Background Worker Logs
```javascript
console.log('Debug info:', data);
// View at: chrome://extensions/ → service worker
```

### Panel Logs
```javascript
console.log('UI debug:', data);
// View in: DevTools → Performance Detective → Open second DevTools
```

### Debugger Events
```javascript
chrome.debugger.onEvent.addListener((source, method, params) => {
  console.log('Debugger event:', method, params);
});
```

## Performance Considerations

1. **Analysis Time**: Currently ~5s due to page reload
   - Could be optimized with incremental updates
   - Could cache results for same page

2. **Memory**: Stores full performance data
   - Could stream/filter data
   - Could limit resource count

3. **CPU**: Long task detection could be improved
   - Use PerformanceObserver with 'longtask' type
   - Real-time monitoring vs post-load analysis

## Testing Strategy

### Unit Tests (Future)
- Test each analyzer function
- Mock performance data
- Verify narrative generation

### Integration Tests
- Load extension
- Analyze test pages
- Verify expected issues found

### Manual Testing
- Use test-page.html
- Compare with Lighthouse
- Test on real sites

## Common Patterns

### Extracting Timing
```javascript
const duration = Math.round(end - start);
```

### Formatting Bytes
```javascript
static formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
```

### Shortening URLs
```javascript
static shortenUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.split('/').pop();
  } catch {
    return url.substring(0, 50);
  }
}
```

## Future Enhancements

1. **Real-time Monitoring**: Use PerformanceObserver
2. **Historical Tracking**: Store past analyses
3. **Comparison Mode**: Compare before/after
4. **Export**: Generate reports
5. **Custom Thresholds**: User-defined "slow"
6. **Integration**: Connect to CI/CD
7. **Lighthouse Sync**: Import Lighthouse data
8. **Mobile Testing**: Remote debugging support

## Resources

- [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- [Performance APIs](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API)
- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [Web Vitals](https://web.dev/vitals/)

## Contributing

When contributing:
1. Follow existing code style
2. Add comments for complex logic
3. Test on multiple sites
4. Update documentation
5. Consider performance impact
