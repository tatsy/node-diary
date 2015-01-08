var fs     = require('fs');
var marked = require('marked');

function renderCode(code, next) {
    var html = marked(code);
    fs.readdir('./public/upload/', function(err, uploadedFiles) {
        if(!uploadedFiles) {
            uploadedFiles = [];
        }

        for(var i=1; i<=uploadedFiles.length; i++) {
            var re = new RegExp('%' + i.toString() + '\\(([hw])([0-9]+)\\)', 'g');
            var match = re.exec(html);
            if(match) {
                var size = match[1] === 'w' ? "width" : "height";
                imgTag = '<img src="./upload/' + uploadedFiles[i-1]  + '" ' + size + '="$2" />';
                html = html.replace(re, imgTag);
            }
        }
        next(html);
    });
}

exports.on = exports.connection = function (socket) {
    fs.readdir('./public/upload/', function(err, uploadedFiles) {
        if(!uploadedFiles) {
            uploadedFiles = [];
        }
        socket.emit('connected', { files: uploadedFiles });
    });

    socket.on('code update', function(code) {
        renderCode(code, function(html) {
            socket.emit('code converted', html);
        });
    });

    socket.on('code save', function(data) {
        renderCode(code, function(html) {
            fs.writeFile('./' + data.outfile, html, function(err) {
                if(err) {
                    console.log("Failed to save HTML file!");
                    throw err;
                }
                console.log('file saved');
            });
        });
    });

    socket.on('disconnect', function() {
        console.log('socket disconnected');
    });
}
