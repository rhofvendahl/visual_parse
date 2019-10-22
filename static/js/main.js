window.onload = function() {
  parseTree = new ParseTree();

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

// window.onload = function() {
//   visual = new Visual();
//
//   var page = document.getElementById('page');
//   visual.update(page.value);
//   console.log(page);
//   page.focus();
//   // page.selectionStart = page.value.length;
//   // page.selectionEnd = page.value.length;
//
//   var dirty = false;
//   var overload = 0;
//   var maxUpdateFrequency = 1;
//
//   page.oninput = function(event) {
//     dirty = true;
//
//     // update if not overloaded
//     if (overload == 0) {
//       visual.update(page.value)
//       dirty = false;
//
//       // increment overload for a bit after updating
//       overload += 1
//       setTimeout(function() {
//         overload -= 1;
//
//         // update after waiting in case dirty
//         if (dirty) {
//           visual.update(page.value);
//           dirty = false;
//         }
//       }, 1000 / maxUpdateFrequency)
//     }
//   };
// };
//
// // at some point make it so it sends a new request as soon as the old is resolved, or a bit after
