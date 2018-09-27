$( document ).ready(function() {
  var $ = require('jquery');
  require('malihu-custom-scrollbar-plugin')($);

  var params = {
    udid: deviceUuid,
    client_version: clientVersion,
    token: userToken,
    device_type: deviceType,
    date: dateFormat
  };

  $(".timetable").mCustomScrollbar();
  localizeOperation.runLocalize();
  btnOperation.changeButtonClass();

  scheduleRemoteRequest.getSchedule(params, (result) => {
    var data = JSON.parse(result);

    if (data['success']) {
      data['result']['trains']['train'].forEach(function(el, i) {
        var preparedData = prepareDataForHtml(el['stations']['station']);
        if (Object.keys(preparedData).length) {
          var template =
            '<div class="timetable--row">' +
              '<p class="time js_departure"></p>' +
              '<p class="time-minutes js_route_time_minutes"></p>' +
              '<p class="time js_arrival"></p>' +
            '</div>';
          template = $(template);
          Object.keys(preparedData).forEach(function(el) {
            template.find('.js_' + el).html(preparedData[el]);
          });
          $('.js-' + preparedData['type'] + '-content .js-' + preparedData['type'] + '-content-insert').append(template);
        }
      });
    } else {
      showErrors(data['errors']);
    }
  });

  $('#js-main-page').on('click', function() {
    contentEl.load('index.html')
  })

  $('#js-date-select').on('click', function() {
    contentEl.load('date-select.html')
  })
});

function prepareDataForHtml(stations) {
  var result = {};
  var kyivStationCode = '2200001';
  var boryspilStationCode = '2200064';
  var routeStationCodes = stations.map(function(el) { return el['code'] });

  if (routeStationCodes.includes(boryspilStationCode) && routeStationCodes.includes(kyivStationCode)) {
    var sortedStations = stations.sort(function(a, b) { return a['sequence_number'] - b['sequence_number'] });
    var firstStation = sortedStations[0];
    var lastStation = sortedStations[sortedStations.length - 1];
    var arrivalDate = new Date('1970-01-01T' + lastStation['arrival'] + 'Z');
    var departureDate = new Date('1970-01-01T' + firstStation['departure'] + 'Z');
    if (arrivalDate < departureDate) {
      arrivalDate.setDate(arrivalDate.getDate() + 1);
    }
    var routeTimeMinutes = Math.abs(Math.round((arrivalDate - departureDate)) / 1000 / 60);
    if (firstStation['code'] === kyivStationCode) {
      result['type'] = 'to-boryspil';
    } else {
      result['type'] = 'from-boryspil';
    }
    var splittedDeparture = firstStation['departure'].split(':');
    var splittedArrival= lastStation['arrival'].split(':');
    result['departure'] = splittedDeparture[0] + ':' + splittedDeparture[1];
    result['arrival'] = splittedArrival[0] + ':' + splittedArrival[1];
    result['route_time_minutes'] = routeTimeMinutes + '<span translate="min">' + localizeOperation.translate('min') + '</span>';
  }

  return result;
}

$('#js-to-boryspil-btn').on('click', function (el) {
  var el = $(el.target);

  if (!el.hasClass('active')) {
    el.addClass('active');
  }
  $('#js-from-boryspil-btn').removeClass('active');
  $('.js-to-boryspil-content').show();
  $('.js-from-boryspil-content').hide();
});

$('#js-from-boryspil-btn').on('click', function (el) {
  var el = $(el.target);

  if (!el.hasClass('active')) {
    el.addClass('active');
  }
  $('#js-to-boryspil-btn').removeClass('active');
  $('.js-from-boryspil-content').show();
  $('.js-to-boryspil-content').hide();
});
