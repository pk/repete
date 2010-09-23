// Check for the app namespace
var repete;
if (!repete) { throw new Error("Namespace repete doesn't exist!"); }

/**
 * Define the Reloader class
 */
repete.Reloader = function (options) {
  // New future object
  var obj = {};

  // Object private attributes
  var intervalID = null;
  var interval   = options.interval;
  var tabs       = [];

  // Utility collection methods
  tabs.each = function each(func) {
    for(var i = 0; i < this.length; i++) {
      if(func(this[i]) === "__BREAK__") { break; }
    }
    return this;
  }

  tabs.detect = function detect(func) {
    var match = null;
    this.each(function(e) {
      if (func(e)) { match = e; return "__BREAK__"; }
    });
    return match;
  }

  // Determine if reloader is reloading or not
  var isReloading = function isReloading() {
    return intervalID !== null;
  }

  // Is the tab registered for reloading for the current reloader
  var isReloadingTab = function isReloadingTab(tab) {
    return tabs.detect(function(t) { return t === tab }) !== null;
  }

  // Reloads all tabs associated with the reloader
  var reload = function reload() {
    tabs.each(function (tab) {
      tab.page.dispatchMessage(repete.MSG_RELOAD, null);
    });
  }

  // Starts periodically reloading this reloader
  var startReloading = function startReloading() {
    if (interval == 0) return;
    intervalID = setInterval(reload, interval);
  }

  // Stops reloading of this reloader
  var stopReloading  = function stopReloading() {
    clearInterval(intervalID);
    intervalID = null;
  }

  // Adds tab to the reloader
  var subscribeTab = function subscribeTab(tab) {
    if (isReloadingTab(tab)) { return; }
    tabs.push(tab);
    if (!isReloading()) { startReloading(); }
  }

  // Removes tab from the reloader
  var unSubscribeTab = function unSubscribeTab(tab) {
    if (!isReloadingTab(tab)) { return; }
    tabs.splice(tabs.indexOf(tab), 1);
    if (isReloading() && tabs.length == 0) { stopReloading(); }
  }

  // Object public attributes
  obj.interval = interval;
  obj.tabs     = tabs;

  // Public interface
  obj.isReloading    = isReloading;
  obj.isReloadingTab = isReloadingTab;
  obj.startReloading = startReloading;
  obj.stopReloading  = stopReloading;
  obj.subscribeTab   = subscribeTab;
  obj.unSubscribeTab = unSubscribeTab;
  
  // Return our object
  return obj;
}

