$( document ).ready(function() {
  localizeOperation.runLocalize();
  btnOperation.changeButtonClass();

  $('#js-back').on('click', function() {
    contentEl.load('select-passengers.html');
  })

  $('#js-print-tickets').on('click', function() {
    if ($('#js-received-cash').prop('checked')) {
      sendPayRequest();
    } else {
      alert(localizeOperation.translate('take_cash_from_customer'))
    }
    btnOperation.removeButtonClass();
  })

  $('.check-container').on('click', function() { 
    if($('#js-received-cash').prop('checked')) {
      $('#js-print-tickets').show();
    } else {
      $('#js-print-tickets').hide();
    }
  });
  
  $('#js-price').text(price);
  $('#js-tickets-count').text(ticketCount);
});

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
      printTicket(
        {
          paymentType: paymentType,
          qrCode: data.result.order.documents.qr_image,
          uid: data.result.order.documents.document.uid
        }
      );
      contentEl.load('success-pay.html')
    } else {
      showErrors(data['errors']);
    }
  });
}
