# Changelog

All notable changes to Performance Detective will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-21

### Added
- Initial release of Performance Detective Chrome Extension
- DevTools panel integration with beautiful UI
- Background service worker for performance analysis
- Core analysis engine with four modules:
  - Performance Analyzer: Extracts metrics from Performance APIs
  - Dependency Tracer: Identifies critical rendering path
  - Human Translator: Converts metrics to plain-English narratives
  - Priority Engine: Categorizes issues by impact
- Performance API integrations:
  - Navigation Timing API
  - Resource Timing API
  - Paint Timing API (FP, FCP)
  - Layout Shift API (CLS)
- chrome.debugger API integration for deep analysis
- Issue categorization:
  - Critical issues (immediate 1s+ improvement)
  - Optimizations (smoother experience)
  - Micro-wins (small cleanups)
- Root-cause narratives for:
  - Primary blockers (render-blocking resources)
  - Slow server response (TTFB)
  - Render-blocking CSS and JavaScript
  - Long tasks (heavy JavaScript execution)
  - Layout shifts (CLS)
  - High memory usage
- Timeline visualization showing:
  - DNS lookup
  - TCP connection
  - TTFB
  - Paint events (FP, FCP)
  - DOM Content Loaded
  - Page Load Complete
- Actionable fix suggestions for each issue
- Impact estimates (time saved)
- Resource information (size, duration, URL)
- Extension popup with quick info
- Comprehensive documentation:
  - README with quick start
  - TESTING guide
  - DEVELOPMENT guide
  - Test page with intentional performance issues
- MIT License
- Icon generation script
- Installation script

### Technical Details
- Manifest V3 compliance
- Vanilla JavaScript (ES6+)
- No external dependencies
- Modular architecture
- Clean separation of concerns

## [Unreleased]

### Planned Features
- [ ] Real-time monitoring with PerformanceObserver
- [ ] Historical tracking and performance trends
- [ ] Export reports (PDF, Markdown, JSON)
- [ ] Comparison mode (before/after)
- [ ] Custom thresholds
- [ ] Lighthouse integration
- [ ] Mobile device testing
- [ ] CI/CD integration
- [ ] Network waterfall visualization
- [ ] Third-party script impact analysis
- [ ] More detailed long task profiling
- [ ] Chrome Web Store publication

---

## Version History

- **1.0.0** (2025-12-21): Initial release
