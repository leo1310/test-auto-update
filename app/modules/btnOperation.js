exports.changeButtonClass = function() {
  var buttons = document.querySelectorAll('.btn');

  $('.btn').each((i, el) => {
    $(el).one('mousedown', function () {
      this.className += ' btn__blue';
    });
  })
}

exports.removeButtonClass = function() {
  var buttons = document.querySelectorAll('.btn');

  buttons.forEach(button => {
    button.classList.remove("btn__blue");
  });
}

exports.plus = function() {
  $('.plus').on('click', function () {
    var showCountEl = document.querySelector('.display');
    var showCount = showCountEl.textContent;
    var sumaEl = document.querySelector('#js-price'); 

    if (parseInt(showCount) < 9) {
      var count = parseInt(showCount) + 1;

      showCountEl.textContent = count;
      sumaEl.textContent = (count * 80).toFixed(2);
    }
  });
}

exports.minus = function() {
  $('.minus').on('click', function () {
    var showCountEl = document.querySelector('.display');
    var showCount = showCountEl.textContent;
    var sumaEl = document.querySelector('#js-price');  

    if (parseInt(showCount) > 1) {
      var count = parseInt(showCount) - 1;

      showCountEl.textContent = count;
      sumaEl.textContent = (count * 80).toFixed(2);
    }
  });
}

// exports.enterNumber = function() {
//   var buttons = document.querySelectorAll('.dial--button');

//   buttons.forEach(button => {
//     button.addEventListener('click', function () {
//       var code = document.querySelector('#js-pin-code');
//       var button = document.getElementById('js-confirm');

//       if (code.value.length < 4 && this.value != '‹') {
//         code.value += this.value;
//       } else if (this.value == '‹') {
//         code.value = code.value.slice(0, -1);
//         button.classList.add("btn__disabled");
//         button.setAttribute("disabled", "disabled");
//       }
//       if (code.value.length == 4) {
//         button.classList.remove("btn__disabled");
//         button.removeAttribute("disabled");
//       }
//     });
//   })
// }

