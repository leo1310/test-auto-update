const fs = require('fs');

exports.appendToFile = function(file_name, data){
  fs.appendFile(file_name, data, function (err) {
    if (err) throw err;
    console.log("New log data was added to file: " + file_name)
  });
}
