document.getElementById('open-devtools').addEventListener('click', () => {
  // Get the current tab and send a message to help user
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      // Show a helpful notification
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {
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
            <div style="font-weight: 600; margin-bottom: 4px;">👋 Performance Detective</div>
            <div style="opacity: 0.9;">Press <strong>F12</strong> and look for the "Performance Detective" tab</div>
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
        }
      }).catch(() => {
        // Fallback if script injection fails
        alert('Please open Chrome DevTools (F12 or Cmd+Option+I) and look for the "Performance Detective" tab.');
      });
    }
  });
  
  // Close the popup
  window.close();
});
