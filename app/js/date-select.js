var button = $('#js-tickets-count');
var datePicker = $(".datepicker");

$( document ).ready(function() {
  var $ = require('jquery');
  require('jquery-datepicker')($);  
  const {ipcRenderer} = require('electron');
  selectedDate = undefined;

  localizeOperation.runLocalize();
  btnOperation.changeButtonClass();
  button.addClass("btn__disabled");
  UK();
 
  ipcRenderer.once('language-params', function (event, store) {
    datePickerInit(store);
  });

  $('.lang__uk').on('click', function () {
    datePickerInit('uk');
  });

  $('.lang__en').on('click', function () {   
    datePickerInit('');
  });

  datePicker.on("change",function(){
    selectedDate = $(this).val();
    button.removeClass('btn__disabled');
    button.removeAttr("disabled");
  });

  $('#js-main-page').on('click', function() {
    contentEl.load('index.html')
  });

  $(document).on('click', '.ui-datepicker-prev', function () {
    if(button.hasClass('btn__disabled')){
        $('.ui-datepicker-today').removeClass('ui-datepicker-current-day');
      }
  })

  $('#js-tickets-count').on('click', function() {
    contentEl.load('select-passengers.html')
  });
});

function datePickerInit(lang) {
  $.datepicker.setDefaults($.datepicker.regional[lang]);  
  
  datePicker.datepicker('destroy').datepicker({
    firstDay: 1,
    minDate: new Date(),
    dateFormat: "dd/mm/yy",
    maxDate: "+44D",
    defaultDate: selectedDate
  });
  
  if(button.hasClass('btn__disabled')){
    $('.ui-datepicker-today').removeClass('ui-datepicker-current-day');
  }
}

function UK(){
  $.datepicker.regional.uk = {
    currentText: "Сьогодні",
    monthNames: ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
                 "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"],
    monthNamesShort: ["Січ", "Лют", "Бер", "Кві", "Тра", "Чер", "Лип", "Сер", 
                      "Вер", "Жов", "Лис", "Гру"],
    dayNames: ["Неділя", "Понеділок", "Вівторок", "Середа", "Четвер", "П’ятниця", "Субота"],
    dayNamesShort: ["Нед", "Пнд", "Вів", "Срд", "Чтв", "Птн", "Сбт"],
    dayNamesMin: ["Нд", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
    weekHeader: "Тиж"
  };
}
