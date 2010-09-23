// Check for the app namespace
var repete;
if (!repete) { throw new Error("Namespace repete doesn't exist!"); }

/**
 * Define extension controller class
 */
repete.Controller = function (options) {
  // New future object
  var obj = {};

  // Object private attributes
  var reloaders = {};
  var commands = {}
  commands[repete.CMD_RELOAD_EVERY_5S] = {
    startLabel: "Reload every 5s",
    stopLabel:  "Stop reloading every 5s",
    interval:   5000
  };
  commands[repete.CMD_RELOAD_EVERY_10S] = {
    startLabel: "Reload every 10s",
    stopLabel:  "Stop reloading every 10s",
    interval:   10000
  };
  commands[repete.CMD_RELOAD_EVERY_1M] = {
    startLabel: "Reload every 1m",
    stopLabel:  "Stop reloading every 1m",
    interval:   60000
  };
  commands[repete.CMD_RELOAD_EVERY_10M] = {
    startLabel: "Reload every 10m",
    stopLabel:  "Stop reloading every 10m",
    interval:   600000
  };
  commands[repete.CMD_RELOAD_ONFOCUS] = {
    startLabel: "Reload on focus",
    stopLabel:  "Stop reloading on focus",
    interval:   0
  };

  // Object private methods
  var getReloaderForCommand = function getReloaderForCommand(command) {
    var interval = commands[command].interval || 0;
    return reloaders[command] || repete.Reloader({"interval": interval});
  }

  var handleCommand = function handleCommand(event) {
    var tab = safari.application.activeBrowserWindow.activeTab;
    var reloader = getReloaderForCommand(event.command);
    if (reloader.isReloadingTab(tab)) {
      reloader.unSubscribeTab(tab)
      if (event.command === repete.MSG_RELOAD_ONFOCUS) {
        tab.page.dispatchMessage(repete.MSG_UNSUBSCRIBE_ONFOCUS, null);
      }
    } else {
      reloader.subscribeTab(tab);
      if (event.command === repete.MSG_RELOAD_ONFOCUS) {
        tab.page.dispatchMessage(repete.MSG_SUBSCRIBE_ONFOCUS, null);
      }
    }
    setReloaderForCommand(event.command, reloader);
  }

  var handleContextMenu = function handleContextMenu(event) {
    for (var cmd in commands) {
      event.contextMenu.appendContextMenuItem(cmd, commands[cmd].startLabel);
    }
  }

  var handleMessage = function handleMessage(event) {
    // Received on focus report for the tab
    if (event.name === repete.MSG_REPORT_ONFOCUS) {
      var tab = safari.application.activeBrowserWindow.activeTab;
      var reloader = getReloaderForCommand(repete.CMD_RELOAD_ONFOCUS);
      if (reloader.isReloadingTab(tab)) {
        tab.page.dispatchMessage(repete.MSG_RELOAD, null);
      }
    }
  }

  var handleValidate = function handleValidate(event) {
    var tab = safari.application.activeBrowserWindow.activeTab;
    if (isTabSubscribed(tab)) {
      var reloader = getReloaderForCommand(event.command);
      if (reloader.isReloadingTab(tab)) {
        event.target.title = commands[event.command].stopLabel;
      } else {
        event.target.disabled = true;
      }
    }
  }

  var isTabSubscribed = function isTabSubscribed(tab) {
    for (var cmd in commands) {
      var reloader = getReloaderForCommand(cmd);
      if (reloader.isReloadingTab(tab)) return true;
    }
    return false;
  }

  var setReloaderForCommand = function setReloaderForCommand(command, reloader) {
    reloaders[command] = reloader;
  }

  // Object public attributes
  obj.reloaders = reloaders;

  // Public interface
  obj.getReloaderForCommand = getReloaderForCommand,
  obj.handleCommand = handleCommand,
  obj.handleContextMenu = handleContextMenu,
  obj.handleMessage = handleMessage,
  obj.handleValidate = handleValidate,
  obj.isTabSubscribed = isTabSubscribed,
  obj.setReloaderForCommand = setReloaderForCommand
  
  // Return our object
  return obj;
}

