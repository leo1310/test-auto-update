const pad = require('pad');
var reqlib = require('app-root-path').require;
const Store = require('electron-store');
const clock = reqlib('/app/modules/clock.js');
const localizeOperation = reqlib('/app/modules/localize/localizeOperation.js');
const btnOperation = reqlib('/app/modules/btnOperation.js');
const {remote} = require('electron');
const fileOperation = reqlib('/app/modules/fileOperation.js');
const dateFormater = reqlib('/app/modules/dateFormater.js');
const scheduleRemoteRequest = reqlib('/app/modules/apiRequests/schedule.js');
const apiBuyTickets = reqlib('/app/modules/apiRequests/buyTickets.js');
const apiPayTickets = reqlib('/app/modules/apiRequests/payTickets.js');
const contentManager = reqlib('/app/modules/contentManager.js');
const paymentManager = reqlib('/app/modules/paymentManager.js');
const cupsPrinter = reqlib('/app/modules/cupsPrinter.js');

const store = new Store();
let auth = store.get('userAuthInfo');
let authentication;
var selectedDate, ticketCount, price, uio, paymentType, pincode, errorReason;
var contentEl = $('#js-content');
var deviceUuid = store.get('deviceUUID');
var deviceType = store.get('deviceType');
var userToken;
var clientVersion = remote.app.getVersion();
var dateFormat = dateFormater.ddmmyyyy();

// if (auth) {
//   creds = auth.split("\n")

//   authentication = {
//     login: creds[0],
//     password: creds[1]
//   }
// } else {
  authentication = {
    login: 'касир',
    password: '1111111111'
  };
// }
const stationaryPrinter = reqlib('/app/modules/ekkr.js')(authentication);

if (deviceType == 'terminal') {
  userToken = store.get('userToken');
} else if (store.get('userAuthToken')) {
  userToken = store.get('userAuthToken');
}

clock.runTime();
contentEl.load('index.html');

var showErrors = function(errors) {
  var log = '';

  errors.map(v => log += v['text'] + '\n');
  alert(log);
}

var printTicket =  function(configuration) {
  let paymentTypeInt = { 'cash': '0', 'card': '1' };
  let insuranceFee = 0;
  let ticketCost = price * 100 / ticketCount;
  let totalCost = (ticketCount * ticketCost) + (ticketCount * insuranceFee)

  let printer = store.get('deviceType') == 'terminal' ? cupsPrinter : stationaryPrinter.getInstance();
  let ticketConfiguration = {
      route: {
          date: selectedDate.replace(
            /\//g,
            '.'
          )
      },
      terminalInfo: {
        textCase: '1',
        value: 'ТЕРМIНАЛ: 4572',
        modification: '0'
      },
      horizontalLine: {
        textCase: '0',
        value: '------------------------------------------',
        modification: '0'
      },
      ticketUid: {
        textCase: '0', // upper block
        value: configuration.uid,
        modification: '0'
      },
      documentTitle: {
          textCase: '0', // upper block
          value: 'ПОСАДОЧНИЙ ДОКУМЕНТ',
          modification: '1' // weight doubled
      },
      documentValidity: {
          textCase: '0', // upper block
          value: 'ЦЕЙ ДОКУМЕНТ Є ПIДСТАВОЮ ДЛЯ ПРОЇЗДУ',
          modification: '0' // off
      },
      purposeTitle: {
          textCase: '0', // upper block
          value: 'ПРИЗНАЧЕННЯ:',
          modification: '1' // weight doubled
      },
      purposeStartBlock: {
          textCase: '0', // upper block
          value: 'КВИТОК ДIЙСНИЙ В ОБОХ НАПРЯМКАХ МIЖ',
          modification: '0' // off
      },
      purposeEndBlock: {
          textCase: '0', // upper block
          value: 'АЕРОПОРТОМ БОРИСПIЛЬ ТА ВОКЗАЛОМ КИЇВ ПАС',
          modification: '0' // off
      },
      qrCode: {
          text: configuration.qrCode // TODO
      },
      closeTicket: {
          totalCost: pad(
            10,
            totalCost.toString(),
            '0'
          ), // 10 symbols
          paymentType: paymentTypeInt[configuration.paymentType]
          //'0' - cash-payment
          //'1' - e-payment
      },
      fiscalInfo: {
          seatsNumber: pad(
            4,
            ticketCount.toString(),
            '0'
          ),
          tariff: pad(
            9,
            ticketCost.toString(),
            '0'
          ),
          tax: '0', // standard
          taxScheme1: 'А',
          taxScheme2: '0',
          insuranceNumber: pad(
            4,
            ticketCount.toString(),
            '0'
          ),
          insuranceFee: pad(
            9,
            insuranceFee.toString(),
            '0'
          ),
          insuranceTaxScheme1: '0',
          insuranceTaxScheme2: 'З',
      }
  };

  if(typeof(configuration.ticketImage) != 'undefined'){
    ticketConfiguration['ticketImage'] = configuration.ticketImage;
  }

  printer.printTicketWithQrCode(ticketConfiguration);
}
