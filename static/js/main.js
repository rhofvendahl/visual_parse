$(document).ready(function() {
    $('#normal').resizable({
        handleSelector: '.splitter',
        resizeHeight: false
    });

    var input = $('#text');
    input.val('This is a dependency parse tree. Click, hover and type to explore!');
    input.focus();
    input.prop('selectionStart', input.val().length);
    input.prop('selectionEnd', input.val().length);

    updateManager = new UpdateManager(input);

    setTimeout(updateManager.startUpdating, 1700, input.val());
    $('#normal').animate({
        width: '60%'
    }, 2000, function() {
        updateManager.experiment.fit();
        updateManager.parseTree.fit();
    });
});
