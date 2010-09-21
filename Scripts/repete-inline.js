var RepeteInline = new Object();

// Reloads current tab/window
RepeteInline.reload = function reload() {
  window.location.reload();
}

RepeteInline.reportFocus = function reportFocus() {
  safari.self.tab.dispatchMessage("sr-onfocus-report", null);
}

RepeteInline.messageHandler = function messageHandler(event) {
  if (event.name === "sr-reload") {
    RepeteInline.reload();
  }
  if (event.name === "sr-subscribe-onfocus-reload") {
    window.onfocus = RepeteInline.reportFocus;
  }
  if (event.name === "sr-unsubscribe-onfocus-reload") {
    window.onfocus = null;
  }
}

// Always register the on focus callback
window.onfocus = RepeteInline.reportFocus;

// Register event listerners
safari.self.addEventListener("message", RepeteInline.messageHandler, false);
