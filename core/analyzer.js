// Core Performance Analyzer
export class PerformanceAnalyzer {
  static analyzeMetrics(performanceData) {
    const metrics = {};
    const timing = performanceData.timing;
    
    if (!timing || !timing.navigation) {
      return metrics;
    }
    
    const nav = timing.navigation;
    
    // TTFB (Time to First Byte)
    if (nav.responseStart && nav.fetchStart) {
      metrics.ttfb = Math.round(nav.responseStart - nav.fetchStart);
    }
    
    // First Paint (FP)
    const fp = timing.paint?.find(p => p.name === 'first-paint');
    if (fp) {
      metrics.firstPaint = Math.round(fp.startTime);
    }
    
    // First Contentful Paint (FCP)
    const fcp = timing.paint?.find(p => p.name === 'first-contentful-paint');
    if (fcp) {
      metrics.firstContentfulPaint = Math.round(fcp.startTime);
    }
    
    // Largest Contentful Paint (LCP) - approximation from load time
    if (nav.loadEventEnd && nav.fetchStart) {
      metrics.largestContentfulPaint = Math.round(nav.loadEventEnd - nav.fetchStart);
    }
    
    // DOM Content Loaded
    if (nav.domContentLoadedEventEnd && nav.fetchStart) {
      metrics.domContentLoaded = Math.round(nav.domContentLoadedEventEnd - nav.fetchStart);
    }
    
    // Page Load Time
    if (nav.loadEventEnd && nav.fetchStart) {
      metrics.pageLoad = Math.round(nav.loadEventEnd - nav.fetchStart);
    }
    
    // Cumulative Layout Shift (CLS)
    if (timing.layoutShifts && timing.layoutShifts.length > 0) {
      metrics.cumulativeLayoutShift = timing.layoutShifts.reduce((sum, shift) => sum + shift.value, 0);
    }
    
    // DNS Lookup Time
    if (nav.domainLookupEnd && nav.domainLookupStart) {
      metrics.dnsLookup = Math.round(nav.domainLookupEnd - nav.domainLookupStart);
    }
    
    // TCP Connection Time
    if (nav.connectEnd && nav.connectStart) {
      metrics.tcpConnection = Math.round(nav.connectEnd - nav.connectStart);
    }
    
    // SSL Time
    if (nav.secureConnectionStart && nav.secureConnectionStart > 0) {
      metrics.sslTime = Math.round(nav.connectEnd - nav.secureConnectionStart);
    }
    
    return metrics;
  }
  
  static analyzeResources(performanceData) {
    const resources = performanceData.timing?.resources || [];
    const analysis = {
      renderBlocking: [],
      largeResources: [],
      slowResources: [],
      thirdParty: []
    };
    
    resources.forEach(resource => {
      const duration = resource.duration;
      const size = resource.transferSize;
      const url = resource.name;
      
      // Render blocking resources (CSS and synchronous JS in head)
      if ((resource.initiatorType === 'link' || resource.initiatorType === 'script') &&
          resource.startTime < 1000) {
        analysis.renderBlocking.push({
          url,
          duration,
          size,
          type: resource.initiatorType
        });
      }
      
      // Large resources (> 500KB)
      if (size > 500 * 1024) {
        analysis.largeResources.push({
          url,
          size,
          duration,
          type: resource.initiatorType
        });
      }
      
      // Slow resources (> 1s)
      if (duration > 1000) {
        analysis.slowResources.push({
          url,
          duration,
          size,
          type: resource.initiatorType
        });
      }
      
      // Third party resources
      try {
        const resourceUrl = new URL(url);
        const pageUrl = new URL(window.location.href);
        if (resourceUrl.hostname !== pageUrl.hostname) {
          analysis.thirdParty.push({
            url,
            duration,
            size,
            type: resource.initiatorType
          });
        }
      } catch (e) {
        // Invalid URL, skip
      }
    });
    
    return analysis;
  }
  
  static generatePerformanceReport(performanceData) {
    const metrics = this.analyzeMetrics(performanceData);
    const resources = this.analyzeResources(performanceData);
    const issues = this.identifyIssues(metrics, resources, performanceData);
    const suggestions = this.generateSuggestions(metrics, resources);
    
    return {
      metrics,
      resources,
      issues,
      suggestions,
      rawData: performanceData,
      timestamp: Date.now()
    };
  }
  
  static identifyIssues(metrics, resources, performanceData) {
    const critical = [];
    const optimization = [];
    
    // Critical issues
    if (metrics.pageLoad && metrics.pageLoad > 3000) {
      critical.push({
        title: 'Slow Page Load Time',
        narrative: `Page takes ${(metrics.pageLoad / 1000).toFixed(1)} seconds to load, which is above the recommended 3 second threshold.`,
        impact: 'High',
        metric: `Load Time: ${metrics.pageLoad}ms`,
        fix: 'Optimize images, minify CSS/JS, enable compression, and reduce HTTP requests.'
      });
    }
    
    if (resources.largeResources.length > 0) {
      critical.push({
        title: 'Large Resources Detected',
        narrative: `Found ${resources.largeResources.length} resources larger than 500KB that are slowing down page load.`,
        impact: 'High',
        resource: resources.largeResources[0].url,
        fix: 'Compress images, split large JavaScript bundles, and implement lazy loading.'
      });
    }
    
    if (metrics.cumulativeLayoutShift && metrics.cumulativeLayoutShift > 0.1) {
      critical.push({
        title: 'Layout Shift Issues',
        narrative: `Cumulative Layout Shift score of ${metrics.cumulativeLayoutShift.toFixed(3)} indicates visual instability.`,
        impact: 'Medium',
        metric: `CLS: ${metrics.cumulativeLayoutShift.toFixed(3)}`,
        fix: 'Set explicit dimensions for images and videos, avoid inserting content above existing content.'
      });
    }
    
    // Optimization opportunities
    if (resources.renderBlocking.length > 0) {
      optimization.push({
        title: 'Render Blocking Resources',
        narrative: `${resources.renderBlocking.length} resources are blocking the initial render of the page.`,
        impact: 'Medium',
        resource: resources.renderBlocking[0].url,
        fix: 'Use async/defer for non-critical JavaScript and inline critical CSS.'
      });
    }
    
    if (resources.thirdParty.length > 5) {
      optimization.push({
        title: 'Too Many Third Party Requests',
        narrative: `Page makes ${resources.thirdParty.length} third-party requests which can impact performance.`,
        impact: 'Medium',
        fix: 'Minimize third-party scripts, use resource hints, and consider self-hosting critical resources.'
      });
    }
    
    if (metrics.ttfb && metrics.ttfb > 800) {
      optimization.push({
        title: 'Slow Server Response',
        narrative: `Time to First Byte is ${metrics.ttfb}ms, indicating slow server response.`,
        impact: 'Medium',
        timing: `TTFB: ${metrics.ttfb}ms`,
        fix: 'Optimize server response time, use CDN, and implement server-side caching.'
      });
    }
    
    return { critical, optimization };
  }
  
  static generateSuggestions(metrics, resources) {
    const suggestions = [];
    
    suggestions.push({
      category: 'Images',
      title: 'Optimize Images',
      description: 'Use modern image formats like WebP and implement responsive images',
      priority: 'high'
    });
    
    suggestions.push({
      category: 'JavaScript',
      title: 'Code Splitting',
      description: 'Split JavaScript bundles to load only necessary code initially',
      priority: 'medium'
    });
    
    suggestions.push({
      category: 'CSS',
      title: 'Critical CSS',
      description: 'Inline critical CSS and defer non-critical styles',
      priority: 'medium'
    });
    
    suggestions.push({
      category: 'Caching',
      title: 'Browser Caching',
      description: 'Set appropriate cache headers for static resources',
      priority: 'high'
    });
    
    return suggestions;
  }
  
  static createTimeline(performanceData) {
    const timeline = [];
    const timing = performanceData.timing;
    
    if (!timing || !timing.navigation) {
      return timeline;
    }
    
    const nav = timing.navigation;
    const start = nav.fetchStart;
    
    // Navigation timing events
    if (nav.domainLookupStart && nav.domainLookupEnd) {
      timeline.push({
        time: Math.round(nav.domainLookupStart - start),
        event: 'DNS Lookup Start'
      });
      timeline.push({
        time: Math.round(nav.domainLookupEnd - start),
        event: 'DNS Lookup Complete'
      });
    }
    
    if (nav.connectStart && nav.connectEnd) {
      timeline.push({
        time: Math.round(nav.connectStart - start),
        event: 'TCP Connection Start'
      });
      timeline.push({
        time: Math.round(nav.connectEnd - start),
        event: 'TCP Connection Complete'
      });
    }
    
    if (nav.requestStart) {
      timeline.push({
        time: Math.round(nav.requestStart - start),
        event: 'Request Sent'
      });
    }
    
    if (nav.responseStart) {
      timeline.push({
        time: Math.round(nav.responseStart - start),
        event: 'Response Start (TTFB)'
      });
    }
    
    if (nav.responseEnd) {
      timeline.push({
        time: Math.round(nav.responseEnd - start),
        event: 'Response Complete'
      });
    }
    
    if (nav.domContentLoadedEventStart) {
      timeline.push({
        time: Math.round(nav.domContentLoadedEventStart - start),
        event: 'DOM Content Loaded'
      });
    }
    
    if (nav.loadEventStart) {
      timeline.push({
        time: Math.round(nav.loadEventStart - start),
        event: 'Page Load Complete'
      });
    }
    
    // Paint timing
    if (timing.paint) {
      timing.paint.forEach(paint => {
        timeline.push({
          time: Math.round(paint.startTime),
          event: paint.name === 'first-paint' ? 'First Paint' : 'First Contentful Paint'
        });
      });
    }
    
    // Sort by time
    return timeline.sort((a, b) => a.time - b.time);
  }
}
