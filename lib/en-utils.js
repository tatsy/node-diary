'use strict';

var fs     = require('fs');
var path   = require('path');
var crypto   = require('crypto');
var jscssp   = require('jscssp');
var Evernote = require('evernote').Evernote;

exports.makeNote = function(noteStore, noteTitle, noteBody, resources, parentNotebook, callback) {
  callback = !callback ? function() {} : callback;

  var nBody = '<?xml version="1.0" encoding="UTF-8"?>';
  nBody += '<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd">';
  nBody += '<en-note>' + noteBody + '</en-note>';

  // Craete note object
  var ourNote = new Evernote.Note();
  ourNote.title = noteTitle;
  ourNote.content = nBody;
  ourNote.resources = resources;

  // parentNotebook is optional; if omitted, default notebook is used
  if (parentNotebook && parentNotebook.guid) {
    ourNote.notebookGuid = parentNotebook.guid;
  }

  // Attempt to create note in Evernote account
  var config = JSON.parse(fs.readFileSync('./config.json').toString());
  noteStore.createNote(config.developerToken, ourNote, function(err) {
    if (err) {
      throw err;
    }

    if (!callback) {
      callback();
    }
  });
};

function getResource(filename) {
  var resource = null;
  var ext = path.extname(filename);
  if (ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.gif') {
    ext = ext.substr(1);
    if (ext === 'jpeg') { ext = 'jpg'; }

    var buf = fs.readFileSync(filename);
    var md5 = crypto.createHash('md5');
    md5.update(buf);
    var data = new Evernote.Data();
    data.size = buf.length;
    data.bodyHash = md5.digest('hex');
    var bufAry = new Uint8Array(buf.length);
    for (var i = 0; i < buf.length; i++) {
      bufAry[i] = buf[i];
    }
    data._body = bufAry;

    resource = new Evernote.Resource();
    resource.data = data;
    resource.mime = 'image/' + ext;
    var attr = new Evernote.ResourceAttributes();
    attr.fileName = filename;
    resource.resourceAttributes = attr;
  }
  return resource;
}

exports.getMediaResources = function(dir) {
  var files = fs.readdirSync(dir);
  var resources = [];
  for (var i = 0; i < files.length; i++) {
    resources.push(getResource(dir + '/' + files[i]));
  }
  return resources;
};

exports.getNoteStore = function() {
  var config = JSON.parse(fs.readFileSync('./config.json').toString());
  var client = new Evernote.Client({
    token: config.developerToken,
    sandbox: config.sandbox
  });
  return client.getNoteStore();
};

function extendCssInline(code) {
  var i, j, match;

  var parser = new jscssp.CSSParser();
  var css = fs.readFileSync('./node_modules/highlight.js/styles/github.css');
  var parsed = parser.parse(css.toString(), false, false);
  var rules = parsed.cssRules;

  var styles = {};
  var regex = /([A-Za-z0-9\.\-\_, ]+)[ ]*?\{([\s\S]+)\}/;
  for (i = 0; i < rules.length; i++) {
    match = regex.exec(rules[i].parsedCssText);
    if (match) {
      var classes = match[1].split(/[ ]*,[ ]*/);
      for (j = 0; j < classes.length; j++) {
        var hljsReg = /^\.(hljs[0-9a-zA-Z\_\-]*)/;
        var hljsMatch = hljsReg.exec(classes[j].trim());
        if (hljsMatch) {
          var classId = hljsMatch[1].trim();
          var styleIn = match[2].trim();
          if (!styles[classId]) {
            styles[classId] = styleIn;
          } else {
            styles[classId] += styleIn;
          }
        }
      }
    }
  }

  var classIds = Object.keys(styles);
  for (i = 0; i < classIds.length; i++) {
    var regStyle = new RegExp('class="' + classIds[i]  + '"');
    match = null;
    do {
      code = code.replace(regStyle, 'style="' + styles[classIds[i]] + '"');
      match = regStyle.exec(code);
    } while (match);
  }
  return code;
}

function removeIdClass(code) {
  var regex = / (id|class)=("|')[\s\S]*?("|')/;
  var match = null;
  do {
    match = regex.exec(code);
    if (match) {
      code = code.replace(regex, '');
    }
  } while (match);
  return code;
}

function enmlize(code) {
  var i, after;

  var enData = {
    enml: '',
    resources: []
  };

  // replace <img> tag to <en-media>
  var regImg = /\<img([\s\S]*?)( \/|)\>/;

  var matchImg;
  do {
    matchImg = regImg.exec(code);
    if (!matchImg) { break; }

    var fields = matchImg[1].split(/[ ]+/);
    var hash = {};
    for (i = 0; i < fields.length; i++) {
      var regData = /(width|height|src)="([\s\S]+)"/;
      var matchData = regData.exec(fields[i]);
      if (matchData) {
        hash[matchData[1]] = matchData[2];
      }
    }
    after = '<en-media';
    if (hash.src) {
      var resource = getResource('./public/' + hash.src.substr(2));
      after += ' type="' + resource.mime + '" hash="' + resource.data.bodyHash + '"';
      enData.resources.push(resource);
    }
    if (hash.width)  { after += ' width="'  + hash.width  + '"'; }
    if (hash.height) { after += ' height="' + hash.height + '"'; }
    after += ' />';
    code = code.replace(regImg, after);
  } while (matchImg);

  // extend highlight.js to inline style
  code = extendCssInline(code);

  // add line numbers to codes
  var regexCode = /\<pre\>\<code class="[\s\S]*?"\>([\s\S]*?)\<\/code\>\<\/pre\>(?!\<\/td\>)/;
  var matchCode;
  do {
    matchCode = regexCode.exec(code);
    if(!matchCode) break;

    var lineno = matchCode[1].split('\n').length;
    var linenoStr = '';
    for (i = 1; i <= lineno; i++) {
      linenoStr += i.toString() + '<br />';
    }
    after = '<table><tr>';
    after += '<td style="color:#ccc; border-right:1px';
    after += ' solid #eee; text-align:right; width: 30px;">' + linenoStr + '</td>';
    after += '<td style="padding-left: 5px;">' + matchCode[0] + '</td>';
    after += '</tr></table>';
    code = code.replace(regexCode, after);
  } while (matchCode);

  // remove 'class' and 'id'
  code = extendCssInline(code);

  // replace single <tag> to <tag />
  var regSingle = /\<(hr)\>/;
  var match = regSingle.exec(code);
  do {
    code = code.replace(regSingle, '<$1 />');
    match = regSingle.exec(code);
  } while (match);

  enData.enml = code;
  return enData;
}

exports.enmlize = enmlize;
exports.removeIdClass = removeIdClass;
