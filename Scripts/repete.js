///////////////
// Utilities //
///////////////
Array.prototype.each = function each(func) {
  for(var i = 0; i < this.length; i++) {
    if(func(this[i]) === "__BREAK__") { break; }
  }
  return this;
}

Array.prototype.detect = function detect(func) {
  var match = null;
  this.each(function(e) {
    if (func(e)) { match = e; return "__BREAK__"; }
  });
  return match;
}


////////////////////////////
// GUI & Controller logic //
////////////////////////////

function Repete() {
  this.reloaders = {};
  this.commands = {
    "sr-reload-every-5s":  {"startLabel": "Reload every 5s",  "stopLabel": "Stop reloading every 5s",  "interval": 5000},
    "sr-reload-every-10s": {"startLabel": "Reload every 10s", "stopLabel": "Stop reloading every 10s", "interval": 10000},
    "sr-reload-every-1m":  {"startLabel": "Reload every 1m",  "stopLabel": "Stop reloading every 1m",  "interval": 60000},
    "sr-reload-every-10m": {"startLabel": "Reload every 10m", "stopLabel": "Stop reloading every 10m", "interval": 600000},
    "sr-reload-onfocus":   {"startLabel": "Reload on focus",  "stopLabel": "Stop reloading on focus",  "interval": 0}
  }
}

Repete.prototype.getReloader = function getReloader(command) {
  var interval = this.commands[command].interval || 0;
  return this.reloaders[command] || new Reloader(interval);
}

Repete.prototype.setReloader = function setReloader(command, reloader) {
  this.reloaders[command] = reloader;
}

Repete.prototype.contextMenuHandler = function contextMenuHandler(event) {
  var cmds = new Array(
    "sr-reload-every-5s",
    "sr-reload-every-10s",
    "sr-reload-every-1m",
    "sr-reload-every-10m",
    "sr-reload-onfocus"
  );
  for (var i = 0; i < cmds.length; i++) {
    event.contextMenu.appendContextMenuItem(cmds[i], this.commands[cmds[i]].startLabel);
  }
}

Repete.prototype.validateHandler = function validateHandler(event) {
  var tab = safari.application.activeBrowserWindow.activeTab;
  var reloader = this.getReloader(event.command);
  if (reloader.isReloadingTab(tab)) {
    event.target.title = this.commands[event.command].stopLabel;
  }
}

Repete.prototype.commandHandler = function commandHandler(event) {
  var tab = safari.application.activeBrowserWindow.activeTab;
  var reloader = this.getReloader(event.command);
  if (reloader.isReloadingTab(tab)) {
    reloader.unSubscribeTab(tab)
    if (event.command === "sr-reload-onfocus") {
      tab.page.dispatchMessage("sr-unsubscribe-onfocus-reload", null);
    }
  } else {
    reloader.subscribeTab(tab);
    if (event.command === "sr-reload-onfocus") {
      tab.page.dispatchMessage("sr-subscribe-onfocus-reload", null);
    }
  }
  this.setReloader(event.command, reloader);
}

Repete.prototype.messageHandler = function messageHandler(event) {
  console.log("Event received: " + event);
  // Received on focus report for the tab
  if (event.name === "sr-onfocus-report") {
    var tab = safari.application.activeBrowserWindow.activeTab;
    var reloader = this.getReloader("sr-reload-onfocus");
    if (reloader.isReloadingTab(tab)) {
      tab.page.dispatchMessage("sr-reload", null);
    }
  }
}


/////////////////////
// Reloading logic //
/////////////////////

// Reloader class which ecapsulate the reloading logic
function Reloader(interval) {
  this.interval = interval;
  this.intervalID = null;
  this.tabs = new Array();
}

// Subscribe one tab from the reloader
Reloader.prototype.subscribeTab = function subscribeTab(tab) {
  console.log("Try to subscribe tab: " + tab.title);
  if (this.tabs.detect(function(e) { return e === tab; }) !== null) { return; }
  
  this.tabs.push(tab);
  console.log("Tab: " + tab.title + " subscribed!");
  if (!this.isReloading()) {
    this.startReloading();
  }
}

// Unsubscribe one tab from the reloader
Reloader.prototype.unSubscribeTab = function unSubscribeTab(tab) {
  console.log("Try to unsubscribe tab: " + tab.title);
  if (this.tabs.detect(function(e) { return e === tab; }) === null) { return; }

  this.tabs.splice(this.tabs.indexOf(tab), 1);
  console.log("Tab: " + tab.title + " unsubscribed!");
  console.log(this.isReloading());
  console.log(this.tabs.length == 0);
  if (this.isReloading() && this.tabs.length == 0) {
    this.stopReloading();
  }
}

// Reloads all tabs associated with the reloader
Reloader.prototype.reload = function reload() {
  this.tabs.each(function(tab){
    console.log("Reloading: " + tab.title);
    tab.page.dispatchMessage("sr-reload", null);
  });
}

// Determine if reloader is reloading or not
Reloader.prototype.isReloading = function isReloading() {
  return this.intervalID !== null
}

// Starts periodically reloading this reloader
Reloader.prototype.startReloading = function startReloading() {
  if (this.interval == 0) return;
  var that = this;
  this.intervalID = setInterval(function() {that.reload()}, this.interval);
  console.log("Reloading started with ID: " + this.intervalID);
}

// Stops reloading of this reloader
Reloader.prototype.stopReloading = function stopReloading() {
  console.log("Stopping reloading with ID: " + this.intervalID);
  clearInterval(this.intervalID);
  this.intervalID = null;
}

// Is the tab registered for reloading for the current reloader
Reloader.prototype.isReloadingTab = function isReloadingTab(tab) {
  return this.tabs.detect(function(t) { return t === tab }) !== null;
}
