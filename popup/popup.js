// Cross-browser popup controller
// Works with Chrome, Firefox, Edge, and Safari

// Browser compatibility layer
const browser = (() => {
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    return chrome;
  }
  if (typeof browser !== 'undefined') {
    return browser;
  }
  // Fallback
  return window.browser || window.chrome || {};
})();

document.getElementById('open-devtools').addEventListener('click', () => {
  // Get the current tab and send a message to help user
  if (browser.tabs?.query) {
    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        // Show a helpful notification
        const injectNotification = () => {
          // Create a temporary notification
          const notification = document.createElement('div');
          notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #1f2937;
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 14px;
            z-index: 999999;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
          `;
          notification.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 4px;">👋 RootCause</div>
            <div style="opacity: 0.9;">Press <strong>F12</strong> and look for the "RootCause" tab</div>
          `;
          document.body.appendChild(notification);
          
          // Add animation
          const style = document.createElement('style');
          style.textContent = '@keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }';
          document.head.appendChild(style);
          
          // Remove after 5 seconds
          setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
          }, 5000);
        };

        // Try to inject script based on browser capabilities
        if (browser.scripting?.executeScript) {
          // Manifest V3 API (Chrome, Edge)
          browser.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: injectNotification
          }).catch(() => {
            // Fallback if script injection fails
            alert('Please open DevTools (F12) and look for the "RootCause" tab.');
          });
        } else if (browser.tabs?.executeScript) {
          // Manifest V2 API (Firefox, older browsers)
          browser.tabs.executeScript(tabs[0].id, {
            code: `(${injectNotification.toString()})()`
          }, () => {
            if (browser.runtime.lastError) {
              alert('Please open DevTools (F12) and look for the "RootCause" tab.');
            }
          });
        } else {
          // No scripting API available
          alert('Please open DevTools (F12) and look for the "RootCause" tab.');
        }
      }
    });
  } else {
    // No tabs API available
    alert('Please open DevTools (F12) and look for the "RootCause" tab.');
  }
  
  // Close the popup
  window.close();
  window.close();
});
