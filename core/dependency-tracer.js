// Dependency Tracer - Identifies the "Longest Pole in the Tent"
export class DependencyTracer {
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
    // Find resources that loaded before FCP
    const criticalResources = resources.filter(r => {
      return r.responseEnd > 0 && r.responseEnd <= (metrics.fcp || Infinity);
    });
    
    // Sort by response end time
    criticalResources.sort((a, b) => b.responseEnd - a.responseEnd);
    
    // The resource that finished last before FCP is likely the blocker
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
    // Render blocking resources are typically CSS files and synchronous scripts
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
    // In a real implementation, we would use PerformanceObserver for 'longtask'
    // For now, we'll look for scripts with long durations
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
