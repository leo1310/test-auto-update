exports.runTime = function() {
    startTime();
}

exports.timerOut = function(min, sec) {
    $('#js-timer').html('<div class="timer--item">' + min + '</div><div>:</div><div class="timer--item">' + sec + '</div>');
    timer();
}

exports.getMinutes = function() {
    return minutes;
}

exports.getSeconds = function() {
    return seconds;
}

exports.setTime = function() {
    minutes = 30;
    seconds = 01;
}

exports.killTimer = function() {
    clearTimeout(timerStop);
}

var minutes, seconds, timerStop;

function startTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();

    h = checkTime(h);
    m = checkTime(m);
    document.querySelector('.time').innerHTML = h + ":" + m;
    var t = setTimeout(startTime, 500);
}

function checkTime(i) {
    if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10

    return i;
}

function timer(){
    var presentTime = $('#js-timer').text();
    var timeArray = presentTime.split(':');
    minutes = timeArray[0];
    seconds = checkSecond((timeArray[1] - 1));

    if(seconds == 59) {
        minutes = minutes-1
    }

    if(minutes < 0) {
        alert('Your time is out');
        contentEl.load('index.html');
    }

    $('#js-timer').html('<div class="timer--item">' + minutes + '</div><div>:</div><div class="timer--item">' + seconds + '</div>');
    timerStop = setTimeout(timer, 1000);
}

function checkSecond(sec) {
    if (sec < 10 && sec >= 0) {
        sec = "0" + sec
    }; // add zero in front of numbers < 10
    if (sec < 0) {
        sec = "59"
    };
    return sec;
}
