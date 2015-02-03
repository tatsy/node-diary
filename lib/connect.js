'use strict';

var fs       = require('fs');
var jade     = require('jade');
var enutils  = require('./en-utils.js');
var am       = require('./article-manager');
var df       = require('./date-formatter');
var mdvideo  = require('./md-video');
var hljs     = require('highlight.js');

var md     = require('markdown-it')({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch(__) {}
    }

    try {
      return hljs.highlightAuto(str).value;
    } catch(__) {}

    return '';
  }
}).use(require('markdown-it-imsize'));

function getFilesWithCreatedOrder(dir) {
  var i;

  var files = fs.readdirSync(dir);
  var tuples = {};
  for (i = 0; i < files.length; i++) {
    var stat = fs.statSync(dir + '/' + files[i]);
    var ctime = new Date(stat.ctime).getTime();
    tuples[ctime.toString()] = i;
  }
  var ret = [];
  var keys = Object.keys(tuples);
  keys.sort();
  for (i = 0; i < keys.length; i++) {
    ret.push(files[tuples[keys[i]]]);
  }
  return ret;
}

function isBinary(buf) {
  for (var i = 0; i < buf.length; i++) {
    if (buf[i] > 127) { return true; }
  }
  return false;
}

function processJSCode(code) {
  // process js codes
  var re = /\$js([\s\S]*?)\$/g;
  try {
    code = code.replace(re, function(m, g) {
      return '<blockquote>' + eval(g) + '</blockquote>';
    });
  } catch(err) {
    throw err;
  }
  return code;
}

function setPlayButton(code) {
  // set video button
  var re = /\[Play\]/;
  code = code.replace(re, '<button class="btn btn-default" type="button" id="playButton" onclick="onClickPlayButton(this);">Play</button>');
  return code;
}

function renderCode(code, uploadDir, relativeDir) {
  code = processJSCode(code);
  code = setPlayButton(code);

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
  return md.render(code);
}

function onConnection(socket) {
  socket.emit('connected', {});

  socket.on('connected', function(articleInfo) {
    var uploadDir = 'articles/' + articleInfo.id + '/upload';
    uploadedFiles = getFilesWithCreatedOrder('./public/' + uploadDir);
    socket.emit('file list update', uploadedFiles);

    socket.on('code update', function(code) {
      var html = renderCode(code, uploadDir, uploadDir);
      socket.emit('code converted', html);
    });

    socket.on('code save', function(articleInfo) {
      var relativeDir = 'upload';
      var rendered = renderCode(articleInfo.code, uploadDir, relativeDir);
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
      var rendered = renderCode(articleInfo.code, uploadDir, uploadDir);
      var evData = enutils.ENMLize(rendered);
      enutils.makeNote(noteStore, articleInfo.title, evData.enml, evData.resources, null, function() { socket.emit('save evernote success') });
    });

    socket.on('disconnect', function() {
      console.log('socket disconnected');
    });
  });
}

exports.on            = onConnection;
exports.isBinary      = isBinary;
exports.processJSCode = processJSCode;
exports.setPlayButton = setPlayButton;
exports.renderCode    = renderCode;
