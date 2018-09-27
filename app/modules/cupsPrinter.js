const Buffer = require('buffer').Buffer;
const fs = require('fs');
const printer = require('printer');
const QRCode = require('qrcode');

exports.printTicketWithQrCode = function(ticketConfig){
  var filepath = '/tmp/' + ticketConfig.qrCode.text + '.jpg';

  var buf = Buffer.from(ticketConfig.ticketImage, 'base64');
  fs.writeFile(filepath, buf, function(error){
    if(error){
      console.log('Error saving tickets file: ' + error);
    } else {
      console.log('File created from base64 string!');
      printer.printFile({
        filename: filepath,
        success:function(jobID){
          console.log("sent to printer with ID: "+jobID);
        },
        error:function(err){
          console.log(err);
        }
      });
    }
  });
}
