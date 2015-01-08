var socket;

$(document).ready(function(){
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
