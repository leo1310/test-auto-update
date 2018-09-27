// https://www.npmjs.com/package/java
var javaInit = require('./javaInit.js');
var java = javaInit.getJavaInstance();
var BPOSLib = java.import('ua.com.bkc.BPOSLib');
var renderPage, renderResPage;
const timePeriod = 60000;
var bpos = new BPOSLib();

function main() {
  printResult("Main() started!");

  var conn = bpos.CommOpenSync("/dev/ttyACM0", 115200);
  var b = java.newByte(1);
  renderPage = true;
  renderResPage = true;

  printResult("Connection status: " + conn);
  bpos.Purchase(price*100, 0, b);

  waitResult(bpos, timePeriod, function(){
    if(bpos.LastResultSync() == 0){
      waitResult(bpos, timePeriod, function(){
        printResult('Confirmed!');
        waitResult(bpos, timePeriod, function(){
          printResult("RECEIPT: \n" + bpos.ReceiptSync());
          sendPayRequest();
          bpos.CommCloseSync();
        },
        function(){
          printResult('Can not get RECEIPT');
          bpos.CommCloseSync();
        },
        function(){
          bpos.ReqCurrReceipt();
        });
      }, function(){
        printResult('Can not confirm');
        bpos.CommCloseSync();
      },
      function(){
        bpos.Confirm();
      });
    } else {
      printResult('Can not purchase');
      bpos.CommCloseSync();
    }
  }, function(){
    printResult('NAY');
    cancelAndClose();
  });
}

function cancelAndClose(){
  bpos.Cancel();
  bpos.CommCloseSync();
}

function waitResult(bpos, timeout, success, error, execute) {
  var time_step = 250;

  if(typeof(execute) == 'function'){
    execute();
  }

  setTimeout(function () {
    timeout = timeout - time_step;
    if (timeout > 0) {
      if(bpos.LastResultSync() == 2){
        if(renderPage) {
          clock.setTime();
          contentEl.load('insert-card.html');
          renderPage = false;
        }

        if(bpos.LastStatMsgCodeSync() == 1) {
          contentEl.load('loader.html');
        }

        printResult("In progress ...");
        waitResult(bpos, timeout, success, error);

      } else if(bpos.LastResultSync() == 1) {
        contentEl.load('tech-error.html');
        printResult("Error!!!");
        error();

      } else {
        if (renderResPage) {
          contentEl.load('success-pay.html');
          renderResPage = false
        }

        printResult("Success payment!");
        success();
      }
    } else {
      error();
    }
  }, time_step);
}

function printResult(data) {
  addLogs(data)
  addLogs("LastStatMsgCode: " + bpos.LastStatMsgCodeSync());
  addLogs("ResponseCode: " + bpos.ResponseCodeSync());
  addLogs("LastResult: " + bpos.LastResultSync());
  addLogs("LastErrorCode: " + bpos.LastErrorCodeSync());
  addLogs("LastErrorDescription: " + bpos.LastErrorDescriptionSync());
}

function addLogs(data) {
  fileOperation.appendToFile('bpos.log', getDateTime() + " | " + data + "   \n");
}

function getDateTime() {
  var date = new Date();
  var str = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + " " +  date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

  return str;
}

function sendPayRequest() {
  let postData = {
    udid: deviceUuid,
    client_version: clientVersion,
    token: userToken,
    device_type: deviceType,
    uio: uio,
    payment_type: paymentType
  };

  apiPayTickets.payTickets(postData, (result) => {
    let data = JSON.parse(result);

    if (data['success']) {
      let printData = {
        paymentType: paymentType,
        qrCode: data.result.order.documents.qr_image,
        uid: data.result.order.documents.document.uid
      }

      if(deviceType == 'terminal' && typeof(data.result.order.ticket_image) != 'undefined'){
        printData['ticketImage'] = data.result.order.ticket_image;
      }

      printTicket(printData);
    } else {
      errorReason = showErrors(data['errors']);
      setTimeout(() => contentEl.load('fail-pay.html'), 2000);
    }
  });
}

exports.getPayment = function(){
  return main();
}

exports.stopPayment = function(){
  return cancelAndClose();
}
