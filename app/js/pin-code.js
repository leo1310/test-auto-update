$( document ).ready(function() {
  let button = $('#js-confirm');

  button.addClass("btn__disabled");
  localizeOperation.runLocalize();
  btnOperation.changeButtonClass();
  btnOperation.enterNumber();
  clock.timerOut(clock.getMinutes(), clock.getSeconds());

  $('#js-back').on('click', function() {
    clock.killTimer();
    contentEl.load('insert-card.html');
  })

  $('#js-confirm').on('click', function() {
    pincode = $('#js-pin-code').value;
    contentEl.load('loader.html');
  })
});
