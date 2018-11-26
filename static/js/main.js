window.onload = function() {
  window.parse = new Parse();

  var input = document.getElementById('query');
  parse.update(input.value);

  //don't update constantly if timeOuts overlap
  var timeOuts = 0;
  input.oninput = function(event) {
    var updated = false;
    if (timeOuts == 0) {
      parse.update(input.value);
      var updated = true;
    }
    timeOuts += 1
    setTimeout(function() {
      timeOuts -= 1;
      if (timeOuts == 0 && !updated) parse.update(input.value);
    }, 100)
  };

  //update at intervals if timeOuts overlap
  setInterval(function() {
    if (timeOuts > 1) parse.update(input.value)
  }, 100);
}
