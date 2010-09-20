var SmartReloadInline = new Object();

// Reloads current tab/window
SmartReloadInline.reload = function reload() {
  window.location.reload();
}

SmartReloadInline.reportFocus = function reportFocus() {
  console.log("Repoting onFocus event: " + window.location);
  safari.self.tab.dispatchMessage("sr-onfocus-report", {"tab": safari.self.tab});
}

SmartReloadInline.messageHandler = function messageHandler(event) {
  if (event.name === "sr-reload") {
    SmartReloadInline.reload();
  }
  if (event.name === "sr-subscibe-onfocus-reload") {
    var element = document.body;
    element.onfocus = SmartReloadInline.reportFocus;
  }
  if (event.name === "sr-unsubscibe-onfocus-reload") {
    var element = document.body;
    element.onfocus = null;
  }
}

/**
 * Register event listerners
 */
safari.self.addEventListener("message", SmartReloadInline.messageHandler, false);
