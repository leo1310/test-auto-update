$( document ).ready(function() {
  localizeOperation.runLocalize();
  loader();
})

function loader() {
  var all = document.getElementsByTagName("*");

  for (var i=0, max=all.length; i < max; i++) {
    checkElement(all[i]);
  }
}

function checkElement(ele) {
  var all = document.getElementsByTagName("*");
  var totalele = all.length;
  var per_inc = 100/all.length;

  if($(ele).on()) {
    var prog_width = per_inc + Number(document.getElementById("progress_width").value);
    
    document.getElementById("progress_width").value = prog_width;
    $("#scale").animate({width:prog_width+"%"}, 100, function() {
      if(document.getElementById("scale")){
        if(document.getElementById("scale").style.width == "100%") {
          document.getElementById("scale").style.width = "0%";
         	document.getElementById("progress_width").value = 0;
          loader();
        }
      }
    });
  } else {
    checkElement(ele);
  }
}
