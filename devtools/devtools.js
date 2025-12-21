// Cross-browser DevTools panel creation
// Works with Chrome, Firefox, Edge, and Safari

// Browser compatibility layer
const browser = (() => {
  if (typeof chrome !== 'undefined' && chrome.devtools) {
    return chrome;
  }
  if (typeof browser !== 'undefined' && browser.devtools) {
    return browser;
  }
  // Fallback
  return window.browser || window.chrome || {};
})();

// Create the DevTools panel with cross-browser support
if (browser && browser.devtools && browser.devtools.panels) {
  browser.devtools.panels.create(
    "RootCause",
    "icons/analytics.png",
    "devtools/panel/panel.html",
    (panel) => {
      console.log("RootCause panel created");
    }
  );
} else {
  console.warn("DevTools panels API not available in this browser");
}
