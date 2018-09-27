let SerialPort = require('serialport');
let legacy = require('legacy-encoding');

let EKKR = function(authentication) {
    var devPath = require('os').platform() == 'darwin' ? '/dev/cu.SLAB_USBtoUART' : '/dev/ttyUSB0';
    this.printer = new SerialPort(
        devPath, {
            baudRate: 115200,
            stopBits: 2,
            parity: 'even',
            dataBits: 8
        }
    );
    this.responseMapping = {
        content: 1,
        length_char: 2
    };
    this.startCode = 253;
    this.endCode = 254;
    this.messageHeader = String.fromCharCode(this.startCode);
    this.messageFooter = String.fromCharCode(this.endCode);
    this.resetSequence = [
        this.messageHeader,
        this.messageHeader,
        this.messageFooter,
        this.messageFooter,
        this.messageFooter,
        this.messageFooter
    ].join('+');

    this.encoding = 'ascii';
    this.responseRegex = new RegExp(
        this.messageHeader + '(.+)(.)' + this.messageFooter
    )
    this.newLineRegex = /[\n\r]/g;
    this.readyForReceive = false;
    this.loginPerformed = false;
    this.logFile = 'ekkr_log.log';
    this.authentication = authentication;

    this.readData();

    this.initializeEkkr();
}

EKKR.prototype.initializeEkkr = function(authentication) {
    this.executeUntilReady(
        this.commandWithoutArgs(this.sendCheckSymbol)
    );
}

EKKR.prototype.executeUntilReady = function(commandInfo) {
    if(this.readyForReceive) {
        return;
    } else {
        commandInfo.command.apply(this, commandInfo.params)

        setTimeout(function() {
                this.executeUntilReady(commandInfo);
            }.bind(this),
            2
        );
    }
}

EKKR.prototype.sendCheckSymbol = function() {
    var message = {
        data: 'U',
        encoding: this.encoding,
        err_msg: 'U symbol not sent',
        success_msg: 'Symbol U sent'
    };

    this.writeDataToEKKR(message);
}

EKKR.prototype.charIncluded = function(data, index) {
    return data.indexOf(index) >= 0;
}

EKKR.prototype.readData = function() {
    var self = this;

    this.printer.on('data', function(data) {
        buffer = data
        var buffersPool = self.parseBufferPackets(data);

        self.showParsedData(buffersPool);
    });
}

EKKR.prototype.constructMessage = function(message) {
    var lengthChar = String.fromCharCode(
        message.length + 1
    );

    this.writeLogs(
        legacy.encode(
            'MESSAGE:' + message,
            'utf-8'
        )
    );

    return Buffer.concat(
        [
            legacy.encode(this.messageHeader, 'binary'),
            legacy.encode(message, '866'),
            legacy.encode(lengthChar, 'binary'),
            legacy.encode(this.messageFooter, 'binary')
        ]
    )
}

EKKR.prototype.writeDataToEKKR = function(message_obj) {
    var self = this;

    this.printer.write(message_obj.data, function(err) {
        if (err) {
            return message_obj.err_msg;
        }
        self.writeLogs(message_obj.success_msg);
    });
}

EKKR.prototype.writeLogs = function(data) {
    fileOperation.appendToFile(
        this.logFile,
        data + "\n"
    );
}

EKKR.prototype.parseBufferPackets = function(buffer) {
    var buffersPool = [],
        currentBuffer = undefined
    self = this;

    buffer.forEach(function(byte) {
        var tempBuffer = Buffer.from([byte]);

        if (byte == self.startCode) {
            currentBuffer = tempBuffer;
        } else if (byte == self.endCode) {
            currentBuffer = Buffer.concat([currentBuffer, tempBuffer]);
            buffersPool.push(currentBuffer);
        } else {
            currentBuffer = Buffer.concat([currentBuffer, tempBuffer]);
        }
    })

    return buffersPool;
}

EKKR.prototype.showParsedData = function(buffersPool) {
    var self = this;

    buffersPool.forEach(function(data) {
        var raw_data = data.toString('binary');
        var matched = raw_data.replace(self.newLineRegex, '').match(self.responseRegex);
        var content = matched[self.responseMapping.content];
        self.switchReceiverState(content);
        self.triggerZReport(content);

        self.writeLogs('Data:' + legacy.decode(content, '866'));
    })

}

EKKR.prototype.switchReceiverState = function(incomingMessage) {
    if (incomingMessage.match(/READY/)) {
        this.readyForReceive = true;
    } else {
        this.readyForReceive = false;
    }
}

EKKR.prototype.triggerZReport = function(incomingMessage) {
    if (incomingMessage.match(/SOFTNREP/)) {
        this.executePoolOfTasks(
          {
              pool: [
                  {
                      command: this.sendFormattedMessage,
                      params: ['NREP']
                  }
              ],
              timeout: 50,
              prependLogin: false
          }
        )
    }
}

EKKR.prototype.sendFormattedMessage = function(message) {
    var message_obj = {
        data: this.constructMessage(message),
        encoding: this.encoding,
        err_msg: 'Message was not sent',
        success_msg: 'Message sent'
    };

    this.writeDataToEKKR(message_obj);
}

EKKR.prototype.sendResetSequence = function() {
    var message_obj = {
        data: this.resetSequence,
        encoding: this.encoding,
        err_msg: 'reset failed',
        success_msg: 'reset successfull'
    };

    this.writeDataToEKKR(message_obj);
}

EKKR.prototype.cashierLogin = function(login, password) {
    this.sendFormattedMessage(
        [
            'UPAS',
            password,
            login
        ].join('')
    ); // login
}

EKKR.prototype.cashierLoginCommand = function(configuration) {
    return {
        command: this.cashierLogin,
        params: [this.authentication.login, this.authentication.password]
    }
}

EKKR.prototype.resetFailedReceipt = function() {
    this.sendFormattedMessage(
        'CANC'
    );
}

EKKR.prototype.resetTxtInput = function(){
    this.sendFormattedMessage(
        'CTXT'
    );
}

EKKR.prototype.openReceipt = function(identifier) {
    printer.sendFormattedMessage( // відкриття чеку
        [
            'PREP',
            identifier // ідентифікатор
        ].join('')
    )
}

EKKR.prototype.registerFiscalInfo = function(item) {
    this.sendFormattedMessage(
        [
            'FISC', // команда
            item.name, // назва
            item.totalPrice, //сума реализації
            item.price, // вартість одиниці товару
            item.quantity, //кількість
            '1', //ознака ділимості
            '0', // схема округлення
            'А02000', // схема податку
            '000000', // схема податку
            '000000', // схема податку
            '000000', // схема податку
            '000000', // схема податку
            '000000', // схема податку
            '000000', // схема податку
            '000000', // схема податку
            item.identifier
        ].join('')
    )
}

EKKR.prototype.closeAndPrintReceipt = function(totalCost) {
    this.sendFormattedMessage(
        [
            'COMP', // команда
            totalCost, // загальна сума по чеку
            '0000000000', // сума повернення
            '0000000000', // сума Безготівкова 3
            '0000000000', // сума Безготівкова 2
            '0000000000', // сума Безготівкова 1
            '0000000000' // Готівка
        ].join('')
    )
}

EKKR.prototype.printZReport = function() {
    this.sendFormattedMessage('NREP') // z звіт
}

EKKR.prototype.switchToWorkMode = function() {
    this.sendFormattedMessage(
        [
            'SVSL', // command
            '1', // mode
            '1111' // pass
        ].join('')
    )
}

EKKR.prototype.switchToProgrammingMode = function() {
    this.sendFormattedMessage(
        [
            'SVSL', // command
            '8', // mode
            '4444' // pass
        ].join('')
    )
}

EKKR.prototype.addText = function(text_obj) {
    this.sendFormattedMessage(
        [
            'TEXT',
            text_obj.case, // register
            '0', // random char 0 | 1
            text_obj.modification,
            text_obj.text
        ].join('')
    )
}

EKKR.prototype.generateQrCode = function(text) {
    this.sendFormattedMessage( // form qr
        [
            'GCQR',
            '10', // scale
            'Q', // correction stratage
            text
        ].join('')
    )
}

EKKR.prototype.addQrCode = function() {
    this.sendFormattedMessage( // print
        [
            'GCPR',
            '1', // after fiscal
            '0',
            '0'
        ].join('')
    )
}

EKKR.prototype.openTicket = function() {
    this.sendFormattedMessage(
        [
            'TKTP',
            '0', // ticket
            '0', // full
            '0' // sell
        ].join('')
    )
}

EKKR.prototype.addRoute = function(configuration) {
    this.sendFormattedMessage(
        [
            'TKRC',
            '09', // from name length
            'БОРИСПIЛЬ', // from name
            '08',
            'Київ Пас',
            '00',
            '00',
            configuration.date
        ].join('')
    )
}

EKKR.prototype.addFiscalInfo = function(ticketInfo) {
    this.sendFormattedMessage(
        [
            'TKSM',
            ticketInfo.seatsNumber,
            ticketInfo.tariff,
            ticketInfo.tax,
            ticketInfo.taxScheme1,
            ticketInfo.taxScheme2,
            ticketInfo.insuranceNumber,
            ticketInfo.insuranceFee,
            ticketInfo.tax,
            ticketInfo.insuranceTaxScheme1,
            ticketInfo.insuranceTaxScheme2,
            '0000000000000000'
        ].join('')
    )
}

EKKR.prototype.closeTicket = function(configuration) {
    this.sendFormattedMessage(
        [
            'TKCL',
            configuration.paymentType,
            configuration.totalPrice
        ].join('')
    )
}

EKKR.prototype.executePoolOfTasks = function(config) {
    if (config.pool.length === 0) {
        this.readyForReceive = true;
        return true;
    }

    if (config.prependLogin && !this.loginPerformed){
        config.pool.unshift(
            this.cashierLoginCommand(authentication)
        );
        this.loginPerformed = true;
    }

    if (this.readyForReceive) {
        var commandInfo = config.pool.shift();

        commandInfo.command.apply(this, commandInfo.params);
        this.readyForReceive = false;
    }

    setTimeout(function() {
            this.executePoolOfTasks(config);
        }.bind(this),
        config.timeout
    );
}

EKKR.prototype.textLineCommand = function(configuration) {
    return {
        command: this.addText,
        params: [{
            case: configuration.textCase,
            modification: configuration.modification,
            text: configuration.value
        }]
    }
}

EKKR.prototype.commandWithoutArgs = function(command) {
    return {
        command: command,
        params: []
    };
}

EKKR.prototype.generateQrCodeCommand = function(configuration) {
    return {
        command: this.generateQrCode,
        params: [configuration.text]
    };
}

EKKR.prototype.closeTicketCommand = function(configuration) {
    return {
        command: this.closeTicket,
        params: [{
            totalCost: configuration.totalCost,
            paymentType: configuration.paymentType
        }]
    };
}

EKKR.prototype.addFiscalInfoCommand = function(configuration) {
    return {
        command: this.addFiscalInfo,
        params: [{
            seatsNumber: configuration.seatsNumber,
            tariff: configuration.tariff,
            tax: configuration.tax,
            taxScheme1: configuration.taxScheme1,
            taxScheme2: configuration.taxScheme2,
            insuranceNumber: configuration.insuranceNumber,
            insuranceFee: configuration.insuranceFee,
            insuranceTaxScheme1: configuration.insuranceTaxScheme1,
            insuranceTaxScheme2: configuration.insuranceTaxScheme2
        }]
    };
}

EKKR.prototype.writeLogsCommand = function(msg) {
    let currentDate = new Date().toISOString();

    return {
        command: this.writeLogs,
        params: [
            currentDate + ': ' + msg + '---------'
        ]
    }
}

EKKR.prototype.addRouteCommand = function(configuration){
    return {
        command: this.addRoute,
        params: [{
            date: configuration.date
        }]
    }
}

EKKR.prototype.printTicketWithQrCode = function(configuration) {
    let syncCommandInfo = this.writeLogsCommand('Ticket start');
    syncCommandInfo.command.apply(this, syncCommandInfo.params);

    this.executePoolOfTasks(
        {
            pool: [
                this.commandWithoutArgs(this.resetFailedReceipt),
                this.commandWithoutArgs(this.resetTxtInput),
                this.textLineCommand(configuration.ticketUid),
                this.textLineCommand(configuration.horizontalLine),
                this.textLineCommand(configuration.documentTitle),
                this.textLineCommand(configuration.documentValidity),
                this.textLineCommand(configuration.horizontalLine),
                this.textLineCommand(configuration.purposeTitle),
                this.textLineCommand(configuration.purposeStartBlock),
                this.textLineCommand(configuration.purposeEndBlock),
                this.textLineCommand(configuration.terminalInfo),
                this.generateQrCodeCommand(configuration.qrCode),
                this.commandWithoutArgs(this.addQrCode),
                this.commandWithoutArgs(this.openTicket),
                this.addRouteCommand(configuration.route),
                this.addFiscalInfoCommand(configuration.fiscalInfo),
                this.closeTicketCommand(configuration.closeTicket),
                this.writeLogsCommand('Ticket end')
            ],
            timeout: 50,
            prependLogin: true
        }
    );
}

let stationaryPrinter = function(authentication) {
    var instance;

    function createInstance() {
        var object = new EKKR(authentication);
        return object;
    }

    return {
        getInstance: function() {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
};

module.exports = function(authentication) {
   return stationaryPrinter(authentication);
}

// var printer = new EKKR({
//     login: 'касир',
//     password: '1111111111'
// });

// receipt

// var receiptPool = [{
//     command: printer.cashierLogin,
//     params: ['касир', '1111111111']
// }, {
//     command: printer.resetFailedReceipt,
//     params: []
// }, {
//     command: printer.openReceipt,
//     params: ['PROMGOODS4']
// }, {
//     command: printer.registerFiscalInfo,
//     params: [{
//         name: 'DRESS WOMEN5',
//         price: '000010232',
//         totalPrice: '000010232',
//         quantity: '00001',
//         identifier: '0120'
//     }]
// }, {
//     command: printer.closeAndPrintReceipt,
//     params: ['0000010232']
// }]
// printer.executePoolOfTasks(receiptPool);


// ticket
// var ticketConfiguration = {
//     route: {
//         date: '22.09.2018'
//     },
//     terminalInfo: {
//       textCase: '1',
//       value: 'ТЕРМIНАЛ: 4572',
//       modification: '0'
//     },
//     horizontalLine: {
//       textCase: '0',
//       value: '------------------------------------------',
//       modification: '0'
//     },
//     documentTitle: {
//         textCase: '0', // upper block
//         value: 'ПОСАДОЧНИЙ ДОКУМЕНТ',
//         modification: '1' // weight doubled
//     },
//     documentValidity: {
//         textCase: '0', // upper block
//         value: 'ЦЕЙ ДОКУМЕНТ Є ПIДСТАВОЮ ДЛЯ ПРОЇЗДУ',
//         modification: '0' // off
//     },
//     purposeTitle: {
//         textCase: '0', // upper block
//         value: 'ПРИЗНАЧЕННЯ:',
//         modification: '1' // weight doubled
//     },
//     purposeStartBlock: {
//         textCase: '0', // upper block
//         value: 'КВИТОК ДIЙСНИЙ В ОБОХ НАПРЯМКАХ МIЖ',
//         modification: '0' // off
//     },
//     purposeEndBlock: {
//         textCase: '0', // upper block
//         value: 'АЕРОПОРТОМ БОРИСПIЛЬ ТА ВОКЗАЛОМ КИЇВ ПАС',
//         modification: '0' // off
//     },
//     qrCode: {
//         text: '008433FG-FD988770-0001'
//     },
//     closeTicket: {
//         totalCost: '0000009175' // 10 symbols
//         paymentType: '0' //cash
//     },
//     fiscalInfo: {
//         seatsNumber: '0002',
//         tariff: '000004550',
//         tax: '0', // standard
//         taxScheme1: 'А',
//         taxScheme2: '0',
//         insuranceNumber: '0001',
//         insuranceFee: '000000075',
//         insuranceTaxScheme1: '0',
//         insuranceTaxScheme2: 'З',
//     }
// };

// printer.printTicketWithQrCode(ticketConfiguration);
