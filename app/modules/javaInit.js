const {remote} = require('electron');
var basepath = remote.app.getAppPath();

const path = require('path');

let java;

if (path.extname(__dirname.replace('/app/modules', '')) === '.asar') {
  java = require(basepath + '.unpacked/node_modules/java');
  java.classpath.push(basepath + '.unpacked/app/lib/java/src');
} else {
  java = require('java');
  java.classpath.push('./app/lib/java/src');
}

exports.getJavaInstance = function() {
  return java;
}
