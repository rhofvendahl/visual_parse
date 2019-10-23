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
    input.focus();
    input.prop('selectionStart', input.val().length);
    input.prop('selectionEnd', input.val().length);

    var dirty = false;
    var updating = false;

    function startUpdating() {
        updating = true;
        text = input.val();
        dirty = false;
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
            if (dirty)  {
                startUpdating();
            } else {
                finishUpdating();
            }
        });
    }

    function finishUpdating() {
        updating = false;
        text = input.val();
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
        });
    }

    setTimeout(startUpdating, 1700, input.val());
    $('#normal').animate({
        width: '60%'
    }, 2000, function() {
        experiment.fit();
        parseTree.fit();
    });

    input.on('input', function(event) {
        dirty = true;
        if (!updating) {
            startUpdating();
        }
    });
});
