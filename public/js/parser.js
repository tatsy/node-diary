var socket;
var nKeyType = 0;

function codeSave() {
    articleInfo.code = $('#code').val();
    socket.emit('code save', articleInfo);
}

function codeUpdate() {
    socket.emit('code update', $('#code').val());
}

$(document).ready(function() {
    socket = io('/edit');

    $('#save').click(function(){
        codeSave();
        return false;
    });

    $('#evernote').click(function() {
        articleInfo.code = $('#code').val();
        socket.emit('save evernote', articleInfo);
    });

    $('#code').keyup(function() {
        nKeyType++;
        if(nKeyType > 50) {
            codeSave();
            nKeyType = 0;
        }
        codeUpdate();
        return false;
    });

    $('#code').keydown(function(e) {
        if(e.ctrlKey) {
            if(e.keyCode == 83) {
                codeSave();
                return false;
            }
        }
    });

    socket.on('connected', function(data) {
        articleInfo.code = $('#code').val();
        socket.emit('connected', articleInfo);
        codeUpdate();
    });

    socket.on('code saved', function(when) {
        $('#last-saved').text('Last saved: ' + when);
    });

    socket.on('save evernote success', function() {
        alert('Evernote saved');
    });

    socket.on('file list update', function(files) {
        $('#media-list').empty();
        $.each(files, function() {
            $('#media-list').append($('<li>').text(this));
        });
    });

    socket.on('code converted', function(html) {
        $('#result').html(html);
    });
});

function onClickPlayButton(button) {
    var buttonText = $(button).text();
    $.each($(button).parents().find('table').find('video'), function() {
        if(buttonText == "Play") {
            this.play();
        } else {
            this.pause();
        }
    });
    console.log(buttonText);
    $(button).text(buttonText === "Play" ? "Pause" : "Play");
}
