var fs      = require('fs');
var marked  = require('marked');
var path    = require('path');
var jade    = require('jade');
var am      = require('./article-manager');
var df      = require('./date-formatter');
var mdvideo = require('./md-video');

marked.setOptions({
    gfm: true,
    tables: true,
    highlight: function(code) {
        return require('highlight.js').highlightAuto(code).value;
    }
});

function renderCode(socket, code, uploadDir, relativeDir) {
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
    code = code.replace(re, '<button class="btn btn-default" type="button" id="playButton" onclick="onClickPlayButton(this);">Play</button>');

    // process media files
    var uploadedFiles = fs.readdirSync('./public/' + uploadDir);
    if(!uploadedFiles) {
        uploadedFiles = [];
    }

    for(var i=1; i<=uploadedFiles.length; i++) {
        var re = new RegExp('%' + i.toString(), 'g');
        code = code.replace(re, './' + relativeDir + '/' + uploadedFiles[i-1]);
    }
    code = mdvideo.marked(code);
    return marked(code);
}

exports.on = function (socket) {
    socket.emit('connected', {});

    socket.on('connected', function(articleInfo) {
        var uploadDir = 'articles/' + articleInfo.id + '/upload';
        fs.readdir('./public/' + uploadDir, function(err, uploadedFiles) {
            if(!uploadedFiles) {
                uploadedFiles = [];
            }
            console.log(uploadedFiles);
            socket.emit('file list update', uploadedFiles);
        });

        socket.on('code update', function(code) {
            var html = renderCode(socket, code, uploadDir, uploadDir);
            socket.emit('code converted', html);
        });

        socket.on('code save', function(articleInfo) {
            var relativeDir = 'upload';
            var rendered = renderCode(socket, articleInfo.code, uploadDir, relativeDir);
            console.log(rendered);
            var html = jade.renderFile('./views/article.jade', { title: articleInfo.title, content: rendered });
            fs.writeFileSync(am.dir + articleInfo.id + '/index.html', html);
            fs.writeFileSync(am.dir + articleInfo.id + '/index.md', articleInfo.code);

            var formatDate = df.format((new Date()).getTime());
            socket.emit('code saved', formatDate);
        });

        socket.on('disconnect', function() {
            console.log('socket disconnected');
        });
    });
}
