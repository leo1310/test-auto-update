const Localize = require('localize');
const {remote} = require('electron');

var basepath = remote.app.getAppPath();
var myLocalize;

exports.localizePage = function(lang) {
  init(lang);
  translate();
}

function init(lang) {	
  myLocalize = new Localize(basepath + "/app");
  myLocalize.setLocale(lang);
}


function translate() {
  var elements = document.querySelectorAll('[translate]');
  
  elements.forEach(element => {
    element.innerHTML = myLocalize.translate(element.getAttribute("translate"));
  })
}

exports.translate_word = function(word) {
  return myLocalize.translate(word);
}