$(document).ready(function() {
    $('.panel-left').resizable({
        handleSelector: '.splitter',
        resizeHeight: false
    });

    $( '#normal' ).animate({
        width: '50%'
    }, 2000, function() {
        // Animation complete.
    });

    parseTree = new ParseTree();
    experiment = new Experiment();

    var input = document.getElementById('text');
    input.value = 'This is a dependency parse tree. Click, hover and type to explore!';

    var experimental = false;

    function update(text) {
        console.log('Main: updating...')
        if (experimental) {
            fetch('/parse_experimental', {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: text
                })
            }).then(function(response) {
                return response.json();
            }).then(function(json) {
                console.log(json);
                parseTree.render(json.tokens);
                experiment.render(json.model);
            }).then(function() {
                console.log('Main: update complete.')
            });
        } else {
            fetch('/parse', {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: text
                })
            }).then(function(response) {
                return response.json();
            }).then(function(json) {
                console.log(json);
                parseTree.render(json.tokens);
            }).then(function() {
                console.log('Main: update complete.')
            });
        }
    }

    update(input.value)

    input.focus();
    input.selectionStart = input.value.length;
    input.selectionEnd = input.value.length;

    // don't update constantly if timeOuts overlap
    var timeOuts = 0;
    document.oninput = function(event) {
        var updated = false;
        if (timeOuts == 0) {
            update(input.value);
            var updated = true;
        }
        timeOuts += 1
        setTimeout(function() {
            timeOuts -= 1;
            if (timeOuts == 0 && !updated) update(input.value);
        }, 100)
    };

    // update at intervals if timeOuts overlap
    setInterval(function() {
        if (timeOuts > 1) update(input.value)
    }, 100);
});

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
