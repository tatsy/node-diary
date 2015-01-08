var express = require('express');
var app  = express();
var http = require('http').Server(app);
var io   = require('socket.io')(http);
var fs   = require('fs');
var md   = require('node-markdown').Markdown;
var bp   = require('body-parser');
var path = require('path');
var mp   = require('multiparty');

app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(bp.urlencoded({extended: false}));
app.use(bp.json());

app.get('/', function(req, res) {
    var fields = { code: [''], outfile: ['README.html']}
    res.render('index', {
        fields: fields,
        media: []
    });
});

app.post('/', function(req, res) {
    var form = new mp.Form();
    form.parse(req, function(err, fields, files) {
        console.log(fields);
        var orgname = files.upload[0].originalFilename;
        var tempPath = files.upload[0].path;
        var targetPath = './public/upload/' + orgname;
        fs.rename(tempPath, targetPath, function() {
            if(err) {
                console.log(err);
                throw err;
            }
            fs.unlink(tempPath, function() {
                if(err) {
                    console.log(err);
                    throw err;
                }
            });

            fs.readdir('./public/upload/', function(err, uploadedFiles) {
                res.render('index', {
                    fields: fields,
                    media: uploadedFiles
                });
            });
        });
    });
})

function renderCode(code, next) {
    var html = md(code);
    fs.readdir('./public/upload/', function(err, uploadedFiles) {
        for(var i=1; i<=uploadedFiles.length; i++) {
            var re = new RegExp('%' + i.toString() + '\\(([hw])([0-9]+)\\)');
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

io.on('connection', function(socket) {
    socket.emit('connected', {});

    socket.on('code update', function(code) {
        renderCode(code, function(html) {
            socket.emit('code converted', html);
        });
    });

    socket.on('code save', function(data) {
        renderCode(code, function(html) {
            fs.writeFile('./' + data.outfile, html, function(err) {
                if(err) {
                    console.log("Failed to save HTML file !");
                    throw err;
                }
                console.log('file saved');
            });
        });
    });
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});
