exports.getPath = function(pageName, deviceType) {
  var path;
  if (deviceType) {
    path = './app/views/' + deviceType + '/' + pageName + '.html';
  } else {
    path = './app/views/' + pageName + '.html';
  }
  return path;
}
