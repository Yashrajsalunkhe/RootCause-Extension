// Create the DevTools panel
chrome.devtools.panels.create(
  "RootCause",
  "icons/analytics.png",
  "devtools/panel/panel.html",
  (panel) => {
    console.log("Performance Detective panel created");
  }
);
