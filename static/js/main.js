$(document).ready(function() {
    $('#normal').resizable({
        handleSelector: '.splitter',
        resizeHeight: false
    });

    var input = $('#text');
    input.val('Suzy has had a bad day. Luckily, Sarah was there to hug Suzy! I am glad Suzy has such a good friend.');
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
