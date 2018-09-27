const machineUuid = require("machine-uuid");
const Store = require('electron-store');
const store = new Store();

exports.generateDeviceUuid = function() {
  if (!store.get('deviceUUID')) {
    machineUuid().then((uuid) => store.set('deviceUUID', uuid.toUpperCase()))
  }
}
