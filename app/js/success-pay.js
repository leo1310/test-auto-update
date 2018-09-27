$( document ).ready(function() {
  localizeOperation.runLocalize();
  btnOperation.changeButtonClass();
  returnToMainPage();
});

function returnToMainPage() {
  let stopTimer = setTimeout(() => contentEl.load('index.html'), 30000);

  $('#js-main').on('click', function() {
    clearTimeout(stopTimer);
    contentEl.load('index.html');
  })
}
