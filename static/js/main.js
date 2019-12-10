$(document).ready(function() {
    $('#normal').resizable({
        handleSelector: '.splitter',
        resizeHeight: false
    });

    var input = $('#text');
    input.val('Suzy has had a bad day. Luckily, Sarah was there to give Suzy a hug!');
    input.focus();
    input.prop('selectionStart', input.val().length);
    input.prop('selectionEnd', input.val().length);

    updateManager = new UpdateManager(input);

    updateManager.startUpdating(false);
    setTimeout(updateManager.startUpdating, 1700);
    $('#normal').animate({
        width: '60%'
    }, 2000, function() {
        updateManager.experiment.fit();
    });
});
