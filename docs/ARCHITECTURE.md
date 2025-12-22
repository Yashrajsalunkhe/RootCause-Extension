# Performance Detective - System Architecture

## Visual Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CHROME BROWSER                              │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐│
│  │                          Web Page (Target)                          ││
│  │  ┌──────────────────────────────────────────────────────────────┐  ││
│  │  │  HTML, CSS, JavaScript, Images, Fonts, etc.                  │  ││
│  │  │  • Render Pipeline                                            │  ││
│  │  │  • Network Requests                                           │  ││
│  │  │  • JavaScript Execution                                       │  ││
│  │  │  • Layout & Paint                                             │  ││
│  │  └──────────────────────────────────────────────────────────────┘  ││
│  └─────────────────────────┬───────────────────────────────────────────┘│
│                            │                                             │
│                            │ (Performance APIs)                          │
│                            │                                             │
│  ┌─────────────────────────▼───────────────────────────────────────────┐│
│  │                   Chrome DevTools Protocol                          ││
│  │  ┌──────────────┬──────────────┬──────────────┬──────────────┐    ││
│  │  │  Performance │   Network    │     Page     │   Runtime    │    ││
│  │  │    Domain    │    Domain    │    Domain    │    Domain    │    ││
│  │  └──────────────┴──────────────┴──────────────┴──────────────┘    ││
│  └────────────────────────┬────────────────────────────────────────────┘│
│                           │                                              │
│                           │ chrome.debugger.sendCommand()                │
│                           │                                              │
│  ┌────────────────────────▼─────────────────────────────────────────┐  │
│  │              Background Service Worker                            │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │  analyzePerformance()                                     │   │  │
│  │  │  • Attach debugger                                        │   │  │
│  │  │  • Enable domains (Performance, Network, Page)            │   │  │
│  │  │  • Reload page                                            │   │  │
│  │  │  • Collect timing data                                    │   │  │
│  │  │  • Run analysis pipeline                                  │   │  │
│  │  │  • Detach debugger                                        │   │  │
│  │  └──────────────────┬──────────────────────────────────────┘   │  │
│  └─────────────────────┼───────────────────────────────────────────┘  │
│                        │                                                │
│          ┌─────────────┴─────────────┐                                 │
│          │   Analysis Pipeline       │                                 │
│          ▼                           ▼                                 │
│  ┌──────────────────┐        ┌──────────────────┐                     │
│  │  CORE MODULES    │        │   DATA FLOW      │                     │
│  │  ┌────────────┐  │        │                  │                     │
│  │  │ Analyzer   │  │        │  Raw Perf Data   │                     │
│  │  │  • TTFB    │──┼───────▶│       ↓          │                     │
│  │  │  • FCP     │  │        │  Metrics         │                     │
│  │  │  • CLS     │  │        │       ↓          │                     │
│  │  │  • Memory  │  │        │  Dependencies    │                     │
│  │  └────────────┘  │        │       ↓          │                     │
│  │                  │        │  Narratives      │                     │
│  │  ┌────────────┐  │        │       ↓          │                     │
│  │  │  Tracer    │  │        │  Prioritized     │                     │
│  │  │  • Path    │──┼───────▶│  Issues          │                     │
│  │  │  • Blocker │  │        │       ↓          │                     │
│  │  │  • Tasks   │  │        │  Timeline        │                     │
│  │  └────────────┘  │        │                  │                     │
│  │                  │        └──────────────────┘                     │
│  │  ┌────────────┐  │                                                  │
│  │  │Translator  │  │                                                  │
│  │  │  • English │──┼─────────────┐                                   │
│  │  │  • Context │  │             │                                   │
│  │  │  • Fixes   │  │             │                                   │
│  │  └────────────┘  │             │                                   │
│  │                  │             │                                   │
│  │  ┌────────────┐  │             │                                   │
│  │  │  Priority  │  │             │                                   │
│  │  │  • Impact  │──┼─────────────┤                                   │
│  │  │  • Sorting │  │             │                                   │
│  │  │  • Scoring │  │             │                                   │
│  │  └────────────┘  │             │                                   │
│  └──────────────────┘             │                                   │
│                                    │                                   │
│                                    │ chrome.runtime.sendMessage()      │
│                                    │                                   │
│  ┌─────────────────────────────────▼──────────────────────────────┐  │
│  │                     DevTools Panel (UI)                         │  │
│  │  ┌──────────────────────────────────────────────────────────┐  │  │
│  │  │  panel.js - Controller                                    │  │  │
│  │  │  • analyze() - Triggers analysis                          │  │  │
│  │  │  • displayResults() - Renders output                      │  │  │
│  │  │  • createIssueCard() - Builds cards                       │  │  │
│  │  └──────────────────────────────────────────────────────────┘  │  │
│  │                                                                  │  │
│  │  ┌──────────────────────────────────────────────────────────┐  │  │
│  │  │  panel.html - Structure                                   │  │  │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │  │
│  │  │  │  🚨 Critical │  │  ⚡ Optimize │  │  ✨ Micro    │   │  │  │
│  │  │  │   Issues     │  │    Issues    │  │    Wins      │   │  │  │
│  │  │  └──────────────┘  └──────────────┘  └──────────────┘   │  │  │
│  │  │  ┌──────────────────────────────────────────────────┐   │  │  │
│  │  │  │         📊 Timeline Visualization                │   │  │  │
│  │  │  └──────────────────────────────────────────────────┘   │  │  │
│  │  └──────────────────────────────────────────────────────────┘  │  │
│  │                                                                  │  │
│  │  ┌──────────────────────────────────────────────────────────┐  │  │
│  │  │  panel.css - Beautiful Styling                           │  │  │
│  │  │  • Gradient header                                        │  │  │
│  │  │  • Issue cards                                            │  │  │
│  │  │  • Timeline events                                        │  │  │
│  │  │  • Animations                                             │  │  │
│  │  └──────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Sequence

```
1. User Action
   ↓
2. panel.js: analyze() clicked
   ↓
3. chrome.runtime.sendMessage({ action: 'analyzePerformance' })
   ↓
4. service-worker.js: receives message
   ↓
5. chrome.debugger.attach(tabId)
   ↓
6. Enable domains: Performance.enable(), Network.enable()
   ↓
7. Page.reload() - Fresh page load
   ↓
8. Wait for load (~5 seconds)
   ↓
9. Runtime.evaluate() - Inject script to get:
   - performance.getEntriesByType('navigation')
   - performance.getEntriesByType('resource')
   - performance.getEntriesByType('paint')
   - performance.getEntriesByType('layout-shift')
   - performance.memory
   ↓
10. Analyzer.analyzeMetrics()
    - Extract TTFB, FCP, LCP, CLS, etc.
    ↓
11. DependencyTracer.analyze()
    - Find critical path
    - Identify primary blocker
    - Detect render blockers
    - Find long tasks
    ↓
12. HumanTranslator.translate()
    - Convert to plain English
    - Add context
    - Generate fix suggestions
    ↓
13. PriorityEngine.prioritize()
    - Score impact
    - Categorize (Critical/Optimization/Micro)
    - Sort by impact
    ↓
14. Create timeline
    - DNS → Connect → TTFB → Paint → Load
    ↓
15. chrome.debugger.detach()
    ↓
16. Return results to panel
    ↓
17. panel.js: displayResults()
    - Render issue cards
    - Show timeline
    - Display metrics
    ↓
18. User sees beautiful results! 🎉
```

## Component Interactions

```
┌──────────────┐     Message      ┌──────────────┐
│              │ ───────────────> │              │
│  Panel (UI)  │                  │   Service    │
│              │ <─────────────── │   Worker     │
└──────────────┘     Response     └──────┬───────┘
                                         │
                                         │ Debugger API
                                         │
                    ┌────────────────────┴────────────────────┐
                    │                                          │
                    ▼                                          ▼
            ┌──────────────┐                          ┌──────────────┐
            │  Chrome CDP  │                          │  Core Engine │
            │              │                          │              │
            │ • Performance│                          │ • Analyzer   │
            │ • Network    │                          │ • Tracer     │
            │ • Page       │                          │ • Translator │
            │ • Runtime    │                          │ • Priority   │
            └──────┬───────┘                          └──────────────┘
                   │
                   │ Timing Data
                   │
                   ▼
            ┌──────────────┐
            │   Web Page   │
            │              │
            │ • Navigation │
            │ • Resources  │
            │ • Paint      │
            │ • Shifts     │
            └──────────────┘
```

## File Dependencies

```
manifest.json
├── defines extension structure
├── points to devtools/devtools.html
└── points to background/service-worker.js

devtools/devtools.html
└── loads devtools/devtools.js

devtools/devtools.js
└── creates panel → devtools/panel/panel.html

devtools/panel/panel.html
├── includes panel.css
└── includes panel.js

devtools/panel/panel.js
└── sends messages to → background/service-worker.js

background/service-worker.js
├── imports core/analyzer.js
├── imports core/dependency-tracer.js
├── imports core/human-translator.js
└── imports core/priority-engine.js

core/analyzer.js
└── analyzes raw performance data

core/dependency-tracer.js
└── finds critical path & blockers

core/human-translator.js
└── converts to narratives

core/priority-engine.js
└── categorizes & prioritizes
```

## API Usage Map

```
Chrome Extension APIs:
├── chrome.runtime.onMessage       (message passing)
├── chrome.runtime.sendMessage     (message passing)
├── chrome.devtools.panels.create  (create panel)
├── chrome.devtools.inspectedWindow.tabId (get tab)
└── chrome.debugger
    ├── attach()                   (attach to tab)
    ├── sendCommand()              (CDP commands)
    └── detach()                   (cleanup)

Chrome DevTools Protocol:
├── Performance.enable()           (enable metrics)
├── Network.enable()               (track requests)
├── Page.enable()                  (page events)
├── Page.reload()                  (refresh page)
└── Runtime.evaluate()             (run JS)

Performance APIs (via Runtime.evaluate):
├── performance.getEntriesByType('navigation')
├── performance.getEntriesByType('resource')
├── performance.getEntriesByType('paint')
├── performance.getEntriesByType('layout-shift')
└── performance.memory
```

## Processing Pipeline

```
Raw Data              Processed Data           User Output
═══════════           ══════════════           ═══════════

Navigation Timing  ──▶ TTFB = 1200ms    ──▶   "Your server took
                                               too long..."

Resource Timing   ──▶ Primary Blocker  ──▶    "Script blocking
                      = script.js              for 850ms..."
                      
Paint Timing      ──▶ FCP = 2500ms     ──▶    "First paint
                                               delayed by..."
                                               
Layout Shifts     ──▶ CLS = 0.35       ──▶    "Page jumped 5
                                               times because..."
                                               
Long Tasks        ──▶ Task = 250ms     ──▶    "JavaScript froze
                                               page for..."
```

## State Management

```
┌─────────────────────────────────────────────┐
│              Panel State                     │
├─────────────────────────────────────────────┤
│  • loading: boolean                          │
│  • results: { issues, timeline }             │
│  • error: string | null                      │
│                                              │
│  States:                                     │
│  1. Empty State (no analysis yet)            │
│  2. Loading State (analyzing...)             │
│  3. Results State (showing issues)           │
│  4. Error State (analysis failed)            │
└─────────────────────────────────────────────┘
```

## Performance Metrics Timeline

```
0ms ──────┬────────┬──────────┬──────────┬──────────┬──────────▶
          │        │          │          │          │
      DNS Lookup  Connect  TTFB      FCP/FP    DOM Ready  Load
         │          │          │          │          │
         └──────────┴──────────┴──────────┴──────────┘
            Analyzed by Dependency Tracer
            Translated to Human Language
            Prioritized by Impact
            Displayed in Timeline
```

This architecture enables:
✅ Modular design (easy to extend)
✅ Clear separation of concerns
✅ Reusable components
✅ Comprehensive analysis
✅ Beautiful user experience
