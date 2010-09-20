var SmartReload = new Object();

SmartReload.reloaders = {};

SmartReload.contextMenuHandler = function contextMenuHandler(event) {
  // Generate context menus we ideally want to have
  event.contextMenu.appendContextMenuItem("sr-reload-every", "Reload every 1s");
  event.contextMenu.appendContextMenuItem("sr-reload-every", "Reload every 10s");
  event.contextMenu.appendContextMenuItem("sr-reload-every", "Reload every 1m");
  event.contextMenu.appendContextMenuItem("sr-reload-every", "Reload every 10m");
  event.contextMenu.appendContextMenuItem("sr-reload-every", "Reload every ...");
  event.contextMenu.appendContextMenuItem("sr-reload-on-focus", "Reload on focus");
}

SmartReload.validateHandler = function validateHandler(event) {
  // Check what is current state for the command
  // If the command is in use change it to something like "This page is reloading every 5s." or "This page is reloading on focus."
  alert(event);
  alert(event.command);
}

SmartReload.commandHandler = function commandHandler(event) {
  alert(event);
  alert(event.command);

  // When command is triggered:
  // - save tab to the reloaded tabs list
  // - generate timers to reload pages in the intervals
  // - generate callbacks to tabs which should be reloaded on focus
}

SmartReload.messageHandler = function messageHandler(event) { }


/////////////////////
// Reloading logic //
/////////////////////

// Reloader class which ecapsulate the reloading logic
function Reloader(interval) {
  this.interval = 0;
  this.intervalID = null;
  this.tabs = [];
}

// Finds the index of the passed tab
Reloader.findTabIndex(tab) {
  var index = null;
  for(var i = 0; i < this.tabs.length; i++) {
    if (this.tabs[i] === tab) {
      index = i;
      break;
    }
  }
  return index;
}

// Subscribe one tab from the reloader
Reloader.subscribeTab(tab) {
  if (this.findTabIndex(tab) !== null)
    return;
  
  this.tabs.push(tab);
  if (this.isReloading() === false) {
    this.startReloading();
  }
}

// Unsubscribe one tab from the reloader
Reloader.unSubscribeTab(tab) {
  var tabIndex = this.findTabIndex(tab);
  if (tabIndex === null)
    return;

  this.tabs.splice(tabIndex, 1);
  if (this.isReloading() === true && this.tabs.length == 0) {
    this.stopReloading();
  }
}

// Reloads all tabs associated with the reloader
Reloader.reload() {
  for(var i = 0; i < this.tabs.length; i++) {
    // Reload tab (which will be dispatch to the inline script of the tab)
    this.tabs[i].page.dispatchMessage("sr-reload", null);
  }
}

// Determine if reloader is reloading or not
Reloader.isReloading() {
  this.intervalID !== null
}

// Starts periodically reloading this reloader
Reloader.startReloading() {
  this.intervalID = setInterval(Reloader.reload, this.interval);
}

// Stops reloading of this reloader
Reloader.stopReloading() {
  clearInterval(this.intervalID);
  this.intervalID = null;
}
