$( document ).ready(function() {
  localizeOperation.runLocalize();
  btnOperation.changeButtonClass();

  $('#js-date-select').on('click', function() {
    contentEl.load('date-select.html')
  })

  $('#js-schedule').on('click', function() {
    contentEl.load('schedule.html');
  })
});
