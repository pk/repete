// Check for the app namespace
var repete;
if (!repete) { throw new Error("Namespace repete doesn't exist!"); }

/**
 * Define extension injected script class
 */
repete.Inline = function (options) {
  var obj = {};

  // Private methods
  var handleMessage = function handleMessage(event) {
    if (event.name === repete.MSG_RELOAD) {
      reload();
    }
    if (event.name === repete.MSG_SUBSCRIBE_ONFOCUS) {
      window.onfocus = reportFocus;
    }
    if (event.name === repete.MSG_UNSUBSCRIBE_ONFOCUS) {
      window.onfocus = null;
    }
  }

  // Reloads current tab/window
  var reload = function reload() {
    window.location.reload();
  }

  // Reports the on-focus event to the GlobalPage
  var reportFocus = function reportFocus() {
    safari.self.tab.dispatchMessage(repete.MSG_REPORT_ONFOCUS, null);
  }

  // Object public attributes

  // Public interface
  obj.handleMessage = handleMessage;
  obj.reload        = reload;
  obj.reportFocus   = reportFocus;

  // Return our object
  return obj;
}

// Create our object
var inline = repete.Inline();

// Always register the on focus callback
window.onfocus = inline.reportFocus;

// Register event listerners
safari.self.addEventListener("message", inline.handleMessage, false);

