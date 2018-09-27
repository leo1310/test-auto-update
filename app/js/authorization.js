var reqlib = require('app-root-path').require;
const {ipcRenderer, remote} = require('electron');
const clock = reqlib('/app/modules/clock.js');
const sessionUser = reqlib('/app/modules/apiRequests/sessionUser.js');
const localizeOperation = reqlib('/app/modules/localize/localizeOperation.js');
const Store = require('electron-store');
const store = new Store();

localizeOperation.runLocalize();
var deviceUuid = store.get('deviceUUID');
var deviceType = store.get('deviceType');

$('#js-auth-send').on('click', function (ev) {
  var postData = {
    udid: deviceUuid,
    client_version: remote.app.getVersion(),
    device_type: deviceType,
    login: $('#js-login-input').val(),
    password: $('#js-password-input').val()
  };

  sessionUser.loginUser(postData, (result) => {
    var data = JSON.parse(result);

    if (data['success']) {
      store.set('userAuthToken', data['result']['token']);
      store.set('userAuthInfo', postData.login + "\n" + postData.password);
      ipcRenderer.send('load-main-window');
    } else {
      showErrors(data['errors']);
    }
  });
});

function showErrors(errors) {
  var log = '';

  errors.map(v => log += v['text'] + '\n');
  alert(log);
}

clock.runTime();
