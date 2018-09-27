$( document ).ready(function() {
  localizeOperation.runLocalize();
  btnOperation.changeButtonClass();
  returnToMainPage();
  $('#js-errors').html(errorReason);
});

function returnToMainPage() {
  let stopTimer = setTimeout(() => contentEl.load('index.html'), 30000);

  $('#js-back').on('click', function() {
    clearTimeout(stopTimer);
    contentEl.load('index.html')
  })

   $('#js-repeat-pay').on('click', function() {
    clearTimeout(stopTimer);
    contentEl.load('date-select.html')
  })
}

