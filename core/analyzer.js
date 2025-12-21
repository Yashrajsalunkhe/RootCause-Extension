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
}
