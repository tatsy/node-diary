var socket;

$(document).ready(function() {
    socket = io();

    $('#save').click(function(){
        var md = $('#code').val();
        socket.emit('code save', {code: md, outfile: $('#outfile').val()});
        return false;
    });

    $('#code').keyup(function() {
        var md = $('#code').val();
        socket.emit('code update', md);
        return false;
    });

    socket.on('connected', function(data) {
        console.log(data.files);
        $('#media-list').empty();
        $.each(data.files, function() {
            $('#media-list').append($('<li>').text(this));
        });
        var md = $('#code').val();
        socket.emit('code update', md);
    })

    socket.on('code converted', function(html) {
        $('#result').html(html);
    });
});

function onClickPlayButton(button) {
    console.log("click");
    var buttonText = $(button).text();
    console.log(buttonText);
    console.log($(button).parents());
    $.each($(button).parents().find('table').find('video'), function() {
        if(buttonText == "Play") {
            this.play();
        } else {
            this.pause();
        }
    });
    $(this).text(buttonText === "Play" ? "Pause" : "Play");
}
