var fs       = require('fs');
var util     = require('util');
var marked   = require('marked');
var path     = require('path');
var jade     = require('jade');
var enutils  = require('./en-utils.js');
var am       = require('./article-manager');
var df       = require('./date-formatter');
var mdvideo  = require('./md-video');

marked.setOptions({
    gfm: true,
    tables: true,
    highlight: function(code) {
        return require('highlight.js').highlightAuto(code).value;
    }
});

function getFilesWithCreatedOrder(dir) {
    var files = fs.readdirSync(dir);
    var tuples = {};
    for(var i=0; i<files.length; i++) {
        var stat = fs.statSync(dir + '/' + files[i]);
        var ctime = new Date(stat.ctime).getTime();
        tuples[ctime.toString()] = i;
    }
    var ret = [];
    var keys = Object.keys(tuples);
    keys.sort();
    for(var i=0; i<keys.length; i++) {
        ret.push(files[tuples[keys[i]]]);
    }
    return ret;
}

function isBinary(buf) {
    for(var i=0; i<buf.length; i++) {
        if(buf[i] > 127) return true;
    }
    return false;
}

function renderCode(socket, code, uploadDir, relativeDir) {
    // process js codes
    var re = new RegExp('\\$js([\\s\\S]*?)\\$', 'g');
    try {
        code = code.replace(re, function(match, group) {
            return '<blockquote>' + eval(group) + '</blockquote>';
        });
    } catch(e) {}

    // set video button
    var re = new RegExp('\\[Play\\]');
    code = code.replace(re, '<button class="btn btn-default" type="button" id="playButton" onclick="onClickPlayButton(this);">Play</button>');

    // load uploaded files
    var uploadedFiles = getFilesWithCreatedOrder('./public/' + uploadDir);

    // extend source code file
    for(var i=1; i<=uploadedFiles.length; i++) {
        var re = new RegExp('```([A-Za-z0-9]+?)[ \n\r]*?(%' + i.toString() + ')[ \n\r]*?```');
        var match = null;
        while(match = re.exec(code)) {
            var source = fs.readFileSync('./public/' + uploadDir + '/' + uploadedFiles[i-1]);
            if(!isBinary(source)) {
                source = source.toString('utf-8');
                code = code.replace(re, '```' + match[1] + '\n' + source + '\n```');
            } else {
                break;
            }
        }
    }


    // process media files
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
        uploadedFiles = getFilesWithCreatedOrder('./public/' + uploadDir);
        socket.emit('file list update', uploadedFiles);

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

        socket.on('save evernote', function(articleInfo) {
            var uploadDir = 'articles/' + articleInfo.id + '/upload';
            var noteStore = enutils.getNoteStore();
            var rendered = renderCode(socket, articleInfo.code, uploadDir, uploadDir);
            rendered = enutils.ENMLize(rendered);
            console.log(rendered);
            enutils.makeNote(noteStore, articleInfo.title, rendered, null, function(note){});
        });

        socket.on('disconnect', function() {
            console.log('socket disconnected');
        });
    });
}
