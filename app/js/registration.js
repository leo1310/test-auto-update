var reqlib = require('app-root-path').require;
const {ipcRenderer, remote} = require('electron');
const clock = reqlib('/app/modules/clock.js');
const remoteApi = reqlib('/app/modules/apiRequests/registrateTerminal.js');
const localizeOperation = reqlib('/app/modules/localize/localizeOperation.js');
const Store = require('electron-store');
const store = new Store();
var deviceUuid = store.get('deviceUUID');

localizeOperation.runLocalize();
clock.runTime();
sendRegistrationData();
insertDeviceUuid();

function sendRegistrationData() {
  var uuidInput = document.querySelector('#js-uuid-input');

  $('#js-uuid-send').on('click', function () {
    var postData = {
      udid: deviceUuid,
      client_version: remote.app.getVersion(),
      registration_token: uuidInput.value,
      device_type: $('#js-device-type-input').val()
    };

    remoteApi.registrationDevice(postData, (result) => {
      var data = JSON.parse(result);

      if (data['success']) {
        store.set('terminal_rsa.private_key', data['result']['private_key']);
        store.set('terminal_rsa.public_key', data['result']['public_key']);
        if (data['result']['token']) {
          store.set('userToken', data['result']['token']);
        }
        store.set('deviceType', (data['result']['device_type'] || postData.device_type));
        ipcRenderer.send('load-main-window');
      } else {
        showErrors(data['errors']);
      }
    });
  });
}

function showErrors(errors) {
  var log = '';

  errors.map(v => log += v['text'] + '\n');
  alert(log);
}

function insertDeviceUuid() {
  var uuidEl = document.querySelector('#js-devise-uuid');

  uuidEl.textContent = deviceUuid;
}
