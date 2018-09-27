global.reqlib = require('app-root-path').require;

const {app, BrowserWindow, ipcMain} = require('electron');
const machineUuid = require('./app/modules/machineUuid.js');
const contentManager = require('./app/modules/contentManager.js');
const Store = require('electron-store');
const store = new Store();
const { autoUpdater } = require('electron-updater');

let win, language = 'uk';

autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

function createWindow() {
  win = new BrowserWindow({
            width: 800,
            height: 600,
            center: true,
            fullscreen: true,
            frame: false})

  loadMainWindow(win);

  machineUuid.generateDeviceUuid()
  // win.webContents.openDevTools()
  win.on('closed', () => {
    win = null
  })
}

function loadMainWindow(win) {
  var deviceType = store.get('deviceType');
  
  if (deviceType == 'cashdesk' && !store.get('userAuthToken')) {
    win.loadFile(contentManager.getPath('authorization', deviceType))
  } else if (store.get('terminal_rsa.private_key')){
    win.loadFile(contentManager.getPath('layout', deviceType))
  } else {
    win.loadFile(contentManager.getPath('registration', deviceType))
  }
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

ipcMain.on('load-main-window', function () {
  loadMainWindow(win)
});

ipcMain.on('change-language', function (event, args) {
  language = args;
});

ipcMain.on('language-chanel', function () {
  win.webContents.send('language-params', language);
});
