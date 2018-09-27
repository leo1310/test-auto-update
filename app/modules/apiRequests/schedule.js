const querystring = require('querystring');
const https = require('https');

exports.getSchedule = function(data, callback) {
  var params = querystring.stringify(data);

  var options = {
    hostname: 'core.uz.ttndev.com',
    path: '/mtkd/v1/shuttle/schedule?' + params,
    method: 'GET',
    headers: {
      'Accept': 'application/json'
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

  req.write(params);
  req.end();
}
