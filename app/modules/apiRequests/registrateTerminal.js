const querystring = require('querystring');
const https = require('https');

exports.registrationDevice = function(data, callback) {
  var postData = querystring.stringify(data);

  var options = {
    hostname: 'core.uz.ttndev.com',
    path: '/mtkd/v1/registration/' + data['device_type'],
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  req = https.request(options, (res) => {
    var result = '';

    res.on('data', function (chunk) {
      result += chunk;
    });

    res.on('end', function () {
      callback(result);
    });
  });

  req.on('error', (e) => {
    console.log(`problem with request: ${e.message}`);
  });

  req.write(postData);
  req.end();
}
