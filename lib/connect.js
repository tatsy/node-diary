var fs     = require('fs');
var marked = require('marked');
var path   = require('path');

function renderCode(code, next) {

    // process js codes
    var re = new RegExp('\\$js([\\s\\S]*?)\\$', 'g');
    try {
        code = code.replace(re, function(match, group) {
            console.log(match);
            return '<blockquote>' + eval(group) + '</blockquote>';
        });
    } catch(e) {}

    // parse markdown
    var html = marked(code);

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
                var match = re.exec(html);
                if(match) {
                    var size = match[1] === 'w' ? "width" : "height";
                    imgTag = '<img src="./upload/' + uploadedFiles[i-1]  + '" ' + size + '="$2" />';
                    html = html.replace(re, imgTag);
                }
            }
            // process movies
            else if(ext == '.mp4') {
                var re = new RegExp('%' + i.toString() + '\\(([hw])([0-9]+)\\)', 'g');
                var match = re.exec(html);
                if(match) {
                    var size = match[1] == 'w' ? "width" : "height";
                    movTag = '<video src="./upload/' + uploadedFiles[i-1] + '" ' + size + '="$2" controls></video>';
                    html = html.replace(re, movTag);
                }
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
        renderCode(data.code, function(html) {
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
