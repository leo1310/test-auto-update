const {ipcRenderer} = require('electron');
const myLocalize = require('./localize.js');

exports.translate = function(word) {
  return myLocalize.translate_word(word);
}

exports.runLocalize = function() {
  changeLanguage();
  getLanguage();
}

function changeLanguage() {
  $('.lang__uk').on('click', function () {
    ipcRenderer.send('change-language', 'uk');
    myLocalize.localizePage('uk');
  });

  $('.lang__en').on('click', function () {   
    ipcRenderer.send('change-language', 'eng');
    myLocalize.localizePage('eng'); 
  });
}

function getLanguage() {
  ipcRenderer.send('language-chanel');
  ipcRenderer.once('language-params', function (event, store) {
    myLocalize.localizePage(store);
  });
}
