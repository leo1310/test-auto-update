const holdCardPath = 'insert-card.html';

$( document ).ready(function() {  
  localizeOperation.runLocalize();
  btnOperation.changeButtonClass();

  $('#js-back').on('click', function() {
    contentEl.load('date-select.html');
  })

  $('#js-payment, #js-card-payment').on('click', function() {
    paymentType = 'card';
    sendBuyRequest(holdCardPath);
    btnOperation.removeButtonClass();
  })

  $('#js-cash-payment').on('click', function() {
    paymentType = 'cash';
    sendBuyRequest('cash-payment.html');
    btnOperation.removeButtonClass();
  })

  btnOperation.plus();
  btnOperation.minus();
});

function sendBuyRequest(contentPath) {
  let showCount = $('.display')[0].innerHTML;

  let postData = {
    udid: deviceUuid,
    client_version: clientVersion,
    token: userToken,
    device_type: deviceType,
    date: selectedDate,
    passengers: showCount
  };

  apiBuyTickets.buyTickets(postData, (result) => {
    let data = JSON.parse(result);

    if (data['success']) {
      // clock.setTime();
      // clock.killTimer();
      ticketCount = parseInt(postData.passengers, 10);
      uio = data['result']['uio'];
      price = 0;

      if (ticketCount > 1) {
        data['result']['documents']['document'].forEach(el => {
          price += parseInt(el['costs']['item']['cost']);
        })
      } else {
        price = parseInt(data['result']['documents']['document']['costs']['item']['cost']);
      }      

      if(contentPath == holdCardPath){
        paymentManager.getPayment();
      } else {
        contentEl.load(contentPath);      
      }
    } else {
      showErrors(data['errors'])
    }
  });
}

