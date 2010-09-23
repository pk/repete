// Define our application namespace
var repete;
if (repete) { throw new Error("Namespace repete already exists!"); }

// Define namespace + constants and shared stuff for our extension
repete = {
  // Context menu commands
  'CMD_RELOAD_EVERY_5S': 'repete-reload-every-5s',
  'CMD_RELOAD_EVERY_10S': 'repete-reload-every-10s',
  'CMD_RELOAD_EVERY_1M': 'repete-reload-every-1m',
  'CMD_RELOAD_EVERY_10M': 'repete-reload-every-10m',
  'CMD_RELOAD_ONFOCUS': 'repete-reload-onfocus',
  // Messages
  'MSG_SUBSCRIBE_ONFOCUS': 'repete-subscribe-onfocus-reload',
  'MSG_UNSUBSCRIBE_ONFOCUS': 'repete-unsubscribe-onfocus-reload',
  'MSG_REPORT_ONFOCUS': 'repete-onfocus-report',
  'MSG_RELOAD_ONFOCUS': 'repete-reload-onfocus',
  'MSG_RELOAD': 'repete-reload'
};

