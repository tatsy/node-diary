var fs     = require('fs');
var marked = require('marked');
var path   = require('path');

marked.setOptions({
    gfm: true,
    tables: true,
    highlight: function(code) {
        return require('highlight.js').highlightAuto(code).value;
    }
});

function renderCode(socket, code, next) {

    // process js codes
    var re = new RegExp('\\$js([\\s\\S]*?)\\$', 'g');
    try {
        code = code.replace(re, function(match, group) {
            console.log(match);
            return '<blockquote>' + eval(group) + '</blockquote>';
        });
    } catch(e) {}

    // set video button
    var re = new RegExp('\\[Play\\]');
    code = code.replace(re, '<button type="button" id="playButton" onclick="onClickPlayButton(this);">Play</button>');

    // process media files
    fs.readdir('./public/upload/', function(err, uploadedFiles) {
        if(!uploadedFiles) {
            uploadedFiles = [];
        }

        for(var i=1; i<=uploadedFiles.length; i++) {
            var ext = path.extname(uploadedFiles[i-1]);

            // process images
            if(ext == '.jpg' || ext == '.png' || ext == '.jpeg' || ext == '.gif') {
                var re = new RegExp('%' + i.toString() + '\\(([hw])([0-9]+)\\)', 'g');
                var match = re.exec(code);
                if(match) {
                    var size = match[1] === 'w' ? "width" : "height";
                    imgTag = '<img src="./upload/' + uploadedFiles[i-1]  + '" ' + size + '="$2" />';
                    code = code.replace(re, imgTag);
                }
            }
            // process movies
            else if(ext == '.mp4') {
                var re = new RegExp('%' + i.toString() + '\\(([hw])([0-9]+)\\)', 'g');
                var match = re.exec(code);
                if(match) {
                    var size = match[1] == 'w' ? "width" : "height";
                    movTag = '<video src="./upload/' + uploadedFiles[i-1] + '" ' + size + '="$2" controls></video>';
                    code = code.replace(re, movTag);
                }
            }
        }
        next(marked(code));
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
        renderCode(socket, code, function(html) {
            socket.emit('code converted', html);
        });
    });

    socket.on('code save', function(data) {
        renderCode(socket, data.code, function(html) {
            fs.writeFile('./public/' + data.outfile, html, function(err) {
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
