$( document ).ready(function() {
  clock.timerOut(clock.getMinutes(), clock.getSeconds());
  localizeOperation.runLocalize();
  btnOperation.changeButtonClass();

  $('#js-back').on('click', function() {
    clock.killTimer();
    paymentManager.stopPayment();
    contentEl.load('select-passengers.html');
  })
});
