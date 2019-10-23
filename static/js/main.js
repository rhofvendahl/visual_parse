$(document).ready(function() {
    $('#normal').resizable({
        handleSelector: '.splitter',
        resizeHeight: false
    });

    parseTree = new ParseTree();

    experiment = new Experiment();
    experiment.fit();

    var input = $('#text');
    input.val('This is a dependency parse tree. Click, hover and type to explore!');
    console.log(input.val());
    input.focus();
    input.prop('selectionStart', input.val().length);
    input.prop('selectionEnd', input.val().length);

    function updateParseTree(text) {
        // console.log('Main: updating (ParseTree)...')
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
            // console.log(json);
            parseTree.render(json.tokens);
        }).then(function() {
            // console.log('Main: update complete.')
        });
    }

    function updateExperiment(text) {
        // console.log('Main: updating (Experiment)...')
        fetch('/parse_experimental_only', {
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
            // console.log(json);
            experiment.render(json.model);
        }).then(function() {
            // console.log('Main: update complete.')
        });
    }

    function updateAll(text) {
        // console.log('Main: updating (all)...')
        fetch('/parse_experimental_also', {
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
            // console.log(json);
            parseTree.render(json.tokens);
            experiment.render(json.model);
        }).then(function() {
            // console.log('Main: update complete.')
        });
    }

    setTimeout(updateAll, 1700, input.val());
    $('#normal').animate({
        width: '60%'
    }, 2000, function() {
        // update(input.value)
        experiment.fit();
        parseTree.fit();
        // experiment.network.redraw();
        // parseTree.network.redraw();
        // TODO: check 'experimental' box
    });

    // ensures updates aren't constant while user types
    var activeTimeouts = 0;
    input.on('input', function(event) {
        var updated = false;
        if (activeTimeouts == 0) {
            updateAll(input.val()); // executes at start of typing session
            console.log('User starts typing.');
            var updated = true;
        }
        activeTimeouts += 1
        setTimeout(function() {
            activeTimeouts -= 1;
            if (activeTimeouts == 0 && !updated) {
                updateAll(input.val()); // executes to cap off typing session
                console.log('User stops typing.');
            }
        }, 1000)
    });

    setInterval(function() {
        if (activeTimeouts > 1) {
            updateParseTree(input.val()) // executes at intervals during typing session
            console.log('User is typing.');
        }
    }, 200);
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
