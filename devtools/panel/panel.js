// Panel JavaScript - Main Controller
// Cross-browser compatibility for Chrome, Firefox, Edge, and Safari

// Browser compatibility layer
const browser = (() => {
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    return chrome;
  }
  if (typeof browser !== 'undefined') {
    return browser;
  }
  // Fallback
  return window.browser || window.chrome || {};
})();

class PerformanceDetective {
  constructor() {
    this.analyzeBtn = document.getElementById('analyze-btn');
    this.loading = document.getElementById('loading');
    this.results = document.getElementById('results');
    this.emptyState = document.getElementById('empty-state');
    
    this.criticalIssues = document.getElementById('critical-issues');
    this.optimizationIssues = document.getElementById('optimization-issues');
    this.timeline = document.getElementById('timeline');
    
    this.pageTitle = document.getElementById('page-title');
    this.pageUrl = document.getElementById('page-url');
    this.criticalCount = document.getElementById('critical-count');
    this.optimizeCount = document.getElementById('optimize-count');
    
    this.init();
  }

  init() {
    this.analyzeBtn.addEventListener('click', () => this.analyze());
  }

  async analyze() {
    this.showLoading();
    
    try {
      // Cross-browser tab ID detection
      const tabId = browser.devtools?.inspectedWindow?.tabId;
      
      if (!tabId) {
        throw new Error('Unable to access inspected window');
      }
      
      const response = await browser.runtime.sendMessage({
        action: 'analyzePerformance',
        tabId: tabId
      });
      
      if (response.success) {
        this.displayResults(response.data);
      } else {
        this.showError(response.error);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      this.showError(error.message);
    }
  }

  showLoading() {
    this.emptyState.classList.add('hidden');
    this.results.classList.add('hidden');
    this.loading.classList.remove('hidden');
    this.analyzeBtn.disabled = true;
  }

  displayResults(data) {
    this.loading.classList.add('hidden');
    this.emptyState.classList.add('hidden');
    this.results.classList.remove('hidden');
    this.analyzeBtn.disabled = false;
    
    // Update page info with cross-browser support
    if (browser.devtools?.inspectedWindow?.eval) {
      browser.devtools.inspectedWindow.eval('window.location.href', (url) => {
        this.pageUrl.textContent = url;
        this.pageTitle.textContent = 'Page Analysis';
      });
    } else {
      this.pageTitle.textContent = 'Page Analysis';
      this.pageUrl.textContent = 'Current Page';
    }
    
    // Update metrics
    if (data.rawData && data.rawData.timing && data.rawData.timing.navigation) {
      const nav = data.rawData.timing.navigation;
      document.getElementById('metric-ttfb').textContent = 
        `${Math.round(nav.responseStart - nav.fetchStart)}ms`;
      
      const fcp = data.rawData.timing.paint?.find(p => p.name === 'first-contentful-paint');
      document.getElementById('metric-fcp').textContent = 
        fcp ? `${Math.round(fcp.startTime)}ms` : '-';
      
      document.getElementById('metric-lcp').textContent = 
        nav.loadEventEnd ? `${Math.round(nav.loadEventEnd - nav.fetchStart)}ms` : '-';
      
      const cls = data.rawData.timing.layoutShifts;
      document.getElementById('metric-cls').textContent = 
        cls && cls.length > 0 ? cls.reduce((sum, s) => sum + s.value, 0).toFixed(3) : '0';
    }
    
    // Clear previous results
    this.criticalIssues.innerHTML = '';
    this.optimizationIssues.innerHTML = '';
    this.timeline.innerHTML = '';
    
    // Populate issues
    if (data.issues) {
      this.criticalCount.textContent = data.issues.critical.length;
      this.optimizeCount.textContent = data.issues.optimization.length;
      
      data.issues.critical.forEach(issue => {
        this.criticalIssues.appendChild(this.createIssueCard(issue));
      });
      
      data.issues.optimization.forEach(issue => {
        this.optimizationIssues.appendChild(this.createIssueCard(issue));
      });
    }
    
    // Populate timeline
    if (data.timeline) {
      data.timeline.forEach(item => {
        this.timeline.appendChild(this.createTimelineItem(item));
      });
    }
  }

  createIssueCard(issue) {
    const card = document.createElement('div');
    card.className = 'issue-card';
    
    card.innerHTML = `
      <div class="issue-card-header">
        <div class="issue-title">${issue.title}</div>
        ${issue.impact ? `<div class="issue-impact-badge">${issue.impact}</div>` : ''}
      </div>
      <div class="issue-narrative">${issue.narrative}</div>
      ${issue.metric || issue.resource || issue.timing ? `
        <div class="issue-meta">
          ${issue.metric ? `<div class="issue-meta-item">📊 ${issue.metric}</div>` : ''}
          ${issue.resource ? `<div class="issue-meta-item">📄 ${issue.resource}</div>` : ''}
          ${issue.timing ? `<div class="issue-meta-item">⏱️ ${issue.timing}</div>` : ''}
        </div>
      ` : ''}
      ${issue.fix ? `
        <div class="issue-fix">
          <div class="issue-fix-title">💡 How to Fix</div>
          <div class="issue-fix-description">${issue.fix}</div>
        </div>
      ` : ''}
    `;
    
    return card;
  }

  createTimelineItem(item) {
    const timelineItem = document.createElement('div');
    timelineItem.className = 'timeline-item';
    
    timelineItem.innerHTML = `
      <div class="timeline-time">${item.time}ms</div>
      <div class="timeline-content">
        <div class="timeline-event">${item.event}</div>
        ${item.resource ? `<div class="timeline-resource">${item.resource}</div>` : ''}
      </div>
    `;
    
    return timelineItem;
  }

  showError(message) {
    this.loading.classList.add('hidden');
    this.analyzeBtn.disabled = false;
    alert(`Analysis Error: ${message}`);
  }
}

// Initialize
const detective = new PerformanceDetective();
