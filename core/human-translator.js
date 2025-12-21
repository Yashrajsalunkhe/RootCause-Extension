// Human Language Translator - Converts metrics to narratives
export class HumanTranslator {
  static translate(dependencyAnalysis) {
    const narratives = [];
    
    // Translate Critical Path issues
    if (dependencyAnalysis.criticalPath.primaryBlocker) {
      narratives.push(this.translatePrimaryBlocker(dependencyAnalysis.criticalPath.primaryBlocker));
    }
    
    // Translate Render Blockers
    dependencyAnalysis.renderBlockers.forEach(blocker => {
      narratives.push(this.translateRenderBlocker(blocker));
    });
    
    // Translate Long Tasks
    dependencyAnalysis.longTasks.forEach(task => {
      if (task.impact === 'high' || task.impact === 'medium') {
        narratives.push(this.translateLongTask(task));
      }
    });
    
    // Translate Layout Shifts
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
    
    const commonCauses = [
      'Images without width/height attributes',
      'Ads or embeds injected without reserved space',
      'Web fonts causing FOIT (Flash of Invisible Text)',
      'Dynamically injected content above existing content'
    ];
    
    return {
      type: 'layout-shift',
      title: `Cumulative Layout Shift (CLS)`,
      narrative,
      fix: `Common fixes: (1) Always set width and height on images and videos, (2) Reserve space for ads/embeds with min-height, (3) Use font-display: optional for web fonts, (4) Avoid inserting content above existing content. Inspect specific shift causes: ${commonCauses.join('; ')}.`,
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
