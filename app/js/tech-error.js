$( document ).ready(function() {
  localizeOperation.runLocalize();
  btnOperation.changeButtonClass();
  returnToMainPage();
});

function returnToMainPage() {
  let stopTimer = setTimeout(() => contentEl.load('index.html'), 30000);

  $('#js-retry').on('click', function() {
    paymentManager.stopPayment();
    clearTimeout(stopTimer);
    contentEl.load('index.html');
  })
}
