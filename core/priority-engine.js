// Priority Engine - Creates "Impact-First" Priority List
export class PriorityEngine {
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
    
    // Sort each category by impact
    categorized.critical.sort((a, b) => this.getImpactScore(b) - this.getImpactScore(a));
    categorized.optimization.sort((a, b) => this.getImpactScore(b) - this.getImpactScore(a));
    categorized.micro.sort((a, b) => this.getImpactScore(b) - this.getImpactScore(a));
    
    // Add default messages if categories are empty
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
    // Extract impact time in milliseconds
    const impactMatch = narrative.impact?.match(/([\d.]+)s/);
    if (impactMatch) {
      return parseFloat(impactMatch[1]) * 1000;
    }
    
    // Fallback scoring based on type
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
  
  static addSyntheticIssues(categorized, performanceData) {
    // Add TTFB issue if slow
    const metrics = performanceData.metrics || {};
    const timing = performanceData.timing || {};
    
    if (timing.navigation) {
      const ttfb = timing.navigation.responseStart - timing.navigation.fetchStart;
      
      if (ttfb > 800) {
        categorized.critical.unshift({
          type: 'ttfb',
          title: 'Slow Server Response (TTFB)',
          narrative: `Your server took ${Math.round(ttfb)}ms to send the first byte of the response. This is slow—users are waiting for the server to "wake up" before anything can happen. A fast TTFB should be under 200ms, and yours is ${Math.round(ttfb / 200)}x slower.`,
          fix: `Check your server: (1) Is your database slow? Add indexes or caching. (2) Is your server overloaded? Scale up or optimize. (3) Are you using a CDN? Static HTML should come from edge servers. (4) Reduce server-side processing—defer non-critical work to client-side or background jobs.`,
          metric: `TTFB: ${Math.round(ttfb)}ms`,
          resource: 'Server Response',
          timing: 'First Byte',
          impact: `~${Math.round(ttfb / 100) / 10}s`,
          severity: 'critical'
        });
      } else if (ttfb > 400) {
        categorized.optimization.unshift({
          type: 'ttfb',
          title: 'Server Response Could Be Faster',
          narrative: `Your server response time (TTFB) is ${Math.round(ttfb)}ms. While not terrible, there's room for improvement. Aim for under 200ms for a snappy experience.`,
          fix: `Consider: (1) Adding server-side caching (Redis, Memcached), (2) Using a CDN for static content, (3) Optimizing database queries, (4) Enabling HTTP/2 or HTTP/3.`,
          metric: `TTFB: ${Math.round(ttfb)}ms`,
          resource: 'Server Response',
          impact: `~${Math.round((ttfb - 200) / 100) / 10}s`,
          severity: 'optimization'
        });
      }
    }
    
    // Add memory issue if detected
    if (timing.memory && timing.memory.usedJSHeapSize) {
      const usedMB = timing.memory.usedJSHeapSize / (1024 * 1024);
      const limitMB = timing.memory.jsHeapSizeLimit / (1024 * 1024);
      const percentage = (usedMB / limitMB) * 100;
      
      if (percentage > 80) {
        categorized.critical.push({
          type: 'memory',
          title: 'High Memory Usage',
          narrative: `Your page is using ${Math.round(usedMB)}MB of JavaScript heap memory, which is ${Math.round(percentage)}% of the available limit. This can cause slowdowns, crashes, and poor performance on low-end devices.`,
          fix: `Profile your memory usage to find leaks. Common causes: (1) Not cleaning up event listeners, (2) Keeping references to detached DOM nodes, (3) Large data structures in memory, (4) Circular references preventing garbage collection.`,
          metric: `Memory: ${Math.round(usedMB)}MB / ${Math.round(limitMB)}MB`,
          resource: 'JavaScript Heap',
          impact: 'Performance degradation',
          severity: 'critical'
        });
      } else if (percentage > 60) {
        categorized.optimization.push({
          type: 'memory',
          title: 'Elevated Memory Usage',
          narrative: `Your page is using ${Math.round(usedMB)}MB of memory (${Math.round(percentage)}% of limit). This is manageable but worth monitoring, especially for long-lived single-page apps.`,
          fix: `Monitor for memory leaks. Use Chrome DevTools Memory Profiler to take heap snapshots and identify what's consuming memory.`,
          metric: `Memory: ${Math.round(usedMB)}MB`,
          resource: 'JavaScript Heap',
          impact: 'User experience on low-end devices',
          severity: 'optimization'
        });
      }
    }
    
    return categorized;
  }
}
