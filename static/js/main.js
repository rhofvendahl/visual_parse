window.onload = function() {
  window.parseTree = new ParseTree();

  var input = document.getElementById('query');
  parseTree.process(input.value);

  input.focus();
  input.selectionStart = input.value.length;
  input.selectionEnd = input.value.length;

  // don't update constantly if timeOuts overlap
  var timeOuts = 0;
  document.oninput = function(event) {
    var updated = false;
    if (timeOuts == 0) {
      parseTree.process(input.value);
      var updated = true;
    }
    timeOuts += 1
    setTimeout(function() {
      timeOuts -= 1;
      if (timeOuts == 0 && !updated) parseTree.process(input.value);
    }, 100)
  };

  // update at intervals if timeOuts overlap
  setInterval(function() {
    if (timeOuts > 1) parseTree.process(input.value)
  }, 100);
}
