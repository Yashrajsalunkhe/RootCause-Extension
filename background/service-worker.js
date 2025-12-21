// Background Service Worker - Handles performance analysis
// Cross-browser compatibility for Chrome, Firefox, Edge, and Safari
// Note: Chrome extension service workers don't fully support ES6 modules
// So we inline the core modules here

// ============= BROWSER COMPATIBILITY =============
// Polyfill for cross-browser API compatibility
const browser = (() => {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
    return chrome;
  }
  if (typeof browser !== 'undefined') {
    return browser;
  }
  // Fallback for Safari or other browsers
  return window.browser || window.chrome || {};
})();

// Handle both Manifest V2 and V3
const isManifestV3 = !!(browser.runtime && browser.runtime.getManifest && 
  browser.runtime.getManifest().manifest_version === 3);

// Storage API compatibility
const storage = browser.storage || {
  local: {
    get: () => Promise.resolve({}),
    set: () => Promise.resolve(),
    remove: () => Promise.resolve()
  }
};

// Tabs API compatibility  
const tabs = browser.tabs || {
  query: () => Promise.resolve([]),
  sendMessage: () => Promise.resolve(),
  executeScript: () => Promise.resolve()
};

// ============= CORE MODULES INLINED =============

// Dependency Tracer - Identifies the "Longest Pole in the Tent"
class DependencyTracer {
  static analyze(performanceData) {
    const metrics = this.extractMetrics(performanceData);
    const resources = this.extractResources(performanceData);
    
    const dependencies = {
      criticalPath: this.findCriticalPath(resources, metrics),
      renderBlockers: this.findRenderBlockers(resources),
      longTasks: this.findLongTasks(performanceData),
      layoutShifts: this.findLayoutShifts(performanceData)
    };
    
    return dependencies;
  }
  
  static extractMetrics(performanceData) {
    const timing = performanceData.timing?.navigation || {};
    const paint = performanceData.timing?.paint || [];
    
    return {
      ttfb: timing.responseStart ? Math.round(timing.responseStart - timing.fetchStart) : 0,
      fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      domContentLoaded: timing.domContentLoadedEventEnd ? 
        Math.round(timing.domContentLoadedEventEnd - timing.fetchStart) : 0,
      loadComplete: timing.loadEventEnd ? 
        Math.round(timing.loadEventEnd - timing.fetchStart) : 0
    };
  }
  
  static extractResources(performanceData) {
    return performanceData.timing?.resources || [];
  }
  
  static findCriticalPath(resources, metrics) {
    const criticalResources = resources.filter(r => {
      return r.responseEnd > 0 && r.responseEnd <= (metrics.fcp || Infinity);
    });
    
    criticalResources.sort((a, b) => b.responseEnd - a.responseEnd);
    const primaryBlocker = criticalResources[0];
    
    return {
      primaryBlocker: primaryBlocker ? {
        url: primaryBlocker.name,
        duration: Math.round(primaryBlocker.duration),
        size: primaryBlocker.transferSize,
        type: primaryBlocker.initiatorType,
        startTime: Math.round(primaryBlocker.startTime),
        endTime: Math.round(primaryBlocker.responseEnd)
      } : null,
      criticalResources: criticalResources.slice(0, 5).map(r => ({
        url: this.shortenUrl(r.name),
        duration: Math.round(r.duration),
        size: r.transferSize,
        type: r.initiatorType
      }))
    };
  }
  
  static findRenderBlockers(resources) {
    const blockers = resources.filter(r => {
      const isCSS = r.initiatorType === 'link' && r.name.match(/\.css(\?|$)/);
      const isSyncScript = r.initiatorType === 'script' && r.startTime < 100;
      return (isCSS || isSyncScript) && r.duration > 50;
    });
    
    return blockers.map(b => ({
      url: this.shortenUrl(b.name),
      duration: Math.round(b.duration),
      size: b.transferSize,
      type: b.initiatorType,
      reason: b.initiatorType === 'link' ? 'CSS blocks rendering' : 'Synchronous script blocks parsing'
    }));
  }
  
  static findLongTasks(performanceData) {
    const resources = performanceData.timing?.resources || [];
    const longTasks = resources.filter(r => {
      return r.initiatorType === 'script' && r.duration > 50;
    });
    
    return longTasks.map(task => ({
      url: this.shortenUrl(task.name),
      duration: Math.round(task.duration),
      impact: task.duration > 200 ? 'high' : task.duration > 100 ? 'medium' : 'low'
    }));
  }
  
  static findLayoutShifts(performanceData) {
    const shifts = performanceData.timing?.layoutShifts || [];
    
    if (shifts.length === 0) {
      return [];
    }
    
    const totalShift = shifts.reduce((sum, shift) => sum + shift.value, 0);
    
    return {
      count: shifts.length,
      totalScore: totalShift.toFixed(3),
      severity: totalShift > 0.25 ? 'critical' : totalShift > 0.1 ? 'warning' : 'good',
      shifts: shifts.slice(0, 5).map(shift => ({
        value: shift.value.toFixed(3),
        time: Math.round(shift.startTime)
      }))
    };
  }
  
  static shortenUrl(url) {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      const filename = path.split('/').pop();
      return filename || urlObj.hostname;
    } catch (e) {
      return url.length > 50 ? url.substring(0, 47) + '...' : url;
    }
  }
}

// Human Language Translator - Converts metrics to narratives
class HumanTranslator {
  static translate(dependencyAnalysis) {
    const narratives = [];
    
    if (dependencyAnalysis.criticalPath.primaryBlocker) {
      narratives.push(this.translatePrimaryBlocker(dependencyAnalysis.criticalPath.primaryBlocker));
    }
    
    dependencyAnalysis.renderBlockers.forEach(blocker => {
      narratives.push(this.translateRenderBlocker(blocker));
    });
    
    dependencyAnalysis.longTasks.forEach(task => {
      if (task.impact === 'high' || task.impact === 'medium') {
        narratives.push(this.translateLongTask(task));
      }
    });
    
    if (dependencyAnalysis.layoutShifts && 
        dependencyAnalysis.layoutShifts.severity !== 'good') {
      narratives.push(this.translateLayoutShifts(dependencyAnalysis.layoutShifts));
    }
    
    return narratives;
  }
  
  static translatePrimaryBlocker(blocker) {
    let narrative = '';
    let fix = '';
    
    if (blocker.type === 'script') {
      narrative = `Your page is waiting for a ${Math.round(blocker.duration)}ms JavaScript file to download and execute. This script is blocking the browser from showing anything to your users. While the browser downloads this ${this.formatBytes(blocker.size)} file, your visitors see a blank screen.`;
      fix = `Move this script to the bottom of your HTML (before </body>), or add the 'defer' or 'async' attribute to load it without blocking. Consider code-splitting if this is a large bundle.`;
    } else if (blocker.type === 'link') {
      narrative = `Your page can't display anything until it finishes downloading a ${this.formatBytes(blocker.size)} CSS file. This stylesheet took ${Math.round(blocker.duration)}ms to load. Users are staring at a white screen while waiting for styling rules they might not even see immediately.`;
      fix = `Split your CSS into critical (above-the-fold) and non-critical parts. Inline the critical CSS directly in <head> and load the rest asynchronously using media="print" onload="this.media='all'".`;
    } else if (blocker.type === 'img') {
      narrative = `Your hero image is the bottleneck. It took ${Math.round(blocker.duration)}ms to load, and the browser waited for it before showing the main content. This ${this.formatBytes(blocker.size)} image is delaying your Largest Contentful Paint.`;
      fix = `Optimize this image: compress it, convert to WebP/AVIF format, and use responsive images with srcset. Consider using a CDN with image optimization. Add fetchpriority="high" to prioritize it.`;
    } else {
      narrative = `A ${blocker.type} resource is blocking your page from rendering. It took ${Math.round(blocker.duration)}ms to load (${this.formatBytes(blocker.size)}).`;
      fix = `Review this resource and consider deferring it, loading it asynchronously, or removing it if it's not critical for the initial page load.`;
    }
    
    return {
      type: 'primary-blocker',
      title: `Primary Blocker: ${blocker.type.toUpperCase()}`,
      narrative,
      fix,
      metric: `Duration: ${Math.round(blocker.duration)}ms`,
      resource: blocker.url,
      timing: `Started at ${Math.round(blocker.startTime)}ms`,
      impact: `~${Math.round(blocker.duration / 100) / 10}s`,
      severity: 'critical'
    };
  }
  
  static translateRenderBlocker(blocker) {
    let narrative = '';
    
    if (blocker.reason.includes('CSS')) {
      narrative = `The browser had to freeze rendering while it downloaded this ${this.formatBytes(blocker.size)} CSS file. For ${Math.round(blocker.duration)}ms, your users saw nothing but a blank page. CSS is render-blocking by design, but not all CSS needs to block the render.`;
    } else {
      narrative = `A synchronous JavaScript file blocked HTML parsing for ${Math.round(blocker.duration)}ms. The browser couldn't continue reading your HTML until this script finished downloading and executing.`;
    }
    
    return {
      type: 'render-blocker',
      title: `Render Blocker: ${blocker.type === 'link' ? 'CSS' : 'JavaScript'}`,
      narrative,
      fix: blocker.type === 'link' 
        ? `Use critical CSS inlining for above-the-fold styles. Load non-critical CSS with <link rel="preload" as="style"> or use the media query trick.`
        : `Add 'defer' or 'async' to the script tag, or move it to the end of <body>. If it's a third-party script, consider loading it on user interaction.`,
      metric: `Blocked for: ${Math.round(blocker.duration)}ms`,
      resource: blocker.url,
      impact: `~${Math.round(blocker.duration / 100) / 10}s`,
      severity: blocker.duration > 500 ? 'critical' : 'optimization'
    };
  }
  
  static translateLongTask(task) {
    const severity = task.impact === 'high' ? 'critical' : 'optimization';
    
    const narrative = task.impact === 'high'
      ? `This JavaScript file executed for ${Math.round(task.duration)}ms, completely freezing your page. During this time, users couldn't click, scroll, or interact with anything. The browser was busy running JavaScript instead of responding to user input.`
      : `This script took ${Math.round(task.duration)}ms to execute, making the page feel sluggish. While not completely frozen, users experienced noticeable lag during this time.`;
    
    return {
      type: 'long-task',
      title: `Long Task: JavaScript Execution`,
      narrative,
      fix: `Break this long task into smaller chunks using setTimeout, requestIdleCallback, or web workers. Consider code-splitting to reduce bundle size. Profile the code to find expensive operations.`,
      metric: `Execution time: ${Math.round(task.duration)}ms`,
      resource: task.url,
      impact: `~${Math.round(task.duration / 100) / 10}s freeze`,
      severity
    };
  }
  
  static translateLayoutShifts(shifts) {
    const narrative = shifts.severity === 'critical'
      ? `Your page jumped around ${shifts.count} times with a cumulative layout shift score of ${shifts.totalScore}. This is a terrible user experience—buttons move as users try to click them, text jumps while they're reading, and the page feels unstable and janky.`
      : `The page layout shifted ${shifts.count} times (CLS: ${shifts.totalScore}). This causes a frustrating experience where elements move unexpectedly as the page loads.`;
    
    return {
      type: 'layout-shift',
      title: `Cumulative Layout Shift (CLS)`,
      narrative,
      fix: `Common fixes: (1) Always set width and height on images and videos, (2) Reserve space for ads/embeds with min-height, (3) Use font-display: optional for web fonts, (4) Avoid inserting content above existing content.`,
      metric: `CLS Score: ${shifts.totalScore}`,
      resource: `${shifts.count} layout shift${shifts.count > 1 ? 's' : ''} detected`,
      impact: 'User experience',
      severity: shifts.severity === 'critical' ? 'critical' : 'optimization'
    };
  }
  
  static formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

// Priority Engine - Creates "Impact-First" Priority List
class PriorityEngine {
  static prioritize(narratives) {
    const categorized = {
      critical: [],
      optimization: [],
      micro: []
    };
    
    narratives.forEach(narrative => {
      if (narrative.severity === 'critical') {
        categorized.critical.push(narrative);
      } else if (narrative.severity === 'optimization') {
        categorized.optimization.push(narrative);
      } else {
        categorized.micro.push(narrative);
      }
    });
    
    categorized.critical.sort((a, b) => this.getImpactScore(b) - this.getImpactScore(a));
    categorized.optimization.sort((a, b) => this.getImpactScore(b) - this.getImpactScore(a));
    categorized.micro.sort((a, b) => this.getImpactScore(b) - this.getImpactScore(a));
    
    if (categorized.critical.length === 0) {
      categorized.critical.push({
        type: 'success',
        title: 'No Critical Issues Found! 🎉',
        narrative: 'Your page has no critical performance blockers. Great job! Focus on the optimizations below to make it even better.',
        metric: '',
        resource: '',
        impact: 'None',
        severity: 'info'
      });
    }
    
    if (categorized.optimization.length === 0) {
      categorized.optimization.push({
        type: 'success',
        title: 'Optimization Looks Good',
        narrative: 'No major optimization opportunities found. Check the micro-wins for small improvements.',
        metric: '',
        resource: '',
        impact: 'None',
        severity: 'info'
      });
    }
    
    if (categorized.micro.length === 0) {
      categorized.micro.push({
        type: 'success',
        title: 'All Clear!',
        narrative: 'No minor issues detected. Your site is well-optimized!',
        metric: '',
        resource: '',
        impact: 'None',
        severity: 'info'
      });
    }
    
    return categorized;
  }
  
  static getImpactScore(narrative) {
    const impactMatch = narrative.impact?.match(/([\d.]+)s/);
    if (impactMatch) {
      return parseFloat(impactMatch[1]) * 1000;
    }
    
    const typeScores = {
      'primary-blocker': 5000,
      'render-blocker': 3000,
      'long-task': 2000,
      'layout-shift': 1000,
      'ttfb': 4000,
      'resource': 500
    };
    
    return typeScores[narrative.type] || 0;
  }
}

// ============= END CORE MODULES =============

// Listen for messages from the DevTools panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzePerformance') {
    analyzePerformance(request.tabId)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep the message channel open for async response
  }
});

async function analyzePerformance(tabId) {
  try {
    console.log(`Starting performance analysis for tab ${tabId}`);
    
    // Step 1: Attach debugger
    await chrome.debugger.attach({ tabId }, '1.3');
    
    // Step 2: Enable necessary domains
    await chrome.debugger.sendCommand({ tabId }, 'Performance.enable');
    await chrome.debugger.sendCommand({ tabId }, 'Network.enable');
    await chrome.debugger.sendCommand({ tabId }, 'Page.enable');
    
    // Step 3: Collect comprehensive performance data
    const performanceData = await collectPerformanceData(tabId);
    
    // Step 4: Generate comprehensive performance report using enhanced analyzer
    const metrics = PerformanceAnalyzer.analyzeMetrics(performanceData);
    const resources = PerformanceAnalyzer.analyzeResources(performanceData);
    const issues = PerformanceAnalyzer.identifyIssues(metrics, resources, performanceData);
    const timeline = PerformanceAnalyzer.createTimeline(performanceData);
    
    // Step 5: Analyze dependencies (legacy support)
    const dependencyAnalysis = DependencyTracer.analyze(performanceData);
    
    // Step 6: Translate to human language (legacy support)
    const narratives = HumanTranslator.translate(dependencyAnalysis);
    
    // Step 7: Prioritize issues (legacy support)
    const prioritizedIssues = PriorityEngine.prioritize(narratives);
    
    // Detach debugger
    await chrome.debugger.detach({ tabId });
    
    // Return comprehensive analysis
    return {
      success: true,
      data: {
        metrics,
        resources,
        issues,
        timeline,
        rawData: performanceData,
        analysis: performanceData.timing?.analysis || {},
        // Legacy support
        dependencyAnalysis,
        narratives,
        prioritizedIssues
      }
    };
    
  } catch (error) {
    console.error('Performance analysis failed:', error);
    
    // Try to detach debugger on error
    try {
      await chrome.debugger.detach({ tabId });
    } catch (e) {
      // Ignore detach errors
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

async function collectPerformanceData(tabId) {
  // Reload the page to capture fresh data
  await chrome.debugger.sendCommand({ tabId }, 'Page.reload', { ignoreCache: false });
  
  // Wait for page load
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Get performance metrics
  const metrics = await chrome.debugger.sendCommand({ tabId }, 'Performance.getMetrics');
  
  // Inject comprehensive script to get all performance data
  const result = await chrome.debugger.sendCommand({ tabId }, 'Runtime.evaluate', {
    expression: `
      (function() {
        const navigation = performance.getEntriesByType('navigation')[0];
        const resources = performance.getEntriesByType('resource');
        const paintEntries = performance.getEntriesByType('paint');
        const layoutShifts = performance.getEntriesByType('layout-shift');
        
        // Enhanced resource analysis
        const enhancedResources = resources.map(resource => {
          const enhanced = resource.toJSON();
          
          // Add computed properties
          enhanced.transferSize = resource.transferSize || resource.encodedBodySize || 0;
          enhanced.duration = resource.duration || (resource.responseEnd - resource.responseStart);
          enhanced.isThirdParty = false;
          enhanced.responseCode = 200; // Default, would need actual implementation
          enhanced.compression = resource.transferSize && resource.decodedBodySize ? 
            ((resource.decodedBodySize - resource.transferSize) / resource.decodedBodySize * 100).toFixed(1) : 0;
          
          // Determine resource type
          const url = resource.name.toLowerCase();
          if (url.includes('.js') || resource.initiatorType === 'script') {
            enhanced.resourceType = 'script';
          } else if (url.match(/\\.(jpg|jpeg|png|gif|webp|svg|ico)$/)) {
            enhanced.resourceType = 'image';
          } else if (url.includes('.css') || resource.initiatorType === 'link') {
            enhanced.resourceType = 'stylesheet';
          } else if (url.match(/\\.(woff|woff2|ttf|otf)$/)) {
            enhanced.resourceType = 'font';
          } else if (url.includes('.html') || resource.initiatorType === 'navigation') {
            enhanced.resourceType = 'document';
          } else {
            enhanced.resourceType = 'other';
          }
          
          // Check if third party
          try {
            const resourceHost = new URL(resource.name).hostname;
            const pageHost = window.location.hostname;
            enhanced.isThirdParty = resourceHost !== pageHost;
            enhanced.domain = resourceHost;
          } catch (e) {
            enhanced.domain = window.location.hostname;
          }
          
          return enhanced;
        });
        
        // Calculate page size breakdown
        const sizeByType = enhancedResources.reduce((acc, resource) => {
          if (!acc[resource.resourceType]) acc[resource.resourceType] = 0;
          acc[resource.resourceType] += resource.transferSize || 0;
          return acc;
        }, {});
        
        const sizeByDomain = enhancedResources.reduce((acc, resource) => {
          if (!acc[resource.domain]) acc[resource.domain] = 0;
          acc[resource.domain] += resource.transferSize || 0;
          return acc;
        }, {});
        
        // Calculate performance score components
        const totalSize = enhancedResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
        const loadTime = navigation ? navigation.loadEventEnd - navigation.fetchStart : 0;
        const ttfb = navigation ? navigation.responseStart - navigation.fetchStart : 0;
        
        // Core Web Vitals calculation
        const fcp = paintEntries.find(p => p.name === 'first-contentful-paint');
        const lcp = navigation ? navigation.loadEventEnd - navigation.fetchStart : 0; // Approximation
        const cls = layoutShifts.reduce((sum, shift) => sum + shift.value, 0);
        
        // Performance grade calculation
        let grade = 100;
        if (loadTime > 3000) grade -= 30;
        else if (loadTime > 2000) grade -= 20;
        else if (loadTime > 1000) grade -= 10;
        
        if (totalSize > 1000000) grade -= 20; // > 1MB
        else if (totalSize > 500000) grade -= 10; // > 500KB
        
        if (enhancedResources.length > 50) grade -= 15;
        else if (enhancedResources.length > 30) grade -= 10;
        else if (enhancedResources.length > 15) grade -= 5;
        
        if (ttfb > 800) grade -= 15;
        else if (ttfb > 400) grade -= 10;
        
        if (cls > 0.25) grade -= 20;
        else if (cls > 0.1) grade -= 10;
        
        grade = Math.max(0, Math.min(100, grade));
        
        return {
          navigation: navigation ? navigation.toJSON() : null,
          resources: enhancedResources,
          paint: paintEntries.map(p => p.toJSON()),
          layoutShifts: layoutShifts.map(l => l.toJSON()),
          memory: performance.memory ? {
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            usedJSHeapSize: performance.memory.usedJSHeapSize
          } : null,
          analysis: {
            totalSize,
            loadTime,
            ttfb,
            grade: Math.round(grade),
            sizeByType,
            sizeByDomain,
            coreWebVitals: {
              fcp: fcp ? fcp.startTime : null,
              lcp,
              cls,
              ttfb
            }
          }
        };
      })()
    `,
    returnByValue: true,
    awaitPromise: false
  });
  
  return {
    metrics: metrics.metrics,
    timing: result.result.value
  };
}

function createTimeline(performanceData) {
  const timeline = [];
  const timing = performanceData.timing;
  
  if (!timing || !timing.navigation) {
    return timeline;
  }
  
  const nav = timing.navigation;
  
  // Add key navigation events
  if (nav.domainLookupEnd > 0) {
    timeline.push({
      time: Math.round(nav.domainLookupEnd - nav.fetchStart),
      event: 'DNS Lookup Complete',
      resource: `Took ${Math.round(nav.domainLookupEnd - nav.domainLookupStart)}ms`
    });
  }
  
  if (nav.connectEnd > 0) {
    timeline.push({
      time: Math.round(nav.connectEnd - nav.fetchStart),
      event: 'Connection Established',
      resource: `TCP + SSL: ${Math.round(nav.connectEnd - nav.connectStart)}ms`
    });
  }
  
  if (nav.responseStart > 0) {
    timeline.push({
      time: Math.round(nav.responseStart - nav.fetchStart),
      event: 'Server Response Started (TTFB)',
      resource: `Wait time: ${Math.round(nav.responseStart - nav.requestStart)}ms`
    });
  }
  
  if (nav.domContentLoadedEventEnd > 0) {
    timeline.push({
      time: Math.round(nav.domContentLoadedEventEnd - nav.fetchStart),
      event: 'DOM Content Loaded',
      resource: 'HTML parsed and scripts executed'
    });
  }
  
  // Add paint events
  if (timing.paint) {
    timing.paint.forEach(paint => {
      timeline.push({
        time: Math.round(paint.startTime),
        event: paint.name === 'first-paint' ? 'First Paint' : 'First Contentful Paint',
        resource: 'User sees first pixels'
      });
    });
  }
  
  if (nav.loadEventEnd > 0) {
    timeline.push({
      time: Math.round(nav.loadEventEnd - nav.fetchStart),
      event: 'Page Fully Loaded',
      resource: 'All resources loaded'
    });
  }
  
  // Sort by time
  timeline.sort((a, b) => a.time - b.time);
  
  return timeline;
}
